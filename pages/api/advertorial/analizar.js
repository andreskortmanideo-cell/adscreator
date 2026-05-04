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
    parts.push('\n[Documento de investigación / brief adjunto]:\n' + documento.substring(0, 8000))
  }
  if (!contexto?.trim() && !documento?.trim()) {
    parts.push('No proporcionada — usa solo el nombre.')
  }
  parts.push('\nINSTRUCCIÓN: Combina AMBAS fuentes de información del producto. Cada una puede contener datos que la otra omite. Trátalas como una sola fuente unificada del producto.')

  parts.push('\n━━━ DIRECTRICES DE LA CAMPAÑA ━━━')
  parts.push(`\nAVATAR OBJETIVO: ${avatar?.trim() || 'No definido — infiere el mejor público basado en la información del producto'}`)
  if (avatar?.trim()) {
    parts.push('INSTRUCCIÓN AVATAR: TODO el advertorial debe hablarle directamente a este avatar específico — su titular, sus dolores, sus emociones, sus testimonios.')
  }

  if (lineamiento?.trim()) {
    parts.push(`\nLINEAMIENTO DEL CLIENTE (REGLA ABSOLUTA): ${lineamiento.trim()}`)
    parts.push('INSTRUCCIÓN LINEAMIENTO: Esta indicación es OBLIGATORIA y NO NEGOCIABLE. Si dice destacar un ingrediente, ese ingrediente es protagonista. Si dice un tono específico, ese tono domina. Si prohíbe algo, no aparece. Cumple esta regla en cada bloque del advertorial.')
  }

  return parts.join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { nombre, contexto, avatar, lineamiento, documento, motivo, modelo } = req.body

    const system = `Eres un estratega de publireportajes científicos (advertorials).
Tu trabajo: analizar el producto, el avatar y los lineamientos del cliente para definir la mejor estrategia narrativa.
Es un advertorial Nivel 2: el lector tiene el problema pero no conoce soluciones. Educación primero, producto en bloque 9.

Devuelve SOLO JSON válido, sin markdown, sin texto antes ni después:
{
  "motivoElegido": "dolor/curiosidad/educativo/emocional/aspiracional",
  "mecanismo": "mecanismo único del producto en máx 10 palabras",
  "avatarRefinado": "perfil del avatar definido (qué siente, qué busca, qué teme)",
  "analisisText": "análisis estratégico en 3 párrafos: problema del avatar, cómo educarlo, cómo conectar con el producto",
  "lineamientosAplicados": "cómo se respetará el lineamiento del cliente en el advertorial (o 'ninguno' si no hay)",
  "dataCientifica": "5-7 datos científicos reales con fuentes y números, relevantes al problema y solución"
}`

    const inputBlock = buildInputBlock({ nombre, contexto, avatar, lineamiento, documento })
    const motivoLine = motivo ? `\nMOTIVO REQUERIDO: ${motivo}` : '\nMOTIVO: elige el más efectivo'

    const user = `${inputBlock}${motivoLine}\n\nAnaliza y devuelve el JSON. NO uses bloques de código markdown, devuelve el JSON crudo.`

    const result = await callModel([{ role: 'user', content: user }], modelo, system)
    const analisis = parseJSON(result, 'analizar')

    return res.status(200).json({ success: true, analisis })
  } catch (error) {
    console.error('Error analizar:', error)
    return res.status(500).json({ error: error.message })
  }
}
