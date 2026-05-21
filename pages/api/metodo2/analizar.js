import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'
import { CRITERIOS_MOTIVOS, CRITERIOS_ANGULOS, CRITERIOS_NIVELES } from '../../../lib/criterios-analisis'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { textoConHook, textoConCuerpo, contextoAdicional, modelo, autor } = req.body || {}
    if (!textoConHook || !textoConHook.toString().trim()) {
      return res.status(400).json({ error: 'textoConHook requerido' })
    }
    if (!textoConCuerpo || !textoConCuerpo.toString().trim()) {
      return res.status(400).json({ error: 'textoConCuerpo requerido' })
    }
    const txtHook = textoConHook.toString().trim()
    const txtCuerpo = textoConCuerpo.toString().trim()
    const contexto = (contextoAdicional || '').toString().trim()
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    // ── LLAMADA ÚNICA — extracción de límites + compatibilidad ───
    const prompt = `Eres analista experto en publicidad. Te dan 2 textos:
- TEXTO_1 (de aquí extraes SOLO el hook): ${txtHook}
- TEXTO_2 (de aquí extraes SOLO el cuerpo, sin su propio hook): ${txtCuerpo}

CONTEXTO ADICIONAL del usuario:
${contexto || 'No proporcionado'}

DEFINICIONES ESTRICTAS:
- HOOK: las primeras 1-2 frases CORTAS e impactantes que detienen el scroll. Generalmente 1 línea, 5-9 palabras. NO incluye contexto adicional ni explicación.
- CUERPO: TODO el contenido que va después del hook. Incluye desarrollo del problema, presentación de solución, beneficios, prueba social, CTA.

TU TAREA:
1. Del TEXTO_1, extrae SOLO el hook (corto, 5-9 palabras ideal). NO te lleves más de lo que es estrictamente el gancho.
2. Del TEXTO_2, primero identifica su propio hook (1-2 primeras frases impactantes) y DESCÁRTALO. Luego extrae todo el resto como cuerpo.
3. Analiza ambos contenidos para detectar:
   - Avatar de cada uno (¿son el mismo avatar? ¿son compatibles?)
   - Producto al que se refieren (¿es el mismo? ¿es compatible?)
   - Nivel de consciencia (Schwartz 1-5)
   - Motivo de cada uno (Emocional, Funcional, Educativo, Aspiracional, Racional)
   - Ángulo
4. Evalúa COMPATIBILIDAD: ¿el hook y el cuerpo van a fusionarse coherentemente? Si hay mismatch grave (avatar diferente, producto diferente, niveles muy distintos), márcalo.

APLICA ESTOS CRITERIOS DETERMINÍSTICOS:

${CRITERIOS_NIVELES}

${CRITERIOS_MOTIVOS}

${CRITERIOS_ANGULOS}

USA ESTAS DEFINICIONES PARA IDENTIFICAR el motivo, ángulo y nivel de cada texto. NO improvises ni intuyas. Aplica las reglas de desempate. Si las señales son claras, decide rápidamente.

OUTPUT JSON ESTRICTO:
{
  "hookExtraido": "el hook puro del TEXTO_1 (5-9 palabras ideal)",
  "cuerpoExtraido": "el cuerpo del TEXTO_2 sin su propio hook",
  "hookDescartado": "el hook del TEXTO_2 que se descartó (para que el usuario sepa qué se removió)",
  "analisisHook": {
    "avatar": "...",
    "producto": "...",
    "nivel": "1-5",
    "motivo": "uno de los 5",
    "angulo": "uno de los 16",
    "tono": "...",
    "razonamiento": "cita las señales específicas de los criterios que llevaron a cada decisión. Ej: 'Detecté Nivel 2 porque ...si llegas cansado... es problema sin solución.'"
  },
  "analisisCuerpo": {
    "avatar": "...",
    "producto": "...",
    "nivel": "1-5",
    "motivo": "uno de los 5",
    "angulo": "uno de los 16",
    "tono": "...",
    "razonamiento": "cita las señales específicas de los criterios que llevaron a cada decisión. Ej: 'Detecté Nivel 3 porque ...descubrí esta pulverizadora... menciona el producto.'"
  },
  "compatibilidad": {
    "nivel": "alta|media|baja",
    "razones": "explicación corta de por qué son o no compatibles",
    "advertencias": ["lista de cosas que el usuario debería saber, ej: 'el hook es nivel 2 (no menciona producto) pero el cuerpo es nivel 4 (menciona producto). Habrá una transición abrupta'"]
  }
}

REGLAS OBLIGATORIAS:
- Todos los campos SIEMPRE deben tener valor.
- nivel: siempre 1, 2, 3, 4 o 5.
- motivo y angulo: siempre uno de las listas.
- razonamiento: SIEMPRE cita las señales específicas de los criterios y las frases concretas del texto que las disparan.
- Si dudas, aplica las reglas de desempate de los criterios.`

    const r = await llamarModelo(modeloSel, prompt, 2600)
    registrarLlamada('metodo2-analisis', r.inputTokens, r.outputTokens)

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudo interpretar el análisis: ' + e.message })
    }
    const hookExtraido = (parsed.hookExtraido || '').toString().trim()
    const cuerpoExtraido = (parsed.cuerpoExtraido || '').toString().trim()
    const hookDescartado = (parsed.hookDescartado || '').toString().trim()
    const analisisHook = parsed.analisisHook || {}
    const analisisCuerpo = parsed.analisisCuerpo || {}
    const compatibilidad = parsed.compatibilidad || { nivel: 'media', razones: '', advertencias: [] }
    if (!Array.isArray(compatibilidad.advertencias)) compatibilidad.advertencias = []
    if (!hookExtraido && !cuerpoExtraido) {
      return res.status(502).json({ error: 'El modelo no logró extraer el hook ni el cuerpo' })
    }

    // ── Auto-save: crea el anuncio + guarda versión de análisis ──
    let anuncioId = null
    try {
      anuncioId = crearAnuncio({
        autor: (autor || '').toString().trim() || 'Anónimo',
        producto: ((analisisCuerpo.producto || analisisHook.producto || ('Fusión — ' + hookExtraido))).toString().slice(0, 200),
        avatar: (analisisCuerpo.avatar || analisisHook.avatar || '').toString().slice(0, 300),
        nivel: analisisCuerpo.nivel != null ? String(analisisCuerpo.nivel) : '',
        motivo: (analisisCuerpo.motivo || '').toString(),
        angulo: (analisisCuerpo.angulo || '').toString(),
        modelo: modeloSel,
        metodoPrincipal: 'metodo2',
        briefingJson: { modo: 'metodo2', textoConHook: txtHook, textoConCuerpo: txtCuerpo, contexto }
      })
      agregarVersion(anuncioId, {
        tipo: 'metodo2-analisis',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido: {
          modo: 'metodo2',
          m2Paso: 2,
          m2TextoHook: txtHook,
          m2TextoCuerpo: txtCuerpo,
          m2Contexto: contexto,
          m2HookExtraido: hookExtraido,
          m2CuerpoExtraido: cuerpoExtraido,
          m2HookDescartado: hookDescartado,
          m2AnalisisHook: analisisHook,
          m2AnalisisCuerpo: analisisCuerpo,
          m2Compatibilidad: compatibilidad
        }
      })
    } catch (e) {
      console.error('Auto-save Método 2 (análisis) falló:', e)
    }

    return res.status(200).json({
      hookExtraido, cuerpoExtraido, hookDescartado,
      analisisHook, analisisCuerpo, compatibilidad,
      costoOperacion, anuncioId
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
