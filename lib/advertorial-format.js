export const BLOQUES = [
  { num:1,  key:'titular',           titulo:'Titular',                    producto:false },
  { num:2,  key:'bajada',            titulo:'Sumario',                    producto:false },
  { num:3,  key:'fichaExperto',      titulo:'Ficha del Experto',          producto:false },
  { num:4,  key:'apertura',          titulo:'Apertura — La Pregunta',     producto:false },
  { num:5,  key:'historiaPaciente',  titulo:'Historia del Paciente',      producto:false },
  { num:6,  key:'citaExperto',       titulo:'Cita del Experto (pullquote)',producto:false },
  { num:7,  key:'desarrolloEducativo',titulo:'Desarrollo Educativo + Stat Visual', producto:false },
  { num:8,  key:'comparativaEstados', titulo:'Comparativa ❌ vs ✓',       producto:false },
  { num:9,  key:'porQueOtrosFallan', titulo:'Por Qué Otros Fallan + Cita', producto:false },
  { num:10, key:'transicionMecanismo',titulo:'Transición + Mecanismo Único (con Fases)', producto:false },
  { num:11, key:'producto',          titulo:'Producto · Ingredientes · Formato', producto:true },
  { num:12, key:'promociones',       titulo:'Promociones + Modo de Uso',  producto:true },
  { num:13, key:'garantia',          titulo:'Garantía',                   producto:true },
  { num:14, key:'testimonios',       titulo:'Testimonios Detallados',     producto:true },
  { num:15, key:'faq',               titulo:'Preguntas y Respuestas',     producto:true },
  { num:16, key:'cierreCTA',         titulo:'Cierre Final + CTA',         producto:true },
]

export function toText(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
  if (Array.isArray(v)) return v.map(toText).join('\n')
  if (typeof v === 'object') {
    return Object.entries(v).map(([k,val]) => `${k}\n${toText(val)}`).join('\n\n')
  }
  return String(v)
}

// Parsea el texto de testimonios en cards estructuradas.
// Cada bloque empieza con una línea de estrellas. Devuelve array; si falla devuelve null.
export function parseTestimonios(texto) {
  if (!texto || typeof texto !== 'string') return null
  const normalizado = texto.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
  const lineas = normalizado.split(/\r?\n/)
  const items = []
  let actual = null
  for (const linea of lineas) {
    const t = linea.trim()
    // Línea de estrellas: solo contiene ★ y/o ☆
    if (/^[★☆]+$/.test(t)) {
      if (actual) items.push(actual)
      actual = { estrellas: t, cuerpoLineas: [] }
      continue
    }
    if (actual) actual.cuerpoLineas.push(linea)
  }
  if (actual) items.push(actual)
  if (items.length === 0) return null

  return items.map(it => {
    const body = it.cuerpoLineas.map(l => l.trim()).filter(Boolean)
    // Detectar footer: edad (XX años) o "Compra verificada"
    const idxAutor = body.findIndex(l => /\d+\s*años/i.test(l))
    const idxVerificado = body.findIndex(l => /Compra\s+verificada/i.test(l))
    let footerStart = -1
    if (idxAutor !== -1) footerStart = idxAutor
    else if (idxVerificado !== -1) footerStart = Math.max(0, idxVerificado - 2)
    const cuerpoTexto = footerStart >= 0 ? body.slice(0, footerStart).join(' ') : body.join(' ')
    const footer = footerStart >= 0 ? body.slice(footerStart) : []
    // Limpia comillas envolventes
    const review = cuerpoTexto.replace(/^["“”'']+|["“”'']+$/g, '').trim()
    return { estrellas: it.estrellas, review, footer }
  })
}

// Parsea texto FAQ en pares Q/A. Cada par: línea de autor → pregunta → línea Dr./Dra. → respuesta.
export function parseFaq(texto) {
  if (!texto || typeof texto !== 'string') return null
  let limpio = texto.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
  // Quitar header "Preguntas y respuestas" si está
  limpio = limpio.replace(/^\s*["“”]?Preguntas y respuestas["“”]?\s*\n+/i, '')
  const lineas = limpio.split(/\r?\n/)
  const items = []
  let actual = { autor:'', pregunta:[], experto:'', respuesta:[] }
  let modo = 'autor'

  const esLineaExperto = (t) => /^(Dr\.|Dra\.|Dr |Dra )/i.test(t)
  const esLineaAutor   = (t) => /(Hace\s+\d+|hace\s+\d+|días|semanas|meses)/.test(t)

  const empujar = () => {
    if (actual.autor || actual.pregunta.length || actual.experto || actual.respuesta.length) {
      items.push({
        autor: actual.autor,
        pregunta: actual.pregunta.join(' ').trim(),
        experto: actual.experto,
        respuesta: actual.respuesta.join(' ').trim(),
      })
    }
    actual = { autor:'', pregunta:[], experto:'', respuesta:[] }
  }

  for (const linea of lineas) {
    const t = linea.trim()
    if (!t) continue
    if (esLineaExperto(t)) {
      actual.experto = t
      modo = 'respuesta'
      continue
    }
    if (modo === 'respuesta' && esLineaAutor(t)) {
      empujar()
      actual.autor = t
      modo = 'pregunta'
      continue
    }
    if (modo === 'autor') {
      actual.autor = t
      modo = 'pregunta'
      continue
    }
    if (modo === 'pregunta') {
      actual.pregunta.push(t)
      continue
    }
    if (modo === 'respuesta') {
      actual.respuesta.push(t)
      continue
    }
  }
  empujar()
  if (items.length === 0) return null
  return items
}
