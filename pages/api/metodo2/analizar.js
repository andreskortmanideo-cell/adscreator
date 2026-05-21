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

DEFINICIÓN ESTRICTA DE HOOK (M2):
- El hook es UNA SOLA FRASE corta (5-12 palabras, idealmente 5-9).
- Termina con el PRIMER punto (.), signo de exclamación (!) o interrogación (?) que aparezca en el texto.
- NO incluye frases adicionales aunque parezcan parte del gancho.
- Si la primera oración es muy larga (>12 palabras), TRUNCA en la primera coma que tenga sentido autónomo o reformula para que quede corta.

EJEMPLOS:
- Texto: "La pulverizadora que me salvó el taller. Y te voy a mostrar exactamente por qué." → Hook correcto: "La pulverizadora que me salvó el taller." (NO tomar la segunda frase)
- Texto: "Si llegas con dolor en la espalda, no eres el único." → Hook correcto: "Si llegas con dolor en la espalda, no eres el único."

DEFINICIÓN DE CUERPO:
- CUERPO: TODO el contenido que va después del hook. Incluye desarrollo del problema, presentación de solución, beneficios, prueba social, CTA.

REGLA CRÍTICA PARA EXTRAER EL CUERPO DEL TEXTO_2:
El "hook descartable" del TEXTO_2 es ÚNICAMENTE la primera oración hasta el primer punto (.), signo de exclamación (!) o interrogación (?). UNA SOLA frase, máximo 15 palabras.
TODO lo demás (incluso narrativa del avatar como "Yo llevaba años..." o "Antes me costaba...") es CUERPO LEGÍTIMO y se conserva.

EJEMPLO CORRECTO:
TEXTO_2: "Esta pulverizadora hace en tres minutos lo que el cepillo nunca lograba. Yo llevaba años limpiando motores a mano, sudando. Un día la probé..."
Hook descartado: "Esta pulverizadora hace en tres minutos lo que el cepillo nunca lograba." (1 frase)
Cuerpo extraído: "Yo llevaba años limpiando motores a mano, sudando. Un día la probé..." (TODO el resto)

REGLA INVIOLABLE: hookDescartado NUNCA debe tener más de 1 punto ni más de 15 palabras.

TU TAREA:
1. Del TEXTO_1, extrae SOLO la PRIMERA frase corta como hook (termina en el primer . ! o ?). NO te lleves la segunda frase ni más de lo que es estrictamente el gancho.
2. Del TEXTO_2, identifica su propio hook (SOLO la primera oración, hasta el primer . ! o ?) y DESCÁRTALO. Luego extrae TODO el resto como cuerpo — incluida la narrativa del avatar.
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
    let hookExtraido = (parsed.hookExtraido || '').toString().trim()
    let cuerpoExtraido = (parsed.cuerpoExtraido || '').toString().trim()

    // ── FIX 3 — Validador: el hook debe ser SOLO la primera frase corta ──
    const contarPalabras = (t) => t.split(/\s+/).filter(Boolean).length
    if (hookExtraido && contarPalabras(hookExtraido) > 12) {
      // Recorta en el primer punto / exclamación / interrogación.
      const m = hookExtraido.match(/^[^.!?]*[.!?]/)
      if (m && m[0].trim()) {
        const recortado = m[0].trim()
        console.warn(`[metodo2-analisis] hook recortado en primera frase: "${hookExtraido}" → "${recortado}"`)
        hookExtraido = recortado
      }
      if (contarPalabras(hookExtraido) > 12) {
        console.warn(`[metodo2-analisis] hook aún supera 12 palabras tras recorte: "${hookExtraido}"`)
      }
    }
    let hookDescartado = (parsed.hookDescartado || '').toString().trim()

    // ── PARTE 3 — Validador: el hook descartado debe ser SOLO la primera frase ──
    const contarFrases = (texto) => {
      if (!texto) return 0
      return texto.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    }
    if (contarFrases(hookDescartado) > 1 || contarPalabras(hookDescartado) > 15) {
      console.log('[M2 VALIDADOR] Hook descartado excede límites. Corrigiendo...')
      const match = txtCuerpo.match(/^[^.!?]+[.!?]/)
      if (match) {
        hookDescartado = match[0].trim()
        cuerpoExtraido = txtCuerpo.substring(match[0].length).trim()
      }
    }

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
