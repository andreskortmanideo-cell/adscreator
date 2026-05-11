import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { BLOQUES, toText, parseTestimonios, parseFaq } from '../../lib/advertorial-format'

const D = {
  bg:'#ffffff', card:'#ffffff', cardBorder:'#e5e7eb',
  input:'#ffffff', inputBorder:'#d1d5db',
  blue:'#2563eb', blueLight:'#3b82f6', blueDark:'#eff6ff',
  text:'#111827', textMid:'#4b5563', textDim:'#6b7280',
  green:'#059669', yellow:'#d97706',
}

export default function AdvertorialDetalle() {
  const router = useRouter()
  const { id } = router.query

  const [registro, setRegistro] = useState(null)
  const [advertorial, setAdvertorial] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [modalCorr, setModalCorr] = useState({ open:false, blockKey:null, blockTitulo:'' })
  const [instruccionCorr, setInstruccionCorr] = useState('')
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [errorCorr, setErrorCorr] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [costoCorrecciones, setCostoCorrecciones] = useState({ usd:0, cop:0, operaciones:0 })

  useEffect(() => {
    if (!id) return
    let abort = false
    ;(async () => {
      try {
        setCargando(true)
        const r = await fetch(`/api/advertoriales/${id}`)
        const d = await r.json()
        if (abort) return
        if (!r.ok || d.error) throw new Error(d.error || 'No encontrado')
        setRegistro(d)
        const adv = d?.datos?.advertorial || null
        setAdvertorial(adv)
      } catch(e) {
        if (!abort) setError(e.message)
      } finally {
        if (!abort) setCargando(false)
      }
    })()
    return () => { abort = true }
  }, [id])

  const mostrarCopiado = (key, label='✓ Copiado') => {
    const el = document.getElementById(`copy-${key}`)
    if (el) {
      const original = el.textContent
      el.textContent = label
      setTimeout(() => { el.textContent = original }, 1500)
    }
  }
  const fallbackCopy = (txt, key, label='✓ Copiado') => {
    const ta = document.createElement('textarea')
    ta.value = txt
    ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    try { document.execCommand('copy'); mostrarCopiado(key, label) } catch(e) {}
    document.body.removeChild(ta)
  }
  const _doCopy = (text, key, label='✓ Copiado') => {
    if (!text) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => mostrarCopiado(key, label), () => fallbackCopy(text, key, label))
    } else fallbackCopy(text, key, label)
  }
  const getBloqueTexto = (b) => {
    if (!advertorial) return ''
    if (b.key === 'titular') {
      const t = advertorial.titulares || (advertorial.titular ? [advertorial.titular] : [])
      return t.map((x,i) => `Opción ${i+1}: ${x}`).join('\n')
    }
    return toText(advertorial[b.key])
  }
  const copiar = (tipo, btnKey) => {
    const txt = tipo === 'json'
      ? JSON.stringify(advertorial, null, 2)
      : BLOQUES.map(b => `[${b.titulo.toUpperCase()}]\n${getBloqueTexto(b)}`).join('\n\n---\n\n')
    _doCopy(txt, btnKey)
  }
  const copiarBloque = (b) => _doCopy(getBloqueTexto(b), b.key)
  const copiarOpcion = (text, key) => _doCopy(text, key, '✓')

  const abrirCorreccion = (b) => {
    setModalCorr({ open:true, blockKey:b.key, blockTitulo:b.titulo })
    setInstruccionCorr(''); setErrorCorr(null)
  }
  const cerrarCorreccion = () => {
    if (corrigiendo) return
    setModalCorr({ open:false, blockKey:null, blockTitulo:'' })
    setInstruccionCorr(''); setErrorCorr(null)
  }
  const aplicarCorreccion = async () => {
    if (!modalCorr.blockKey || instruccionCorr.trim().length < 8) return
    setCorrigiendo(true); setErrorCorr(null)
    try {
      const blockKey = modalCorr.blockKey
      const blockContent = advertorial?.[blockKey]
      const datos = registro?.datos || {}
      const modelo = datos.modelo || registro?.modelo || 'claude-haiku-4-5-20251001'
      const contextoAdvertorial = {
        nombre: datos.nombre || registro?.producto || '',
        avatar: datos.avatar || registro?.avatar || '',
        mercado: datos.mercado || registro?.mercado || '',
        ejeNarrativo: datos.briefing?.ejeNarrativo || null,
        bajada: advertorial?.bajada || '',
      }
      const r = await fetch('/api/advertorial/corregir-bloque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockKey, blockContent, instruccionUsuario: instruccionCorr, contextoAdvertorial, modelo })
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      const nuevoAdv = { ...advertorial, [blockKey]: d.contenidoCorregido }
      setAdvertorial(nuevoAdv)
      let nuevoCosto = costoCorrecciones
      if (d.costoOperacion?.totales) {
        const t = d.costoOperacion.totales
        nuevoCosto = { usd: costoCorrecciones.usd + t.usd, cop: costoCorrecciones.cop + t.cop, operaciones: costoCorrecciones.operaciones + 1 }
        setCostoCorrecciones(nuevoCosto)
      }
      // Re-guardar (PATCH) en SQLite
      const body = {
        id: registro?.id,
        disenador_nombre: registro?.disenador_nombre || 'desconocido',
        producto: registro?.producto || '',
        avatar: registro?.avatar || '',
        mercado: registro?.mercado || '',
        modelo,
        costoUsd: Number(registro?.costo_usd || 0) + nuevoCosto.usd,
        costoCop: Number(registro?.costo_cop || 0) + nuevoCosto.cop,
        operaciones: Number(registro?.operaciones || 0) + nuevoCosto.operaciones,
        payload: { ...datos, advertorial: nuevoAdv }
      }
      await fetch('/api/advertoriales/save', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })
      setModalCorr({ open:false, blockKey:null, blockTitulo:'' })
      setInstruccionCorr('')
      setToastMsg('✓ Bloque corregido')
      setTimeout(() => setToastMsg(''), 2000)
    } catch(e) {
      setErrorCorr('No se pudo corregir el bloque. Intenta de nuevo.')
    } finally {
      setCorrigiendo(false)
    }
  }

  const wrap = { padding:'32px 20px', maxWidth:780, margin:'0 auto' }
  const globalStyle = `body,html{background:#ffffff;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#111827}`

  if (cargando) return (
    <div style={{ background:D.bg, minHeight:'100vh' }}>
      <style>{globalStyle}</style>
      <div style={{ padding:'80px 20px', textAlign:'center', color:D.textDim, fontSize:13 }}>Cargando advertorial…</div>
    </div>
  )
  if (error || !advertorial) return (
    <div style={{ background:D.bg, minHeight:'100vh' }}>
      <style>{globalStyle}</style>
      <div style={{ padding:'80px 20px', textAlign:'center' }}>
        <h2 style={{ color:D.text, fontSize:18, fontWeight:800, marginBottom:8 }}>Advertorial no encontrado</h2>
        <p style={{ color:D.textDim, fontSize:12, marginBottom:20 }}>{error || 'El id solicitado no devolvió ningún registro.'}</p>
        <a href="/ads/mis-advertoriales" style={{ display:'inline-block', padding:'8px 16px', background:D.blue, color:'#fff', borderRadius:6, textDecoration:'none', fontSize:13, fontWeight:700 }}>
          ← Volver al Historial Compartido
        </a>
      </div>
    </div>
  )

  const fmtFecha = (iso) => { try { return new Date(iso).toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' }) } catch { return iso } }
  const costoTotalGuardado = Number(registro?.costo_usd || 0) + costoCorrecciones.usd

  return (
    <div style={{ background:D.bg, minHeight:'100vh' }}>
      <style>{globalStyle}</style>

      <div style={{ background:'#ffffff', borderBottom:`1px solid ${D.cardBorder}`, padding:'0 28px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ lineHeight:1 }}>
          <div style={{ fontSize:16, fontWeight:800, color:D.text, letterSpacing:'.1em' }}>IDEO TEAM</div>
          <div style={{ fontSize:9, color:D.blue, letterSpacing:'.2em', textTransform:'uppercase', marginTop:3 }}>Advertorial · #{registro?.id}</div>
        </div>
        <a href="/ads/mis-advertoriales" style={{ fontSize:11, color:D.text, border:`1px solid ${D.cardBorder}`, borderRadius:20, padding:'5px 14px', background:'transparent', textDecoration:'none' }}>
          ← Historial
        </a>
      </div>

      <div style={wrap}>
        <div style={{ marginBottom:18 }}>
          <h1 style={{ color:D.text, fontSize:18, fontWeight:800, marginBottom:2 }}>📄 {registro?.producto || 'Advertorial'}</h1>
          <p style={{ color:D.textDim, fontSize:10, fontFamily:'monospace' }}>
            {fmtFecha(registro?.creado_en)} · {registro?.modelo || ''}{registro?.mercado ? ` · ${registro.mercado}` : ''}
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          <div style={{ padding:'4px 10px', background:D.blueDark, border:`1px solid ${D.cardBorder}`, borderRadius:20, fontSize:11, color:D.blue, fontWeight:600 }}>
            👤 Creado por: {registro?.disenador_nombre || 'desconocido'}
          </div>
          <div style={{ padding:'4px 10px', background:D.input, border:`1px solid ${D.cardBorder}`, borderRadius:20, fontSize:11, color:D.textMid }}>
            Costo total: <strong style={{ color:D.text }}>${costoTotalGuardado.toFixed(4)} USD</strong>
            {costoCorrecciones.operaciones > 0 && (
              <span style={{ color:D.yellow, marginLeft:6 }}>(+{costoCorrecciones.operaciones} correccion{costoCorrecciones.operaciones===1?'':'es'})</span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <button id="copy-all-text-top" onClick={()=>copiar('texto', 'all-text-top')}
            style={{ flex:1, padding:'10px', background:D.blue, color:'#fff', border:'none', borderRadius:5, fontWeight:700, cursor:'pointer', fontSize:12 }}>
            📋 Copiar texto
          </button>
          <button id="copy-all-json" onClick={()=>copiar('json', 'all-json')}
            style={{ padding:'10px 16px', background:D.card, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, cursor:'pointer', fontSize:12 }}>
            JSON
          </button>
        </div>

        {BLOQUES.map(b => (
          <div key={b.num} style={{
            background:D.card,
            border:`1px solid ${b.num===11 ? D.yellow : b.producto ? D.green : D.cardBorder}`,
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
              <div style={{ display:'flex', gap:6 }}>
                <button id={`copy-${b.key}`} onClick={()=>copiarBloque(b)}
                  style={{ padding:'4px 10px', background:D.input, border:`1px solid ${D.cardBorder}`, color:D.blueLight, borderRadius:4, fontSize:10, cursor:'pointer', fontFamily:'monospace' }}>
                  📋 Copiar
                </button>
                <button onClick={()=>abrirCorreccion(b)}
                  style={{ padding:'4px 10px', background:D.input, border:`1px solid ${D.cardBorder}`, color:D.yellow, borderRadius:4, fontSize:10, cursor:'pointer', fontFamily:'monospace' }}>
                  ✏️ Corregir
                </button>
              </div>
            </div>

            {b.key === 'titular' && advertorial.titulares ? (
              <div>
                {advertorial.titulares.map((t,i) => {
                  const optKey = `titular-${i}`
                  return (
                    <div key={i} style={{ padding:'10px 12px', background:D.input, borderRadius:5, marginBottom:6, border:`1px solid ${D.cardBorder}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ color:D.yellow, fontSize:10, fontFamily:'monospace', fontWeight:700, marginRight:8 }}>OPCIÓN {i+1}</span>
                        <span style={{ color:D.text, fontSize:13, lineHeight:1.5 }}>{t}</span>
                      </div>
                      <button id={`copy-${optKey}`} onClick={()=>copiarOpcion(t, optKey)}
                        style={{ padding:'3px 8px', background:'transparent', border:`1px solid ${D.cardBorder}`, color:D.blueLight, borderRadius:4, fontSize:10, cursor:'pointer', fontFamily:'monospace', flexShrink:0 }}>
                        📋
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : b.key === 'transicionMecanismo' && advertorial.nombresMecanismo ? (
              <div>
                <div style={{ marginBottom:14, padding:10, background:D.blueDark, borderRadius:5, border:`1px solid ${D.blue}` }}>
                  <p style={{ color:D.blueLight, fontSize:10, fontFamily:'monospace', fontWeight:700, marginBottom:6 }}>3 NOMBRES SUGERIDOS PARA EL MECANISMO:</p>
                  {advertorial.nombresMecanismo.map((n,i) => {
                    const optKey = `mecanismo-${i}`
                    return (
                      <div key={i} style={{ color:D.text, fontSize:12, padding:'3px 0', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:D.yellow, fontWeight:700, marginRight:2, flexShrink:0 }}>{i+1}.</span>
                        <span style={{ flex:1, minWidth:0 }}>{n}</span>
                        <button id={`copy-${optKey}`} onClick={()=>copiarOpcion(n, optKey)}
                          style={{ padding:'2px 6px', background:'transparent', border:`1px solid ${D.cardBorder}`, color:D.blueLight, borderRadius:4, fontSize:10, cursor:'pointer', fontFamily:'monospace', flexShrink:0 }}>
                          📋
                        </button>
                      </div>
                    )
                  })}
                </div>
                <p style={{ color:D.textMid, fontSize:12, lineHeight:1.85, whiteSpace:'pre-wrap', margin:0 }}>
                  {toText(advertorial[b.key]) || '(no generado)'}
                </p>
              </div>
            ) : b.key === 'testimonios' && parseTestimonios(toText(advertorial[b.key])) ? (
              <div>
                {parseTestimonios(toText(advertorial[b.key])).map((t,i) => (
                  <div key={i} style={{ background:D.input, border:`1px solid ${D.cardBorder}`, borderRadius:12, padding:16, marginBottom:14 }}>
                    <div style={{ color:D.yellow, fontSize:14, letterSpacing:'.05em', marginBottom:10 }}>{t.estrellas}</div>
                    <p style={{ color:D.text, fontSize:14, lineHeight:1.7, margin:'0 0 12px', whiteSpace:'pre-wrap' }}>“{t.review}”</p>
                    {t.footer.length > 0 && (
                      <div style={{ color:D.textMid, fontSize:12, lineHeight:1.5, borderTop:`1px solid ${D.cardBorder}`, paddingTop:10 }}>
                        {t.footer.map((l,j) => <div key={j}>{l}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : b.key === 'faq' && parseFaq(toText(advertorial[b.key])) ? (
              <div>
                {parseFaq(toText(advertorial[b.key])).map((q,i) => (
                  <div key={i} style={{ background:D.input, border:`1px solid ${D.cardBorder}`, borderRadius:12, padding:16, marginBottom:14 }}>
                    {q.autor && <div style={{ color:D.textDim, fontSize:11, marginBottom:6 }}>{q.autor}</div>}
                    <p style={{ color:D.text, fontSize:14, fontWeight:700, lineHeight:1.5, margin:'0 0 10px' }}>{q.pregunta}</p>
                    {q.experto && <div style={{ color:D.blue, fontSize:11, fontWeight:600, marginBottom:6 }}>{q.experto}</div>}
                    <p style={{ color:D.textMid, fontSize:14, lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' }}>{q.respuesta}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color:D.textMid, fontSize:12, lineHeight:1.85, whiteSpace:'pre-wrap', margin:0 }}>
                {toText(advertorial[b.key]) || '(no generado)'}
              </p>
            )}
          </div>
        ))}

        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button id="copy-all-text-bottom" onClick={()=>copiar('texto', 'all-text-bottom')}
            style={{ flex:1, padding:'10px', background:D.blue, color:'#fff', border:'none', borderRadius:5, fontWeight:700, cursor:'pointer', fontSize:12 }}>
            📋 Copiar texto
          </button>
          <a href="/ads/mis-advertoriales"
            style={{ flex:1, padding:'10px', background:D.card, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, fontSize:12, textAlign:'center', textDecoration:'none' }}>
            ← Historial Compartido
          </a>
        </div>
      </div>

      {modalCorr.open && (
        <div onClick={(e)=>{ if(e.target===e.currentTarget) cerrarCorreccion() }}
          style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.5)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:10, padding:24, maxWidth:520, width:'100%' }}>
            <div style={{ fontSize:13, color:D.yellow, fontWeight:700, marginBottom:4 }}>✏️ Corregir bloque: {modalCorr.blockTitulo}</div>
            <div style={{ fontSize:11, color:D.textDim, marginBottom:14 }}>
              Indica qué cambiar. Se preserva el eje narrativo y la estructura del bloque.
            </div>
            <textarea
              value={instruccionCorr}
              onChange={e=>setInstruccionCorr(e.target.value)}
              placeholder="Ej: hacerlo más urgente / menos técnico / cambiar el nombre del experto"
              disabled={corrigiendo}
              style={{ width:'100%', minHeight:110, padding:'10px 12px', background:D.input, border:`1px solid ${D.inputBorder}`, color:D.text, borderRadius:6, fontSize:12, outline:'none', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', marginBottom:6 }}
            />
            <div style={{ fontSize:10, color:D.textDim, fontFamily:'monospace', marginBottom:14 }}>
              {instruccionCorr.trim().length} / 8 chars mínimos
            </div>
            {errorCorr && (
              <div style={{ padding:10, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, color:'#b91c1c', fontSize:12, marginBottom:12 }}>
                ⚠️ {errorCorr}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={cerrarCorreccion} disabled={corrigiendo}
                style={{ flex:1, padding:'10px', background:'transparent', border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:5, cursor: corrigiendo?'not-allowed':'pointer', fontSize:12, fontFamily:'inherit', opacity:corrigiendo?.5:1 }}>
                Cancelar
              </button>
              <button onClick={aplicarCorreccion} disabled={corrigiendo || instruccionCorr.trim().length < 8}
                style={{ flex:2, padding:'10px', background: (corrigiendo || instruccionCorr.trim().length < 8) ? D.cardBorder : D.yellow, color:'#fff', border:'none', borderRadius:5, cursor:(corrigiendo || instruccionCorr.trim().length < 8)?'not-allowed':'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                {corrigiendo ? '⏳ Corrigiendo…' : 'Aplicar corrección'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)', background:D.green, color:'#fff', padding:'10px 20px', borderRadius:6, fontSize:12, fontWeight:700, zIndex:1200, boxShadow:'0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
