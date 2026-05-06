import { useState, useRef } from 'react'

const MODELOS = [
  { id: 'gpt-4.1-mini', label: 'GPT 4.1 Mini', desc: 'Rápido · recomendado' },
  { id: 'gpt-4o',       label: 'GPT-4o',       desc: 'Mayor calidad' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', desc: 'Mejor razonamiento' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5',  desc: 'Rápido · económico' },
]

const BLOQUES = [
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

const D = {
  bg:'#ffffff', card:'#ffffff', cardBorder:'#e5e7eb',
  input:'#ffffff', inputBorder:'#d1d5db',
  blue:'#2563eb', blueLight:'#3b82f6', blueDark:'#eff6ff',
  text:'#111827', textMid:'#4b5563', textDim:'#6b7280',
  green:'#059669', yellow:'#d97706',
}

const inp = {
  width:'100%', padding:'9px 11px', marginTop:5,
  background:D.input, border:`1px solid ${D.inputBorder}`,
  color:D.text, borderRadius:5, fontSize:12, fontFamily:'inherit', outline:'none',
}

async function leerArchivo(file) {
  // Usa el endpoint /api/extract-file (mammoth/pdf-parse) para extracción REAL
  // Si es imagen, devuelve placeholder ya que advertorial no usa vision por ahora
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch('/api/extract-file', { method:'POST', body: fd })
  const d = await r.json()
  if (!r.ok || d.error) throw new Error(d.error || 'Error al procesar archivo')
  if (d.kind === 'image') {
    return `[IMAGEN: ${file.name}] (Imagen subida; el modelo de advertorial actual no procesa imágenes — solo se registra su nombre)`
  }
  return `[ARCHIVO: ${file.name}]\n${d.text || ''}`
}

export default function AdvertorialCreator() {
  const [vista, setVista]         = useState('form')
  const [progreso, setProgreso]   = useState(0)
  const [progresoMsg, setProgresoMsg] = useState('')
  const [modelo, setModelo]       = useState('claude-sonnet-4-6')
  const [nombre, setNombre]       = useState('')
  const [contexto, setContexto]   = useState('')
  const [avatar, setAvatar]       = useState('')
  const [lineamiento, setLineamiento] = useState('')
  const [mercado, setMercado]     = useState('')
  const [archivos, setArchivos]   = useState([])
  const [advertorial, setAdvertorial] = useState(null)
  const [error, setError]         = useState(null)
  const fileRef = useRef()

  // Modal "Generar Ad/Guion"
  const [modalAd, setModalAd]     = useState(false)
  const [adNivel, setAdNivel]     = useState(2)
  const [adTipo, setAdTipo]       = useState('Educativo')
  const [adAvatar, setAdAvatar]   = useState('')
  const [adAvatarManual, setAdAvatarManual] = useState('')
  const [adAngulo, setAdAngulo]   = useState('Problema/Dolor')

  const handleArchivo = (e) => {
    const nuevos = Array.from(e.target.files)
    setArchivos(prev => [...prev, ...nuevos].slice(0, 5))
    e.target.value = ''
  }

  const quitarArchivo = (i) => setArchivos(prev => prev.filter((_,idx) => idx !== i))

  const post = async (url, body) => {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    const d = await r.json()
    if (d.error) throw new Error(d.error)
    return d
  }

  const generar = async () => {
    const tieneNombre = nombre.trim()
    const tieneContexto = contexto.trim()
    const tieneArchivo = archivos.length > 0

    if (!tieneNombre) {
      alert('⚠️ El nombre del producto es obligatorio.')
      return
    }
    if (!tieneContexto && !tieneArchivo) {
      alert('⚠️ Debes ingresar la información del producto o adjuntar un documento.')
      return
    }

    const alertas = []
    if (!avatar.trim()) alertas.push('Avatar no definido — la IA elegirá el público.')
    if (!lineamiento.trim()) alertas.push('Sin lineamiento adicional.')
    if (alertas.length > 0) {
      const ok = window.confirm(`Nota antes de generar:\n\n${alertas.join('\n')}\n\n¿Continuar de todas formas?`)
      if (!ok) return
    }

    setError(null)
    setVista('loading')

    try {
      let contenidoArchivo = ''
      if (archivos.length > 0) {
        try {
          const textos = await Promise.all(archivos.map(leerArchivo))
          contenidoArchivo = textos.join('\n\n---\n\n')
        } catch(e) {}
      }

      const payload = { nombre, contexto, avatar, lineamiento, mercado, documento: contenidoArchivo, motivo: 'educativo', modelo }

      setProgresoMsg('Analizando producto y audiencia...'); setProgreso(15)
      const { analisis } = await post('/api/advertorial/analizar', payload)

      setProgresoMsg('Construyendo estrategia narrativa...'); setProgreso(45)
      const { briefing } = await post('/api/advertorial/briefing', { ...payload, analisis })

      setProgresoMsg('Escribiendo los 15 bloques...'); setProgreso(70)
      const { advertorial: adv } = await post('/api/advertorial/generar', { ...payload, briefing })

      setProgreso(100)
      setAdvertorial(adv)
      setVista('resultado')
    } catch(e) {
      setError(e.message)
      setVista('form')
    }
  }

  const copiar = (tipo) => {
    const txt = tipo === 'json'
      ? JSON.stringify(advertorial, null, 2)
      : BLOQUES.map(b => `[${b.titulo.toUpperCase()}]\n${getBloqueTexto(b)}`).join('\n\n---\n\n')
    navigator.clipboard.writeText(txt).then(() => alert('✅ Copiado'))
  }

  const getBloqueTexto = (b) => {
    if (b.key === 'titular') {
      const t = advertorial.titulares || (advertorial.titular ? [advertorial.titular] : [])
      return t.map((x,i) => `Opción ${i+1}: ${x}`).join('\n')
    }
    return toText(advertorial[b.key])
  }

  const copiarBloque = (b) => {
    const txt = getBloqueTexto(b)
    if (!txt) { alert('Sin contenido para copiar'); return }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(
        () => mostrarCopiado(b.key),
        () => fallbackCopy(txt, b.key)
      )
    } else {
      fallbackCopy(txt, b.key)
    }
  }

  const mostrarCopiado = (key) => {
    const el = document.getElementById(`copy-${key}`)
    if (el) {
      const original = el.textContent
      el.textContent = '✓ Copiado'
      setTimeout(() => { el.textContent = original }, 1500)
    }
  }

  const fallbackCopy = (txt, key) => {
    const ta = document.createElement('textarea')
    ta.value = txt
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
      mostrarCopiado(key)
    } catch(e) { alert('No se pudo copiar') }
    document.body.removeChild(ta)
  }

  // Normaliza cualquier valor (string, array, objeto) a texto
  const toText = (v) => {
    if (v == null) return ''
    if (typeof v === 'string') return v.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
    if (Array.isArray(v)) return v.map(toText).join('\n')
    if (typeof v === 'object') {
      return Object.entries(v).map(([k,val]) => `${k}\n${toText(val)}`).join('\n\n')
    }
    return String(v)
  }

  const lbl = { color:D.textMid, fontSize:11, fontWeight:700, letterSpacing:'0.4px', display:'block', marginBottom:4 }
  const wrap = { padding:'32px 20px', maxWidth:780, margin:'0 auto' }
  const globalStyle = `body,html{background:#ffffff;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#111827}`

  // ── FORMULARIO ───────────────────────────────────────────
  if (vista === 'form') return (
    <div style={{ background:'#ffffff', minHeight:'100vh' }}>
      <style>{globalStyle}</style>
      <div style={wrap}>
        <h1 style={{ color:D.text, fontSize:20, fontWeight:800, marginBottom:4 }}>Advertorial Creator</h1>
        <p style={{ color:D.textDim, fontSize:11, marginBottom:24, fontFamily:'monospace' }}>
          16 secciones · Nivel 2 · Estructura modelada del referente · Producto en bloque 11
        </p>

        {error && (
          <div style={{ padding:12, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, color:'#b91c1c', fontSize:12, marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:22, marginBottom:16 }}>
          <h3 style={{ color:D.blue, fontSize:13, marginBottom:16 }}>📦 Producto</h3>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>NOMBRE DEL PRODUCTO</label>
            <input style={inp} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: SkinBloom Anti-Estrías" />
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>INFORMACIÓN DEL PRODUCTO</label>
            <textarea style={{...inp, minHeight:130, resize:'vertical'}}
              value={contexto} onChange={e=>setContexto(e.target.value)}
              placeholder="Todo: qué es, para quién, ingredientes, beneficios, cómo funciona, diferenciadores, contraindicaciones, precio aproximado..." />
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>AVATAR</label>
            <textarea style={{...inp, minHeight:70, resize:'vertical'}}
              value={avatar} onChange={e=>setAvatar(e.target.value)}
              placeholder="Ej: Mujeres 30-45 años postparto, con estrías en abdomen y caderas, que han probado cremas sin resultado..." />
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>MERCADO / PAÍS</label>
            <input style={inp} value={mercado} onChange={e=>setMercado(e.target.value)}
              placeholder="Ej: Colombia, Guatemala, México, España..." />
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>LINEAMIENTO</label>
            <textarea style={{...inp, minHeight:60, resize:'vertical'}}
              value={lineamiento} onChange={e=>setLineamiento(e.target.value)}
              placeholder="Indicaciones especiales: tono, ingrediente a destacar, restricciones de contenido, mercado específico..." />
          </div>

          <div>
            <label style={lbl}>DOCUMENTOS DE INVESTIGACIÓN</label>
            {archivos.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6, padding:'8px 12px', background:'#f0fdf4', border:'1px solid #a7f3d0', borderRadius:5 }}>
                <span style={{ color:'#047857', fontSize:12 }}>📄 {f.name}</span>
                <button onClick={()=>quitarArchivo(i)} style={{ color:D.textDim, background:'none', border:'none', cursor:'pointer', fontSize:12 }}>✕</button>
              </div>
            ))}
            <div
              onClick={() => fileRef.current.click()}
              style={{
                marginTop:6, padding:'12px 16px',
                background:D.input, border:`2px dashed ${D.inputBorder}`,
                borderRadius:5, cursor:'pointer', textAlign:'center',
                color:D.textDim, fontSize:12, transition:'border-color 0.2s'
              }}
            >
              {archivos.length === 0
                ? '📎 Adjuntar PDF, Word o TXT — investigación de mercado, brief, info adicional'
                : '＋ Agregar otro documento'
              }
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,.markdown,image/png,image/jpeg,image/webp,image/gif" multiple style={{ display:'none' }} onChange={handleArchivo} />
            <p style={{ color:D.textDim, fontSize:10, margin:'4px 0 0', fontFamily:'monospace' }}>Máximo 5 documentos</p>
          </div>
        </div>

        <div style={{ background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:22, marginBottom:20 }}>
          <h3 style={{ color:D.blue, fontSize:13, marginBottom:14 }}>⚙️ Configuración</h3>
          <div>
            <label style={lbl}>MODELO IA</label>
            <select style={inp} value={modelo} onChange={e=>setModelo(e.target.value)}>
              {MODELOS.map(m=><option key={m.id} value={m.id}>{m.label} — {m.desc}</option>)}
            </select>
          </div>
          <div style={{ marginTop:12, padding:8, background:D.blueDark, borderRadius:4, fontSize:10, color:D.textDim, fontFamily:'monospace' }}>
            Motivo: <span style={{ color:D.blueLight }}>Educativo (fijo)</span> · Nivel 2 (fijo) · Producto: bloque 11 · 16 bloques totales
          </div>
        </div>

        <button onClick={generar} style={{
          width:'100%', padding:'13px', background:D.blue, color:'#fff',
          border:'none', borderRadius:6, fontWeight:800, cursor:'pointer', fontSize:14,
        }}>
          ⚡ Generar Advertorial
        </button>
      </div>
    </div>
  )

  // ── LOADING ───────────────────────────────────────────────
  if (vista === 'loading') return (
    <div style={{ background:'#ffffff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign:'center', width:'100%', padding:'0 20px' }}>
        <div style={{ fontSize:36, marginBottom:16 }}>⚡</div>
        <h2 style={{ color:D.text, fontSize:16, fontWeight:700, marginBottom:8 }}>Generando Advertorial</h2>
        <p style={{ color:D.blueLight, fontSize:12, fontFamily:'monospace', marginBottom:24 }}>{progresoMsg}</p>
        <div style={{ background:D.card, borderRadius:8, height:6, width:'100%', maxWidth:400, margin:'0 auto 24px', overflow:'hidden' }}>
          <div style={{ background:D.blue, height:'100%', width:`${progreso}%`, transition:'width 0.5s ease', borderRadius:8 }} />
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          {['Analizar','Briefing','Escribir'].map((s,i) => {
            const done = (progreso > 30 && i===0) || (progreso > 60 && i===1)
            const active = (progreso <= 30 && i===0) || (progreso > 30 && progreso <= 60 && i===1) || (progreso > 60 && i===2)
            return (
              <div key={s} style={{
                padding:'5px 14px', borderRadius:4, fontSize:11, fontFamily:'monospace', fontWeight:700,
                background: done ? '#f0fdf4' : active ? D.blueDark : D.card,
                border:`1px solid ${done ? '#86efac' : active ? D.blue : D.cardBorder}`,
                color: done ? '#15803d' : active ? D.blueLight : D.textDim,
              }}>{done ? '✓ ' : ''}{s}</div>
            )
          })}
        </div>
        <p style={{ color:D.textDim, fontSize:10, marginTop:20, fontFamily:'monospace' }}>30-60 segundos</p>
      </div>
    </div>
  )

  // ── RESULTADO ─────────────────────────────────────────────
  return (
    <div style={{ background:'#ffffff', minHeight:'100vh' }}>
      <style>{globalStyle}</style>
      <div style={wrap}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h1 style={{ color:D.text, fontSize:18, fontWeight:800, marginBottom:2 }}>📄 Advertorial Listo</h1>
            <p style={{ color:D.textDim, fontSize:10, fontFamily:'monospace' }}>{nombre} · {modelo} · educativo</p>
          </div>
          <button onClick={()=>{ setVista('form'); setAdvertorial(null) }}
            style={{ padding:'7px 14px', background:D.card, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, cursor:'pointer', fontSize:12 }}>
            + Nuevo
          </button>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <button onClick={()=>copiar('texto')}
            style={{ flex:1, padding:'10px', background:D.blue, color:'#fff', border:'none', borderRadius:5, fontWeight:700, cursor:'pointer', fontSize:12 }}>
            📋 Copiar texto
          </button>
          <button onClick={()=>copiar('json')}
            style={{ padding:'10px 16px', background:D.card, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, cursor:'pointer', fontSize:12 }}>
            JSON
          </button>
        </div>

        {BLOQUES.map(b => (
          <div key={b.num} style={{
            background:D.card,
            border:`1px solid ${b.num===11 ? D.yellow : b.producto ? '#1f4a38' : D.cardBorder}`,
            borderRadius:8, padding:18, marginBottom:10,
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  width:22, height:22,
                  background: b.num===11 ? D.yellow : b.producto ? D.green : D.blue,
                  color: b.num===11 ? '#1a1208' : '#fff',
                  borderRadius:'50%', fontSize:10, fontWeight:700, marginRight:8, flexShrink:0,
                }}>{b.num}</span>
                <h4 style={{ color: b.num===11 ? D.yellow : b.producto ? D.green : D.blueLight, fontSize:12, margin:0 }}>
                  {b.titulo}
                </h4>
                {b.num===11 && <span style={{ marginLeft:8, fontSize:9, color:'#b45309', fontFamily:'monospace', background:'#fffbeb', padding:'2px 6px', borderRadius:3, border:'1px solid #fcd34d' }}>← PRODUCTO</span>}
              </div>
              <button id={`copy-${b.key}`} onClick={()=>copiarBloque(b)}
                style={{ padding:'4px 10px', background:D.input, border:`1px solid ${D.cardBorder}`, color:D.blueLight, borderRadius:4, fontSize:10, cursor:'pointer', fontFamily:'monospace' }}>
                📋 Copiar
              </button>
            </div>

            {b.key === 'titular' && advertorial.titulares ? (
              <div>
                {advertorial.titulares.map((t,i) => (
                  <div key={i} style={{ padding:'10px 12px', background:D.input, borderRadius:5, marginBottom:6, border:`1px solid ${D.cardBorder}` }}>
                    <span style={{ color:D.yellow, fontSize:10, fontFamily:'monospace', fontWeight:700, marginRight:8 }}>OPCIÓN {i+1}</span>
                    <span style={{ color:D.text, fontSize:13, lineHeight:1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            ) : b.key === 'transicionMecanismo' && advertorial.nombresMecanismo ? (
              <div>
                <div style={{ marginBottom:14, padding:10, background:D.blueDark, borderRadius:5, border:`1px solid ${D.blue}` }}>
                  <p style={{ color:D.blueLight, fontSize:10, fontFamily:'monospace', fontWeight:700, marginBottom:6 }}>3 NOMBRES SUGERIDOS PARA EL MECANISMO:</p>
                  {advertorial.nombresMecanismo.map((n,i) => (
                    <div key={i} style={{ color:D.text, fontSize:12, padding:'3px 0' }}>
                      <span style={{ color:D.yellow, fontWeight:700, marginRight:6 }}>{i+1}.</span>{n}
                    </div>
                  ))}
                </div>
                <p style={{ color:D.textMid, fontSize:12, lineHeight:1.85, whiteSpace:'pre-wrap', margin:0 }}>
                  {toText(advertorial[b.key]) || '(no generado)'}
                </p>
              </div>
            ) : (
              <p style={{ color:D.textMid, fontSize:12, lineHeight:1.85, whiteSpace:'pre-wrap', margin:0 }}>
                {toText(advertorial[b.key]) || '(no generado)'}
              </p>
            )}
          </div>
        ))}

        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button onClick={()=>copiar('texto')}
            style={{ flex:1, padding:'10px', background:D.blue, color:'#fff', border:'none', borderRadius:5, fontWeight:700, cursor:'pointer', fontSize:12 }}>
            📋 Copiar texto
          </button>
          <button onClick={()=>{ setVista('form'); setAdvertorial(null) }}
            style={{ flex:1, padding:'10px', background:D.card, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, cursor:'pointer', fontSize:12 }}>
            + Nuevo advertorial
          </button>
          <button onClick={()=>{ setAdAvatar(avatar||''); setModalAd(true) }}
            style={{ flex:1, padding:'10px', background:D.green, color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:700 }}>
            → Generar Ad/Guion
          </button>
        </div>
      </div>

      {modalAd && (
        <div onClick={(e)=>{ if(e.target===e.currentTarget) setModalAd(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:10, padding:24, maxWidth:600, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:13, color:D.blueLight, fontWeight:700, marginBottom:4 }}>Configurar Ad/Guion</div>
            <div style={{ fontSize:11, color:D.textDim, marginBottom:18 }}>
              Producto: <b style={{color:D.text}}>{nombre}</b> · Mercado: <b style={{color:D.text}}>{mercado}</b>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Nivel de consciencia</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))', gap:6 }}>
                {[
                  {n:1, l:'Inconsciente'},
                  {n:2, l:'Consciente del problema'},
                  {n:3, l:'Consciente de la solución'},
                  {n:4, l:'Consciente del producto'},
                  {n:5, l:'Totalmente consciente'},
                ].map(o => (
                  <button key={o.n} onClick={()=>setAdNivel(o.n)}
                    style={{ padding:'8px 10px', background:adNivel===o.n?D.blueDark:D.input, border:`1px solid ${adNivel===o.n?D.blue:D.cardBorder}`, color:adNivel===o.n?D.blueLight:D.textMid, borderRadius:5, cursor:'pointer', fontSize:10, textAlign:'center', fontFamily:'inherit' }}>
                    <div style={{ fontWeight:700, marginBottom:2 }}>Nv. {o.n}</div>
                    <div style={{ lineHeight:1.2 }}>{o.l}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Motivo / Tipo</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['Emocional','Funcional','Educativo','Aspiracional','Racional'].map(t => (
                  <button key={t} onClick={()=>setAdTipo(t)}
                    style={{ padding:'7px 14px', background:adTipo===t?D.blueDark:D.input, border:`1px solid ${adTipo===t?D.blue:D.cardBorder}`, color:adTipo===t?D.blueLight:D.textMid, borderRadius:20, cursor:'pointer', fontSize:11, fontFamily:'inherit', fontWeight:adTipo===t?600:400 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Avatar</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                <button onClick={()=>{ setAdAvatar(avatar||''); setAdAvatarManual('') }}
                  style={{ padding:'7px 12px', background:(adAvatar===avatar && !adAvatarManual)?D.blueDark:D.input, border:`1px solid ${(adAvatar===avatar && !adAvatarManual)?D.blue:D.cardBorder}`, color:(adAvatar===avatar && !adAvatarManual)?D.blueLight:D.textMid, borderRadius:20, cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
                  📌 El del advertorial: <b>{avatar}</b>
                </button>
              </div>
              <input type="text" value={adAvatarManual} onChange={e=>{ setAdAvatarManual(e.target.value); if(e.target.value.trim()) setAdAvatar('') }}
                placeholder="O escribe un avatar específico..."
                style={{ width:'100%', padding:'8px 11px', background:D.input, border:`1px solid ${adAvatarManual.trim()?D.blue:D.inputBorder}`, color:D.text, borderRadius:5, fontSize:11, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Ángulo de venta</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  'Problema/Dolor','Beneficio/Resultado','Curiosidad','Urgencia/Escasez',
                  'Autoridad/Prueba Social','Novedad','Comparación/Contraste','Enemigo en Común',
                  'Historia','Transformación','FOMO','Simplicidad','Ironía/Provocación',
                  'Precio/Valor','Exclusividad','Aspiracional'
                ].map(a => (
                  <button key={a} onClick={()=>setAdAngulo(a)}
                    style={{ padding:'5px 10px', background:adAngulo===a?D.blueDark:D.input, border:`1px solid ${adAngulo===a?D.blue:D.cardBorder}`, color:adAngulo===a?D.blueLight:D.textMid, borderRadius:14, cursor:'pointer', fontSize:10, fontFamily:'inherit' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:`1px solid ${D.cardBorder}` }}>
              <button onClick={()=>setModalAd(false)}
                style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                Cancelar
              </button>
              <button onClick={()=>{
                  const avatarFinal = adAvatarManual.trim() || adAvatar || avatar || ''
                  const payload = {
                    nombre, contexto, avatar: avatarFinal, mercado, advertorial,
                    decisiones: { nivel: adNivel, tipo: adTipo, avatar: avatarFinal, angulo: adAngulo }
                  }
                  localStorage.setItem('advertorial_ctx', JSON.stringify(payload))
                  window.location.href = '/ads/?ctx=advertorial'
                }}
                style={{ flex:2, padding:'10px', background:D.green, color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                → Continuar al Paso 3
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
