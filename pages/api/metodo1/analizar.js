import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'
import { CRITERIOS_MOTIVOS, CRITERIOS_ANGULOS, CRITERIOS_NIVELES } from '../../../lib/criterios-analisis'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { guionCompleto, contextoAdicional, modelo, autor } = req.body || {}
    if (!guionCompleto || !guionCompleto.toString().trim()) {
      return res.status(400).json({ error: 'guionCompleto requerido' })
    }
    const guion = guionCompleto.toString().trim()
    const contexto = (contextoAdicional || '').toString().trim()
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    // ── LLAMADA ÚNICA — Ingeniería inversa con doctrina de niveles ─
    const prompt = `Eres analista experto en publicidad digital. Te dan un guion publicitario y opcionalmente contexto adicional. Tu tarea es hacer INGENIERÍA INVERSA y devolver JSON estricto.

GUION:
${guion}

CONTEXTO ADICIONAL (info que el usuario sabe sobre el guion):
${contexto || 'No proporcionado'}

APLICA ESTOS CRITERIOS DETERMINÍSTICOS:

${CRITERIOS_NIVELES}

${CRITERIOS_MOTIVOS}

${CRITERIOS_ANGULOS}

USA ESTAS DEFINICIONES PARA IDENTIFICAR el motivo, ángulo y nivel. NO improvises ni intuyas. Aplica las reglas de desempate. Si las señales son claras, decide rápidamente.

ANALIZA y responde SOLO con este JSON estricto:
{
  "analisis": {
    "avatar": "descripción del avatar (edad, género aprox, ocupación, pain point)",
    "producto": "qué producto se está promoviendo (si se puede inferir o si está en el contexto adicional)",
    "formato": "video o imagen",
    "duracion": "si es video, duración estimada en segundos",
    "nivel": "1, 2, 3, 4 o 5 (un solo número)",
    "motivo": "uno de: Emocional, Funcional, Educativo, Aspiracional, Racional",
    "angulo": "uno de los 16 ángulos: Problema/Dolor, Beneficio/Resultado, Curiosidad, Urgencia/Escasez, Autoridad/Prueba Social, Novedad, Comparación/Contraste, Enemigo en Común, Historia, Transformación, FOMO, Simplicidad, Ironía/Provocación, Precio/Valor, Exclusividad, Aspiracional",
    "tono": "descripción breve del tono",
    "razonamiento": "explicación breve (2-3 frases) que CITE las señales específicas de los criterios que llevaron a cada decisión. Ej: 'Detecté Nivel 3 porque la frase ...descubrí esta pulverizadora... menciona el producto. Detecté Funcional porque ...mira cómo con 40 centímetros... es demostrativo. Detecté Beneficio/Resultado porque ...en menos de 5 minutos mi motor brilla... muestra resultado logrado.'"
  },
  "hookOriginal": "primeras 1-2 frases impactantes del guion",
  "cuerpo": "todo el resto del guion sin omitir nada, palabra por palabra"
}

REGLAS OBLIGATORIAS DE OUTPUT:
- nivel: SIEMPRE elige un número del 1 al 5. NUNCA dejes vacío.
- motivo: SIEMPRE elige UNO de: Emocional, Funcional, Educativo, Aspiracional, Racional. NUNCA dejes vacío. Si dudas entre dos, elige el dominante.
- angulo: SIEMPRE elige UNO de los 16 ángulos. NUNCA dejes vacío. Si dudas, elige el más prominente.
- producto: si NO se puede inferir, escribe "No identificado en el guion (especificar en contexto adicional)".
- razonamiento: SIEMPRE explica por qué elegiste ese nivel/motivo/ángulo, citando las señales específicas de los criterios y las frases concretas del guion que las disparan.

SI DEJAS CAMPOS VACÍOS, ESTÁS FALLANDO LA TAREA.`

    const r = await llamarModelo(modeloSel, prompt, 2200)
    registrarLlamada('metodo1-analisis', r.inputTokens, r.outputTokens)

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudo interpretar el análisis del guion: ' + e.message })
    }
    const analisis = parsed.analisis || {}
    const hookOriginal = (parsed.hookOriginal || '').toString().trim()
    const cuerpo = (parsed.cuerpo || '').toString().trim()
    if (!hookOriginal && !cuerpo) {
      return res.status(502).json({ error: 'El modelo no logró separar hook y cuerpo del guion' })
    }

    // ── Auto-save: crea el anuncio + guarda versión de análisis ──
    let anuncioId = null
    try {
      anuncioId = crearAnuncio({
        autor: (autor || '').toString().trim() || 'Anónimo',
        producto: (analisis.producto || ('Variar Hook — ' + hookOriginal)).toString().slice(0, 200),
        avatar: (analisis.avatar || '').toString().slice(0, 300),
        formato: (analisis.formato || '').toString(),
        duracion: (analisis.duracion || '').toString(),
        nivel: analisis.nivel != null ? String(analisis.nivel) : '',
        motivo: (analisis.motivo || '').toString(),
        angulo: (analisis.angulo || '').toString(),
        modelo: modeloSel,
        metodoPrincipal: 'metodo1',
        briefingJson: { modo: 'metodo1', guionInput: guion, contexto }
      })
      agregarVersion(anuncioId, {
        tipo: 'metodo1-analisis',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido: {
          modo: 'metodo1',
          m1Paso: 2,
          m1GuionInput: guion,
          m1Contexto: contexto,
          m1Analisis: analisis,
          m1HookOriginal: hookOriginal,
          m1Cuerpo: cuerpo
        }
      })
    } catch (e) {
      // El auto-save no debe bloquear la respuesta al usuario.
      console.error('Auto-save Método 1 (análisis) falló:', e)
    }

    return res.status(200).json({ analisis, hookOriginal, cuerpo, costoOperacion, anuncioId })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
