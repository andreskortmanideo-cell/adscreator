import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { guionGanador, contextoAdicional, modelo, autor } = req.body || {}
    if (!guionGanador || !guionGanador.toString().trim()) {
      return res.status(400).json({ error: 'guionGanador requerido' })
    }
    const guion = guionGanador.toString().trim()
    const contexto = (contextoAdicional || '').toString().trim()
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    // ── LLAMADA ÚNICA — desmonte de estructura + palabras clave ──
    const prompt = `Eres analista experto en publicidad. Te dan un guion ganador VALIDADO. Tu tarea es desmontarlo en su esqueleto estratégico para que se pueda reproducir su estructura sin copiar palabras.

GUION GANADOR:
${guion}

CONTEXTO ADICIONAL del usuario:
${contexto || 'No proporcionado'}

DOCTRINA DE 5 NIVELES SCHWARTZ (úsala para el análisis):
NIVEL 1 — Inconsciente: NO menciona producto. Síntomas normalizados.
NIVEL 2 — Consciente del problema: NO menciona producto. Valida dolor.
NIVEL 3 — Consciente de la solución: SÍ puede mostrar producto como descubrimiento.
NIVEL 4 — Consciente del producto: comparativas + beneficios + prueba social.
NIVEL 5 — Totalmente consciente: oferta/urgencia.

REGLA: si menciona producto/marca → 3, 4 o 5. Si no → 1 o 2.

TU TAREA:
1. Identifica avatar, producto (si está claro), formato (video/imagen), duración estimada, nivel, motivo (Emocional/Funcional/Educativo/Aspiracional/Racional), ángulo (uno de los 16), tono.
2. Desmonta la ESTRUCTURA NARRATIVA en pasos secuenciales (típicamente entre 4 y 8 pasos). Cada paso es una UNIDAD FUNCIONAL del guion. Ejemplos de pasos:
   - "Hook con dato impactante"
   - "Validación del problema con escenas específicas"
   - "Pregunta retórica que conecta con el avatar"
   - "Introducción de la solución como descubrimiento"
   - "Lista de beneficios concretos"
   - "Testimonio o prueba social"
   - "Comparación con la alternativa"
   - "CTA con urgencia"
3. Identifica PALABRAS Y FRASES CLAVE DISTINTIVAS del original que NO deberían reutilizarse en una versión nueva (sustantivos específicos, verbos potentes, adjetivos memorables, frases hechas, expresiones únicas). NO incluyas palabras genéricas (el, la, de, y, etc.).
4. Asume que la nueva versión podría usar SINÓNIMOS o reformulaciones de esas palabras clave.

OUTPUT JSON ESTRICTO:
{
  "analisis": {
    "avatar": "...",
    "producto": "...",
    "formato": "video o imagen",
    "duracion": "segundos estimados si es video",
    "nivel": "1, 2, 3, 4 o 5",
    "motivo": "uno de los 5",
    "angulo": "uno de los 16",
    "tono": "...",
    "razonamiento": "explicación breve citando frases del guion"
  },
  "estructura": [
    { "paso": 1, "funcion": "qué función cumple este paso", "ejemplo": "frase del original que ilustra este paso (sin copiar todo, solo evidencia)" },
    { "paso": 2, "funcion": "...", "ejemplo": "..." }
  ],
  "palabrasClave": ["palabra1", "palabra2", "frase distintiva 1", "expresión clave"]
}

REGLAS OBLIGATORIAS:
- nivel, motivo, ángulo SIEMPRE con valor (no vacíos).
- estructura entre 4 y 8 pasos.
- palabrasClave entre 8 y 20 elementos.`

    const r = await llamarModelo(modeloSel, prompt, 2800)
    registrarLlamada('metodo3-analisis', r.inputTokens, r.outputTokens)

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudo interpretar el análisis del guion: ' + e.message })
    }
    const analisis = parsed.analisis || {}
    const estructura = Array.isArray(parsed.estructura)
      ? parsed.estructura.map((s, i) => ({
          paso: s.paso != null ? Number(s.paso) : (i + 1),
          funcion: (s.funcion || '').toString(),
          ejemplo: (s.ejemplo || '').toString()
        }))
      : []
    const palabrasClave = Array.isArray(parsed.palabrasClave)
      ? parsed.palabrasClave.map(p => (p || '').toString().trim()).filter(Boolean)
      : []
    if (estructura.length === 0) {
      return res.status(502).json({ error: 'El modelo no logró desmontar la estructura del guion' })
    }

    // ── Auto-save: crea el anuncio + guarda versión de análisis ──
    let anuncioId = null
    try {
      anuncioId = crearAnuncio({
        autor: (autor || '').toString().trim() || 'Anónimo',
        producto: (analisis.producto || ('Reestructurar — ' + guion.slice(0, 60))).toString().slice(0, 200),
        avatar: (analisis.avatar || '').toString().slice(0, 300),
        formato: (analisis.formato || '').toString(),
        duracion: (analisis.duracion || '').toString(),
        nivel: analisis.nivel != null ? String(analisis.nivel) : '',
        motivo: (analisis.motivo || '').toString(),
        angulo: (analisis.angulo || '').toString(),
        modelo: modeloSel,
        metodoPrincipal: 'metodo3',
        briefingJson: { modo: 'metodo3', guionInput: guion, contexto }
      })
      agregarVersion(anuncioId, {
        tipo: 'metodo3-analisis',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido: {
          modo: 'metodo3',
          m3Paso: 2,
          m3GuionInput: guion,
          m3Contexto: contexto,
          m3Analisis: analisis,
          m3Estructura: estructura,
          m3PalabrasClave: palabrasClave
        }
      })
    } catch (e) {
      console.error('Auto-save Método 3 (análisis) falló:', e)
    }

    return res.status(200).json({ analisis, estructura, palabrasClave, costoOperacion, anuncioId })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
