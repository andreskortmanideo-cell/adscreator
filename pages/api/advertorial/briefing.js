async function callModel(messages, modelo, system = null) {
  const isGPT = modelo?.startsWith('gpt')
  if (isGPT) {
    const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: modelo, max_tokens: 3500, messages: msgs }),
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message)
    return d.choices[0].message.content
  } else {
    const body = { model: modelo, max_tokens: 3500, messages }
    if (system) body.system = system
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message)
    return d.content[0].text
  }
}

// Parser JSON tolerante: limpia ```json fences, repara comas, cierra JSON cortado
function parseJSON(text, label = '') {
  // Limpiar markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1) throw new Error(`No JSON en ${label}: ${text.substring(0, 200)}`)
  let jsonStr = cleaned.substring(start, end !== -1 ? end + 1 : cleaned.length)

  // Función para escapar saltos de línea reales dentro de strings JSON
  const escapeNewlinesInStrings = (str) => {
    let result = ''
    let inString = false
    let escape = false
    for (let i = 0; i < str.length; i++) {
      const c = str[i]
      if (escape) { result += c; escape = false; continue }
      if (c === '\\') { result += c; escape = true; continue }
      if (c === '"') { inString = !inString; result += c; continue }
      if (inString) {
        if (c === '\n') { result += '\\n'; continue }
        if (c === '\r') { result += '\\r'; continue }
        if (c === '\t') { result += '\\t'; continue }
      }
      result += c
    }
    return result
  }

  // Función para escapar comillas dobles sin escapar dentro de strings
  // Ejemplo: { "k": "el dijo "hola" y se fue" }  -->  { "k": "el dijo \"hola\" y se fue" }
  const escapeUnescapedQuotes = (str) => {
    let result = ''
    let inString = false
    let escape = false
    for (let i = 0; i < str.length; i++) {
      const c = str[i]
      if (escape) { result += c; escape = false; continue }
      if (c === '\\') { result += c; escape = true; continue }
      if (c === '"') {
        if (!inString) {
          // Apertura de string
          inString = true
          result += c
        } else {
          // Estamos dentro de un string. Hay que decidir si esta comilla
          // CIERRA el string o es una comilla en medio del texto.
          // Heurística: si el siguiente char no-whitespace es , } ] o : ,
          // probablemente es cierre. Si es texto, es comilla interna.
          let j = i + 1
          while (j < str.length && /\s/.test(str[j])) j++
          const next = str[j]
          if (next === undefined || next === ',' || next === '}' || next === ']' || next === ':') {
            // Es cierre legítimo
            inString = false
            result += c
          } else {
            // Es una comilla interna sin escapar — la escapamos
            result += '\\"'
          }
        }
        continue
      }
      result += c
    }
    return result
  }

  // Intento 1: parse directo
  try { return JSON.parse(jsonStr) } catch(e1) {

    // Intento 2: escape de saltos
    try {
      const escaped = escapeNewlinesInStrings(jsonStr)
      return JSON.parse(escaped)
    } catch(e2) {

      // Intento 3: escape de saltos + escape de comillas internas
      try {
        let escaped = escapeNewlinesInStrings(jsonStr)
        escaped = escapeUnescapedQuotes(escaped)
        return JSON.parse(escaped)
      } catch(e3) {

        // Intento 4: + fixes comunes (comas faltantes, trailing commas)
        let repaired = escapeUnescapedQuotes(escapeNewlinesInStrings(jsonStr))
          .replace(/}\s*{/g, '},{')
          .replace(/]\s*\[/g, '],[')
          .replace(/}\s*"/g, '},"')
          .replace(/]\s*"/g, '],"')
          .replace(/"\s*{/g, '",{')
          .replace(/"\s*\[/g, '",[')
          .replace(/,(\s*[}\]])/g, '$1')
        try { return JSON.parse(repaired) } catch(e4) {

          // Intento 5: cerrar JSON cortado
          let extra = repaired
          const opens = (extra.match(/{/g)||[]).length
          const closes = (extra.match(/}/g)||[]).length
          const opensA = (extra.match(/\[/g)||[]).length
          const closesA = (extra.match(/]/g)||[]).length
          for (let i=0; i<opensA-closesA; i++) extra += ']'
          for (let i=0; i<opens-closes; i++) extra += '}'
          try { return JSON.parse(extra) } catch(e5) {
            // Logging detallado para diagnóstico
            console.error(`[parseJSON ${label}] Error: ${e1.message}`)
            console.error(`[parseJSON ${label}] JSON crudo (primeros 3000 chars):`)
            console.error(jsonStr.substring(0, 3000))
            console.error(`[parseJSON ${label}] JSON crudo (chars 2200-2500 si existen):`)
            console.error(jsonStr.substring(2200, 2500))
            throw new Error(`JSON malformado en ${label}: ${e1.message}. Inicio: ${jsonStr.substring(0,150)}`)
          }
        }
      }
    }
  }
}

function buildInputBlock({ nombre, contexto, avatar, lineamiento, documento }) {
  const parts = [`PRODUCTO: ${nombre}`]

  parts.push('\n━━━ INFORMACIÓN DEL PRODUCTO ━━━')
  if (contexto?.trim()) {
    parts.push('\n[Información directa del cliente]:\n' + contexto.trim())
  }
  if (documento?.trim()) {
    parts.push('\n[Documento adjunto]:\n' + documento.substring(0, 8000))
  }
  parts.push('\nINSTRUCCIÓN: Combina AMBAS fuentes como una sola descripción del producto.')

  parts.push('\n━━━ DIRECTRICES DE LA CAMPAÑA ━━━')
  parts.push(`\nAVATAR: ${avatar?.trim() || 'Inferido del producto'}`)
  if (avatar?.trim()) {
    parts.push('INSTRUCCIÓN: El briefing debe construir TODO alrededor de este avatar específico.')
  }

  if (lineamiento?.trim()) {
    parts.push(`\nLINEAMIENTO DEL CLIENTE (REGLA ABSOLUTA): ${lineamiento.trim()}`)
    parts.push('INSTRUCCIÓN: Esta indicación es OBLIGATORIA. El enemigo, el mecanismo, la estructura y el tono deben respetarla.')
  }

  return parts.join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { nombre, contexto, avatar, lineamiento, documento, motivo, analisis, modelo } = req.body

    const system = `Eres copywriter de publireportajes científicos. El producto aparece en el bloque 9 — los primeros 8 son educación pura.

Devuelve SOLO JSON válido, sin markdown, sin texto antes ni después:
{
  "enemigo": "el verdadero villano del avatar (hábito, industria, mito, falso tratamiento)",
  "mecanismo": "mecanismo único científico del producto explicado en 2-3 oraciones",
  "estructura": "cómo fluirá la narrativa: gancho, desarrollo educativo, transición al producto, cierre",
  "tono": "tono y voz específicos para este advertorial",
  "lineamientosCriticos": "lista de reglas absolutas que deben cumplirse (basadas en el lineamiento del cliente)"
}`

    const inputBlock = buildInputBlock({ nombre, contexto, avatar, lineamiento, documento })
    const motivoLine = `\nMOTIVO: ${motivo || analisis?.motivoElegido || 'educativo'}`
    const analisisLine = `\n\nANÁLISIS PREVIO:\n${JSON.stringify(analisis, null, 2)}`

    const user = `${inputBlock}${motivoLine}${analisisLine}\n\nConstruye el briefing. NO uses bloques de código markdown, devuelve el JSON crudo.`

    const result = await callModel([{ role: 'user', content: user }], modelo, system)
    const briefing = parseJSON(result, 'briefing')

    return res.status(200).json({ success: true, briefing })
  } catch (error) {
    console.error('Error briefing:', error)
    return res.status(500).json({ error: error.message })
  }
}
