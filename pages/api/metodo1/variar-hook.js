import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

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
async function llamarModelo(provider, modelo, prompt, maxTok) {
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
        model: modelo,
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
        model: modelo,
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { guionCompleto, modelo, autor, anuncioId } = req.body || {}
    if (!guionCompleto || !guionCompleto.toString().trim()) {
      return res.status(400).json({ error: 'guionCompleto requerido' })
    }
    const guion = guionCompleto.toString().trim()
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()
    const provider = modeloSel.startsWith('claude') ? 'claude' : 'openai'

    // ── Tracking de costos (acumula ambas llamadas) ──────────────
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

    // ── LLAMADA 1 — Ingeniería inversa + extracción ──────────────
    const prompt1 = `Eres analista experto en publicidad digital. Te dan un guion publicitario. Tu tarea es hacer INGENIERÍA INVERSA y devolver JSON estricto.

GUION:
${guion}

ANALIZA y responde SOLO con este JSON:
{
  "analisis": {
    "avatar": "descripción del avatar al que va dirigido (edad, género, ocupación, pain point principal)",
    "formato": "video o imagen estimado",
    "duracion": "duración estimada en segundos si es video",
    "nivel": "1, 2, 3, 4 o 5 según la doctrina Schwartz de consciencia",
    "motivo": "uno de: Emocional, Funcional, Educativo, Aspiracional, Racional",
    "angulo": "uno de los 16 ángulos: Problema/Dolor, Beneficio/Resultado, Curiosidad, Urgencia/Escasez, Autoridad/Prueba Social, Novedad, Comparación/Contraste, Enemigo en Común, Historia, Transformación, FOMO, Simplicidad, Ironía/Provocación, Precio/Valor, Exclusividad, Aspiracional",
    "tono": "descripción breve del tono (ej: confiable, dramático, urgente)",
    "estructuraNarrativa": "descripción breve del flujo del guion"
  },
  "hookOriginal": "las primeras 1-2 frases impactantes que detienen el scroll. NO incluyas más, solo el gancho inicial",
  "cuerpo": "todo el resto del guion después del hook, palabra por palabra exactamente como está"
}

Reglas para separar hook y cuerpo:
- El hook es lo que el espectador ve/oye en los primeros 2-3 segundos. Generalmente 1-2 frases cortas.
- El cuerpo es TODO lo demás, sin omitir nada.
- La suma de hookOriginal + cuerpo debe contener todo el texto del guion original.`

    const r1 = await llamarModelo(provider, modeloSel, prompt1, 2200)
    registrarLlamada('metodo1-analisis', r1.inputTokens, r1.outputTokens)

    let parsed1
    try {
      parsed1 = parseJsonTolerante(r1.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudo interpretar el análisis del guion: ' + e.message })
    }
    const analisis = parsed1.analisis || {}
    const hookOriginal = (parsed1.hookOriginal || '').toString().trim()
    const cuerpo = (parsed1.cuerpo || '').toString().trim()
    if (!hookOriginal && !cuerpo) {
      return res.status(502).json({ error: 'El modelo no logró separar hook y cuerpo del guion' })
    }

    // ── LLAMADA 2 — Generación de 3 hooks + ideas visuales ───────
    const prompt2 = `Eres experto en publicidad de Meta Ads. Te doy un análisis y un cuerpo de guion. Tu tarea es generar 3 HOOKS ALTERNATIVOS para reemplazar el hook original, y para cada uno, sugerir una IDEA VISUAL impactante.

ANÁLISIS ESTRATÉGICO:
${JSON.stringify(analisis)}

CUERPO DEL GUION (los hooks deben conectar naturalmente con esto):
${cuerpo}

HOOK ORIGINAL (de referencia, NO copies estructura idéntica):
${hookOriginal}

REQUISITOS:
- Los 3 hooks deben mantener el MISMO motivo "${analisis.motivo || ''}" y ÁNGULO "${analisis.angulo || ''}" y nivel "${analisis.nivel || ''}".
- Cada hook con DIFERENTE entrada estratégica (problema, curiosidad, prueba social, dato impactante, etc.).
- Cada hook ≤7 palabras si es para imagen, o ≤15 palabras si es para video.
- Que cada hook FLUYA naturalmente con el cuerpo dado.
- Para cada hook, una IDEA VISUAL específica (qué se ve en los primeros 2-3 segundos del video o en la imagen):
  - Que detenga el scroll (sorpresa, contraste, movimiento, primer plano).
  - Que sea agresiva/llamativa pero NO viole políticas de Meta.

POLÍTICAS DE META (RESPETAR):
- NO violencia gráfica, sangre, lesiones explícitas.
- NO desnudos, contenido sexualmente sugestivo, ropa íntima sin contexto.
- NO claims médicos específicos (no decir "cura X enfermedad").
- NO dinero efectivo apilado de forma ostentosa.
- NO menores de edad de manera inapropiada.
- NO discriminación por raza, género, religión, etc.
- NO armas, drogas, alcohol promoviendo consumo excesivo.
- NO promesas extremas de pérdida de peso o cambio físico drástico antes/después en cuerpos.
- NO texto que parezca un anuncio engañoso (clickbait excesivo, "este truco te cambiará la vida").

OUTPUT JSON ESTRICTO:
{
  "hooks": [
    {
      "texto": "el nuevo hook (1-2 frases)",
      "estrategia": "breve descripción de por qué este hook funciona en este contexto",
      "ideaVisual": "descripción específica del fragmento visual: qué se ve, plano, encuadre, acción, expresión",
      "porQueDetieneScroll": "razón concreta por la que detiene el scroll",
      "advertenciaMeta": "si hay algún riesgo de política, lo notas aquí. Si no hay, dejas 'Cumple políticas'"
    }
  ]
}

Devuelve EXACTAMENTE 3 objetos dentro de "hooks".`

    const r2 = await llamarModelo(provider, modeloSel, prompt2, 2600)
    registrarLlamada('metodo1-generacion', r2.inputTokens, r2.outputTokens)

    let parsed2
    try {
      parsed2 = parseJsonTolerante(r2.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudieron interpretar los hooks generados: ' + e.message })
    }
    const hooks = Array.isArray(parsed2.hooks) ? parsed2.hooks.slice(0, 3).map(h => ({
      texto: (h.texto || '').toString(),
      estrategia: (h.estrategia || '').toString(),
      ideaVisual: (h.ideaVisual || '').toString(),
      porQueDetieneScroll: (h.porQueDetieneScroll || '').toString(),
      advertenciaMeta: (h.advertenciaMeta || 'Cumple políticas').toString()
    })) : []
    if (hooks.length === 0) {
      return res.status(502).json({ error: 'El modelo no devolvió hooks alternativos' })
    }

    // ── Auto-save al historial ───────────────────────────────────
    const contenido = {
      modo: 'metodo1',
      m1Input: guion,
      m1Output: { analisis, hookOriginal, cuerpo, hooks }
    }
    let idAnuncio = anuncioId ? Number(anuncioId) : null
    try {
      if (!idAnuncio) {
        idAnuncio = crearAnuncio({
          autor: (autor || '').toString().trim() || 'Anónimo',
          producto: ('Variar Hook — ' + hookOriginal).slice(0, 200),
          avatar: (analisis.avatar || '').toString().slice(0, 300),
          formato: (analisis.formato || '').toString(),
          duracion: (analisis.duracion || '').toString(),
          nivel: analisis.nivel != null ? String(analisis.nivel) : '',
          motivo: (analisis.motivo || '').toString(),
          angulo: (analisis.angulo || '').toString(),
          modelo: modeloSel,
          briefingJson: { modo: 'metodo1', guionInput: guion }
        })
      }
      agregarVersion(idAnuncio, {
        tipo: 'metodo1-variar-hook',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido
      })
    } catch (e) {
      // El auto-save no debe bloquear la respuesta al usuario.
      console.error('Auto-save Método 1 falló:', e)
    }

    return res.status(200).json({
      analisis,
      hookOriginal,
      cuerpo,
      hooks,
      costoOperacion,
      anuncioId: idAnuncio
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
