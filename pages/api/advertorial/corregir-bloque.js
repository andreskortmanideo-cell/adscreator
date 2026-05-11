const PRECIOS_MODELO = {
  'gpt-4.1-mini': { input: 0.40, output: 1.60 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
  'claude-haiku-4-5': { input: 1.00, output: 5.00 },
  'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
}
const TASA_USD_COP = 4000
function calcularCosto(modelo, inputTokens, outputTokens) {
  const p = PRECIOS_MODELO[modelo] || { input: 0, output: 0 }
  const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output
  return { usd, cop: usd * TASA_USD_COP }
}

async function callModel(messages, modelo, system = null) {
  const isGPT = modelo?.startsWith('gpt')
  if (isGPT) {
    const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: modelo, max_tokens: 4000, messages: msgs }),
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message)
    return { texto: d.choices[0].message.content, inputTokens: d.usage?.prompt_tokens || 0, outputTokens: d.usage?.completion_tokens || 0 }
  }
  const body = { model: modelo, max_tokens: 4000, messages }
  if (system) body.system = system
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  })
  const d = await r.json()
  if (d.error) throw new Error(d.error.message)
  return { texto: d.content[0].text, inputTokens: d.usage?.input_tokens || 0, outputTokens: d.usage?.output_tokens || 0 }
}

// Parser tolerante: acepta string puro, JSON {valor:...}, array, objeto
function parseToleranteSegunTipo(texto, tipoEsperado, clavesEsperadas) {
  if (!texto || typeof texto !== 'string') return null
  let limpio = texto.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
  limpio = limpio.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")

  if (tipoEsperado === 'string') {
    // Intentar parsear JSON wrapper si lo trae
    if (limpio.startsWith('{')) {
      try {
        const o = JSON.parse(limpio)
        if (typeof o === 'string') return o
        if (o && typeof o === 'object') {
          // buscar primer string en valores
          for (const k of Object.keys(o)) {
            if (typeof o[k] === 'string') return o[k]
          }
        }
      } catch {}
    }
    if (limpio.startsWith('"') && limpio.endsWith('"')) {
      try { return JSON.parse(limpio) } catch {}
    }
    return limpio
  }

  if (tipoEsperado === 'array') {
    const i = limpio.indexOf('[')
    const j = limpio.lastIndexOf(']')
    if (i === -1 || j === -1) return null
    try { return JSON.parse(limpio.substring(i, j + 1)) } catch { return null }
  }

  if (tipoEsperado === 'object') {
    const i = limpio.indexOf('{')
    const j = limpio.lastIndexOf('}')
    if (i === -1 || j === -1) return null
    try {
      const o = JSON.parse(limpio.substring(i, j + 1))
      if (o && typeof o === 'object' && !Array.isArray(o)) {
        if (clavesEsperadas && clavesEsperadas.length > 0) {
          const tieneAlguna = clavesEsperadas.some(k => k in o)
          if (!tieneAlguna) return null
        }
        return o
      }
      return null
    } catch { return null }
  }

  return null
}

function detectarTipo(valor) {
  if (Array.isArray(valor)) return 'array'
  if (valor && typeof valor === 'object') return 'object'
  return 'string'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { blockKey, blockContent, instruccionUsuario, contextoAdvertorial, modelo } = req.body
    if (!blockKey) return res.status(400).json({ error: 'blockKey requerido' })
    if (!instruccionUsuario || !instruccionUsuario.toString().trim()) return res.status(400).json({ error: 'instruccionUsuario requerido' })
    if (blockContent === undefined || blockContent === null) return res.status(400).json({ error: 'blockContent requerido' })

    const tipo = detectarTipo(blockContent)
    const clavesEsperadas = tipo === 'object' ? Object.keys(blockContent) : []
    const longitudEsperada = tipo === 'array' ? blockContent.length : null

    const system = `Eres un editor de copywriting médico-comercial. Recibes UN solo bloque de un advertorial ya generado y una instrucción de corrección puntual. Tu tarea: aplicar la instrucción manteniendo (1) el eje narrativo del advertorial, (2) la coherencia con el resto, (3) el tono y estilo del bloque original, (4) la estructura JSON exacta del bloque (si es string devuelves string, si es array devuelves array del mismo tamaño, si es objeto devuelves objeto con las mismas claves). NUNCA inventes nuevo villano, nueva metáfora central, nuevo experto o nuevo mecanismo si la instrucción no lo pide expresamente. Devuelve SOLO el bloque corregido en JSON válido, sin envoltura ni comentarios.`

    const eje = contextoAdvertorial?.ejeNarrativo || {}
    const formatoInstr = tipo === 'string'
      ? 'FORMATO DE RESPUESTA: devuelve SOLO el texto corregido como STRING JSON válido (es decir, una cadena entre comillas dobles, con caracteres internos correctamente escapados). NO uses markdown, NO añadas claves ni objetos envolventes.'
      : tipo === 'array'
        ? `FORMATO DE RESPUESTA: devuelve SOLO un ARRAY JSON válido con EXACTAMENTE ${longitudEsperada} elementos, en el mismo orden y formato que el original.`
        : `FORMATO DE RESPUESTA: devuelve SOLO un OBJETO JSON válido con EXACTAMENTE las mismas claves del original: ${clavesEsperadas.join(', ')}. No agregues ni elimines claves.`

    const user = `PRODUCTO: ${contextoAdvertorial?.nombre || ''}
AVATAR: ${contextoAdvertorial?.avatar || ''}
MERCADO: ${contextoAdvertorial?.mercado || ''}

EJE NARRATIVO (mantener intacto):
- Villano: ${eje.villano || ''}
- Metáfora del mecanismo: ${eje.metaforaMecanismo || ''}
- Verdad oculta: ${eje.verdadOculta || ''}
- Momento de descubrimiento: ${eje.momentoDescubrimiento || ''}
- Mecanismo de solución: ${eje.mecanismoSolucion || ''}

PROMESA GENERAL (bajada):
${contextoAdvertorial?.bajada || ''}

BLOQUE A CORREGIR (clave: ${blockKey})
Contenido actual:
${JSON.stringify(blockContent, null, 2)}

INSTRUCCIÓN DEL USUARIO:
${instruccionUsuario}

${formatoInstr}`

    let llamadas = []
    let resultado = null

    for (let intento = 0; intento < 2 && !resultado; intento++) {
      const { texto, inputTokens, outputTokens } = await callModel([{ role: 'user', content: user }], modelo, system)
      llamadas.push({ tipo: intento === 0 ? 'corregir-bloque' : 'corregir-bloque-reintento', modelo, inputTokens, outputTokens })
      const parsed = parseToleranteSegunTipo(texto, tipo, clavesEsperadas)
      if (parsed === null || parsed === undefined) continue
      if (tipo === 'array' && longitudEsperada !== null && parsed.length !== longitudEsperada) continue
      resultado = parsed
    }

    if (resultado === null || resultado === undefined) {
      return res.status(500).json({ error: 'No se pudo corregir el bloque tras 2 intentos' })
    }

    const totales = llamadas.reduce((acc, l) => {
      const c = calcularCosto(l.modelo, l.inputTokens, l.outputTokens)
      return {
        inputTokens: acc.inputTokens + l.inputTokens,
        outputTokens: acc.outputTokens + l.outputTokens,
        usd: acc.usd + c.usd,
        cop: acc.cop + c.cop,
      }
    }, { inputTokens: 0, outputTokens: 0, usd: 0, cop: 0 })

    const tokensUsados = { input: totales.inputTokens, output: totales.outputTokens }
    const costoOperacion = {
      llamadas: llamadas.map(l => {
        const c = calcularCosto(l.modelo, l.inputTokens, l.outputTokens)
        return { ...l, usd: c.usd, cop: c.cop }
      }),
      totales,
    }

    return res.status(200).json({
      success: true,
      blockKey,
      contenidoCorregido: resultado,
      tokensUsados,
      costoOperacion,
    })
  } catch (error) {
    console.error('Error corregir-bloque:', error)
    return res.status(500).json({ error: error.message })
  }
}
