// Helpers compartidos para los endpoints del Método 1 (analizar / generar-hooks)

// ── Precios (alineado con /api/generate.js) ──────────────────────
const PRECIOS_MODELO = {
  'gpt-4.1-mini': { input: 0.40, output: 1.60 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
  'claude-haiku-4-5': { input: 1.00, output: 5.00 },
  'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 }
}
const TASA_USD_COP = 4000

function calcularCosto(modelo, inputTokens, outputTokens) {
  const p = PRECIOS_MODELO[modelo] || { input: 0, output: 0 }
  const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output
  return { usd, cop: usd * TASA_USD_COP }
}

// Crea un contenedor de costos con su registrador acumulador.
function crearCostoOperacion(modeloSel) {
  const costoOperacion = {
    modelo: modeloSel,
    llamadas: [],
    totales: { inputTokens: 0, outputTokens: 0, usd: 0, cop: 0 }
  }
  function registrarLlamada(tipo, inT, outT) {
    const inTok = inT || 0
    const outTok = outT || 0
    const c = calcularCosto(modeloSel, inTok, outTok)
    costoOperacion.llamadas.push({ tipo, modelo: modeloSel, inputTokens: inTok, outputTokens: outTok, usd: c.usd, cop: c.cop })
    costoOperacion.totales.inputTokens += inTok
    costoOperacion.totales.outputTokens += outTok
    costoOperacion.totales.usd += c.usd
    costoOperacion.totales.cop += c.cop
  }
  return { costoOperacion, registrarLlamada }
}

// ── Parser JSON tolerante (regex/fallback) ───────────────────────
function parseJsonTolerante(text) {
  if (!text || typeof text !== 'string') throw new Error('Respuesta vacía del modelo')
  let s = text.replace(/```json|```/g, '').trim()
  const ini = s.indexOf('{')
  const fin = s.lastIndexOf('}')
  if (ini !== -1 && fin !== -1 && fin > ini) s = s.slice(ini, fin + 1)
  try { return JSON.parse(s) } catch (e1) {
    let fixed = s
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/,(\s*[}\]])/g, '$1')   // comas colgantes
      .replace(/}\s*{/g, '},{')
    try { return JSON.parse(fixed) } catch (e2) {
      // Rebalancea llaves/corchetes faltantes
      const opens = (fixed.match(/{/g) || []).length
      const closes = (fixed.match(/}/g) || []).length
      const opensA = (fixed.match(/\[/g) || []).length
      const closesA = (fixed.match(/]/g) || []).length
      let extra = fixed
      for (let k = 0; k < opensA - closesA; k++) extra += ']'
      for (let k = 0; k < opens - closes; k++) extra += '}'
      try { return JSON.parse(extra) } catch (e3) {
        throw new Error('El modelo devolvió un JSON malformado y no se pudo recuperar')
      }
    }
  }
}

// ── Llamada al modelo (Claude u OpenAI) ──────────────────────────
async function llamarModelo(modeloSel, prompt, maxTok) {
  const provider = modeloSel.startsWith('claude') ? 'claude' : 'openai'
  if (provider === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY no configurada')
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modeloSel,
        max_tokens: maxTok,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message || JSON.stringify(d.error))
    return {
      texto: d.content?.[0]?.text || '',
      inputTokens: d.usage?.input_tokens || 0,
      outputTokens: d.usage?.output_tokens || 0
    }
  } else {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY no configurada')
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: modeloSel,
        max_tokens: maxTok,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message)
    return {
      texto: d.choices?.[0]?.message?.content || '',
      inputTokens: d.usage?.prompt_tokens || 0,
      outputTokens: d.usage?.completion_tokens || 0
    }
  }
}

module.exports = { calcularCosto, crearCostoOperacion, parseJsonTolerante, llamarModelo }
