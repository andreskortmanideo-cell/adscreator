import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { anuncioId, hookConfirmado, cuerpoConfirmado, analisisCompatibilidad, modelo, autor, correccionUsuario } = req.body || {}
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
    let prompt = `Eres editor experto en publicidad. Te doy un HOOK y un CUERPO que vienen de guiones distintos. Tu tarea es FUSIONARLOS en una sola pieza coherente.

HOOK (NO modificar, NI UNA PALABRA):
${hook}

CUERPO (NO modificar, NI UNA PALABRA):
${cuerpo}

REGLAS DE FUSIÓN (CRÍTICAS):
1. NO cambies ni una palabra del HOOK.
2. NO cambies ni una palabra del CUERPO.
3. POR DEFECTO: une el hook y el cuerpo SIN agregar nada en medio. La fusión más limpia es la mejor.
4. SOLO agrega 1-2 palabras o una frase corta de transición SI Y SOLO SI:
   - Hay un quiebre claro de tema entre hook y cuerpo
   - El hook habla de algo y el cuerpo cambia bruscamente de contexto
   - Sin transición se siente forzado o incoherente leer las dos partes seguidas
5. En la MAYORÍA de los casos, NO se necesita transición. El hook y el cuerpo conectan naturalmente cuando hablan del mismo producto/avatar/problema.
6. Usa español colombiano cotidiano (NO regionalismos de España, México, Argentina).

EJEMPLOS:

CASO 1 — NO agregar transición (los dos textos conectan naturalmente):
HOOK: "Compré esta depiladora y ahora esas rozaduras ya no existen."
CUERPO: "Yo pasaba rozándome todo el día, incómodo en reuniones..."
FUSIÓN CORRECTA: "Compré esta depiladora y ahora esas rozaduras ya no existen. Yo pasaba rozándome todo el día, incómodo en reuniones..."
FUSIÓN INCORRECTA (transición innecesaria): "...ya no existen. Pero déjame contarte por qué funciona tan diferente. Yo pasaba..."

CASO 2 — SÍ agregar transición (quiebre temático):
HOOK: "Compré esto y cambió mi vida."
CUERPO: "Los técnicos de motos te dirán que esto es imposible..."
FUSIÓN CORRECTA: "Compré esto y cambió mi vida. Mira por qué. Los técnicos de motos te dirán que esto es imposible..."

REGLA DE ORO: si dudas, NO agregues transición. Es mejor una fusión limpia que una con relleno innecesario.

CONSIDERACIONES DE COMPATIBILIDAD:
${compatTxt}

Si las advertencias indican mismatch (ej: niveles distintos), suaviza la transición sin contradecir ninguna parte.

OUTPUT JSON ESTRICTO:
{
  "guionFusionado": "el texto completo: hook + (transición si aplica) + cuerpo, listo para copiar",
  "transicionAgregada": "si NO agregaste transición pon exactamente 'Ninguna'; si agregaste, pon la frase exacta que agregaste",
  "notas": "comentario breve sobre cómo quedó la fusión"
}`

    // ── PARTE 6 — corrección opcional del usuario (regenerar con ajuste) ──
    if (correccionUsuario && correccionUsuario.toString().trim()) {
      prompt += '\n\nCORRECCIÓN DEL USUARIO (aplica este ajuste al guion fusionado, respetando hook y cuerpo): ' + correccionUsuario.toString().trim()
    }

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
