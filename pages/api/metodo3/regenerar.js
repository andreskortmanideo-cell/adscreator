import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { anuncioId, analisisConfirmado, estructuraConfirmada, palabrasClaveOriginales, guionOriginal, modelo, autor, correccionUsuario } = req.body || {}
    const analisis = analisisConfirmado || {}
    const estructura = Array.isArray(estructuraConfirmada) ? estructuraConfirmada : []
    const palabrasClave = Array.isArray(palabrasClaveOriginales)
      ? palabrasClaveOriginales.map(p => (p || '').toString().trim()).filter(Boolean)
      : []
    if (estructura.length === 0) {
      return res.status(400).json({ error: 'estructuraConfirmada requerida' })
    }
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()

    // ── FIX 5 — longitud objetivo: similar al original (±10% de palabras) ──
    const guionOrig = (guionOriginal || '').toString().trim()
    const palabrasOriginal = guionOrig ? guionOrig.split(/\s+/).filter(Boolean).length : 0
    const minPalabras = Math.floor(palabrasOriginal * 0.9)
    const maxPalabras = Math.ceil(palabrasOriginal * 1.1)
    const reglaLongitud = palabrasOriginal > 0
      ? `REGLA DE LONGITUD (CRÍTICA):
- El guion original tiene ${palabrasOriginal} palabras. Cada nueva versión debe tener entre ${Math.floor(palabrasOriginal * 0.9)} y ${Math.ceil(palabrasOriginal * 1.1)} palabras.
- NO infles el contenido. NO agregues frases nuevas que no estuvieran en la estructura del original.
- Mantén una longitud SIMILAR al original (margen ±10%).`
      : `REGLA DE LONGITUD (CRÍTICA):
- Las versiones nuevas deben tener una longitud SIMILAR al original (margen ±10% de palabras).
- NO infles el contenido. NO agregues frases nuevas que no estuvieran en la estructura del original.`

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    const estructuraTxt = estructura
      .map((s, i) => `${i + 1}. ${(s.funcion || '').toString()}${s.ejemplo ? `\n   (ejemplo del original: "${s.ejemplo}")` : ''}`)
      .join('\n')
    const palabrasTxt = palabrasClave.length > 0
      ? palabrasClave.map(p => '- ' + p).join('\n')
      : '(el análisis no listó palabras clave; igual evita copiar frases literales del original)'

    // ── LLAMADA ÚNICA — 2 versiones nuevas, misma estructura ─────
    let prompt = `Eres redactor experto en publicidad. Te doy una ESTRUCTURA narrativa validada, un análisis estratégico, y una lista de PALABRAS CLAVE del original que NO debes reutilizar.

Tu tarea: generar 2 VERSIONES NUEVAS del guion que sigan EXACTAMENTE la misma estructura pero con contenido y palabras DIFERENTES.

ANÁLISIS ESTRATÉGICO (mantén estos valores):
- Avatar: ${(analisis.avatar || '').toString()}
- Producto: ${(analisis.producto || '').toString()}
- Formato: ${(analisis.formato || '').toString()}
- Duración: ${(analisis.duracion || '').toString()}
- Nivel: ${analisis.nivel != null ? String(analisis.nivel) : ''}
- Motivo: ${(analisis.motivo || '').toString()}
- Ángulo: ${(analisis.angulo || '').toString()}
- Tono: ${(analisis.tono || '').toString()}

ESTRUCTURA OBLIGATORIA (sigue paso a paso):
${estructuraTxt}

PALABRAS Y FRASES DEL ORIGINAL QUE NO PUEDES USAR (evítalas o usa sinónimos/reformulaciones):
${palabrasTxt}

REGLAS DE ORO:
1. Cada versión nueva DEBE cumplir TODOS los pasos de la estructura en el mismo orden.
2. NO uses NINGUNA de las palabras clave listadas. Usa sinónimos o reformulaciones naturales.
3. Mantén el mismo motivo, ángulo, nivel, tono.
4. Las 2 versiones nuevas deben ser DIFERENTES entre sí (no clones).
5. Si el nivel es 1 o 2, NO menciones producto en ninguna versión (igual que el original).
6. Si el nivel es 3, 4 o 5, SÍ puedes mencionar producto.
7. Hook de cada versión: 5-9 palabras ideal, máximo 9.
8. Idea visual (cada versión): escena CONCRETA estilo TikTok/Reels que detenga el scroll en 0.5s (drama, pattern interrupt, POV, reacción extrema). NO uses jerga audiovisual (no 'close-up', 'plano', 'movimiento de cámara'). NO escenas tranquilas/casuales.
9. Español colombiano cotidiano, SIN regionalismos de España, México, Argentina (NO 'flipar', NO 'tío', NO 'cool', NO 'guay', NO 'che', NO 'pinche'). Palabras OK: bacano, chévere, qué nota, increíble, no más, qué berraquera.
10. Respetar políticas de Meta (no violencia gráfica, no claims médicos extremos, no menores inapropiados, no engaño).

REGLA DE APARICIÓN DEL PRODUCTO (CRÍTICA PARA NIVELES 3, 4, 5):
- El producto debe MENCIONARSE o INTRODUCIRSE en los primeros 5-7 segundos del guion (aproximadamente palabras 15-20 del texto).
- NO esperes más de la mitad del guion para mencionar el producto.
- La estructura ideal es: dolor breve (5s) → mención del producto/descubrimiento (5-7s) → demostración + beneficios → CTA.
- Si el nivel es 1 o 2 esta regla NO aplica (porque no se menciona producto).

${reglaLongitud}

OUTPUT JSON ESTRICTO:
{
  "versiones": [
    {
      "numero": 1,
      "hook": "el hook (5-9 palabras)",
      "guionCompleto": "guion completo de la versión 1, listo para copiar",
      "ideaVisual": "escena concreta y simple en 1-2 frases naturales",
      "palabrasOriginalEvitadas": ["lista de palabras del original que sí evitaste exitosamente"],
      "estructuraSeguida": "confirma brevemente cómo cubriste los pasos de la estructura"
    },
    { "numero": 2 }
  ]
}

Devuelve EXACTAMENTE 2 objetos dentro de "versiones".`

    // ── PARTE 6 — corrección opcional del usuario (regenerar con ajuste) ──
    if (correccionUsuario && correccionUsuario.toString().trim()) {
      prompt += '\n\nCORRECCIÓN DEL USUARIO (aplica este ajuste a las 2 versiones, manteniendo la estructura y el análisis): ' + correccionUsuario.toString().trim()
    }

    const r = await llamarModelo(modeloSel, prompt, 3500)
    registrarLlamada('metodo3-regeneracion', r.inputTokens, r.outputTokens)

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudieron interpretar las versiones generadas: ' + e.message })
    }
    const versiones = Array.isArray(parsed.versiones) ? parsed.versiones.slice(0, 2).map((v, i) => ({
      numero: v.numero != null ? Number(v.numero) : (i + 1),
      hook: (v.hook || '').toString(),
      guionCompleto: (v.guionCompleto || '').toString(),
      ideaVisual: (v.ideaVisual || '').toString(),
      palabrasOriginalEvitadas: Array.isArray(v.palabrasOriginalEvitadas)
        ? v.palabrasOriginalEvitadas.map(p => (p || '').toString())
        : [],
      estructuraSeguida: (v.estructuraSeguida || '').toString()
    })) : []
    if (versiones.length === 0) {
      return res.status(502).json({ error: 'El modelo no devolvió versiones nuevas' })
    }

    // ── PARTE 5 — Validador post-respuesta: avisar si una versión infla la longitud ──
    if (palabrasOriginal > 0) {
      versiones.forEach((v, i) => {
        const palabras = (v.guionCompleto || '').split(/\s+/).filter(Boolean).length
        if (palabras > maxPalabras * 1.2) {
          console.log(`[M3 VALIDADOR] Versión ${i + 1} muy larga (${palabras} vs max ${maxPalabras}). Considera reintento.`)
        }
      })
    }

    // ── Auto-save: suma versión de regeneración al anuncio ───────
    let idAnuncio = anuncioId ? Number(anuncioId) : null
    try {
      if (!idAnuncio) {
        // Defensivo: si el análisis no creó anuncio, lo creamos ahora.
        idAnuncio = crearAnuncio({
          autor: (autor || '').toString().trim() || 'Anónimo',
          producto: (analisis.producto || 'Reestructurar').toString().slice(0, 200),
          avatar: (analisis.avatar || '').toString().slice(0, 300),
          formato: (analisis.formato || '').toString(),
          duracion: (analisis.duracion || '').toString(),
          nivel: analisis.nivel != null ? String(analisis.nivel) : '',
          motivo: (analisis.motivo || '').toString(),
          angulo: (analisis.angulo || '').toString(),
          modelo: modeloSel,
          metodoPrincipal: 'metodo3',
          briefingJson: { modo: 'metodo3' }
        })
      }
      agregarVersion(idAnuncio, {
        tipo: 'metodo3-regeneracion',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido: {
          modo: 'metodo3',
          m3Paso: 3,
          m3Analisis: analisis,
          m3Estructura: estructura,
          m3PalabrasClave: palabrasClave,
          m3Versiones: versiones
        }
      })
    } catch (e) {
      console.error('Auto-save Método 3 (regeneración) falló:', e)
    }

    return res.status(200).json({ versiones, costoOperacion, anuncioId: idAnuncio })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
