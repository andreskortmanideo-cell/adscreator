import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { anuncioId, hookConfirmado, cuerpoConfirmado, analisisCompatibilidad, modelo, autor } = req.body || {}
    const hook = (hookConfirmado || '').toString().trim()
    const cuerpo = (cuerpoConfirmado || '').toString().trim()
    if (!hook) return res.status(400).json({ error: 'hookConfirmado requerido' })
    if (!cuerpo) return res.status(400).json({ error: 'cuerpoConfirmado requerido' })
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()
    const compatTxt = analisisCompatibilidad
      ? (typeof analisisCompatibilidad === 'string' ? analisisCompatibilidad : JSON.stringify(analisisCompatibilidad))
      : 'No proporcionada'

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    // ── LLAMADA ÚNICA — fusión hook + cuerpo ─────────────────────
    const prompt = `Eres editor experto en publicidad. Te doy un HOOK y un CUERPO que vienen de guiones distintos. Tu tarea es FUSIONARLOS en una sola pieza coherente.

HOOK (NO modificar, NI UNA PALABRA):
${hook}

CUERPO (NO modificar, NI UNA PALABRA):
${cuerpo}

REGLAS DE FUSIÓN (CRÍTICAS):
1. NO cambies ni una palabra del HOOK.
2. NO cambies ni una palabra del CUERPO.
3. SOLO puedes:
   - Agregar 1-2 frases CORTAS de transición entre el hook y el cuerpo si la conexión es abrupta.
   - Ajustar puntuación (punto, coma, salto de línea) entre las dos partes.
4. La transición (si la agregas) debe sentirse natural, NO forzada.
5. Si el hook y el cuerpo se conectan naturalmente, NO agregues nada. Simplemente únelos.
6. Usa español colombiano cotidiano (NO regionalismos de España, México, Argentina).

CONSIDERACIONES DE COMPATIBILIDAD:
${compatTxt}

Si las advertencias indican mismatch (ej: niveles distintos), suaviza la transición sin contradecir ninguna parte.

OUTPUT JSON ESTRICTO:
{
  "guionFusionado": "el texto completo: hook + (transición si aplica) + cuerpo, listo para copiar",
  "transicionAgregada": "la frase de transición que agregaste, o 'Ninguna' si no agregaste nada",
  "notas": "comentario breve sobre cómo quedó la fusión"
}`

    const r = await llamarModelo(modeloSel, prompt, 3000)
    registrarLlamada('metodo2-fusion', r.inputTokens, r.outputTokens)

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudo interpretar la fusión: ' + e.message })
    }
    const guionFusionado = (parsed.guionFusionado || '').toString().trim()
    const transicionAgregada = (parsed.transicionAgregada || 'Ninguna').toString().trim()
    const notas = (parsed.notas || '').toString().trim()
    if (!guionFusionado) {
      return res.status(502).json({ error: 'El modelo no devolvió el guion fusionado' })
    }

    // ── Auto-save: suma versión de fusión al anuncio ─────────────
    let idAnuncio = anuncioId ? Number(anuncioId) : null
    try {
      if (!idAnuncio) {
        // Defensivo: si el análisis no creó anuncio, lo creamos ahora.
        idAnuncio = crearAnuncio({
          autor: (autor || '').toString().trim() || 'Anónimo',
          producto: ('Fusión — ' + hook).toString().slice(0, 200),
          modelo: modeloSel,
          metodoPrincipal: 'metodo2',
          briefingJson: { modo: 'metodo2' }
        })
      }
      agregarVersion(idAnuncio, {
        tipo: 'metodo2-fusion',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido: {
          modo: 'metodo2',
          m2Paso: 3,
          m2HookExtraido: hook,
          m2CuerpoExtraido: cuerpo,
          m2Compatibilidad: (analisisCompatibilidad && typeof analisisCompatibilidad === 'object') ? analisisCompatibilidad : null,
          m2GuionFusionado: guionFusionado,
          m2TransicionAgregada: transicionAgregada,
          m2Notas: notas
        }
      })
    } catch (e) {
      console.error('Auto-save Método 2 (fusión) falló:', e)
    }

    return res.status(200).json({ guionFusionado, transicionAgregada, notas, costoOperacion, anuncioId: idAnuncio })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
