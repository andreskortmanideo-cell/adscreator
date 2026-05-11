import { useEffect, useState } from 'react'

const D = {
  bg:'#ffffff', card:'#ffffff', cardBorder:'#e5e7eb',
  input:'#ffffff', inputBorder:'#d1d5db',
  blue:'#2563eb', blueLight:'#3b82f6', blueDark:'#eff6ff',
  text:'#111827', textMid:'#4b5563', textDim:'#6b7280',
  green:'#059669', yellow:'#d97706',
}

export default function HistorialCompartido() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroDisenador, setFiltroDisenador] = useState('')

  useEffect(() => {
    let abort = false
    ;(async () => {
      try {
        const r = await fetch('/api/advertoriales/list?limit=200')
        const d = await r.json()
        if (abort) return
        if (d.error) throw new Error(d.error)
        setItems(d.items || [])
        setTotal(d.total || 0)
      } catch(e) {
        if (!abort) setError(e.message)
      } finally {
        if (!abort) setCargando(false)
      }
    })()
    return () => { abort = true }
  }, [])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este advertorial del historial compartido?')) return
    try {
      const r = await fetch(`/api/advertoriales/${id}`, { method:'DELETE' })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setItems(prev => prev.filter(x => x.id !== id))
      setTotal(t => Math.max(0, t-1))
    } catch(e) {
      alert('Error: ' + e.message)
    }
  }

  const disenadoresUnicos = Array.from(new Set(items.map(x => (x.disenador_nombre || 'desconocido').trim()).filter(Boolean))).sort()
  const visibles = filtroDisenador ? items.filter(x => (x.disenador_nombre || '') === filtroDisenador) : items

  const fmtFecha = (iso) => {
    try { return new Date(iso).toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' }) } catch { return iso }
  }

  return (
    <div style={{ background:D.bg, minHeight:'100vh' }}>
      <style>{`body,html{background:#fff;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#111827}`}</style>

      <div style={{ background:'#ffffff', borderBottom:`1px solid ${D.cardBorder}`, padding:'0 28px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ lineHeight:1 }}>
          <div style={{ fontSize:16, fontWeight:800, color:D.text, letterSpacing:'.1em' }}>IDEO TEAM</div>
          <div style={{ fontSize:9, color:D.blue, letterSpacing:'.2em', textTransform:'uppercase', marginTop:3 }}>Historial Compartido</div>
        </div>
        <a href="/ads/advertorial" style={{ fontSize:11, color:D.text, border:`1px solid ${D.cardBorder}`, borderRadius:20, padding:'5px 14px', background:'transparent', cursor:'pointer', textDecoration:'none' }}>
          ← Volver
        </a>
      </div>

      <div style={{ padding:'32px 20px', maxWidth:900, margin:'0 auto' }}>
        <h1 style={{ color:D.text, fontSize:20, fontWeight:800, marginBottom:4 }}>Historial Compartido</h1>
        <p style={{ color:D.textDim, fontSize:11, marginBottom:24, fontFamily:'monospace' }}>
          {total} advertorial{total===1?'':'es'} guardado{total===1?'':'s'} · visible para todos los diseñadores
        </p>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <label style={{ fontSize:11, color:D.textMid, fontWeight:600 }}>Filtrar por diseñador:</label>
          <select value={filtroDisenador} onChange={e=>setFiltroDisenador(e.target.value)}
            style={{ background:D.input, border:`1px solid ${D.inputBorder}`, color:D.text, padding:'6px 10px', borderRadius:6, fontSize:12, outline:'none', fontFamily:'inherit' }}>
            <option value="">Todos ({items.length})</option>
            {disenadoresUnicos.map(d => (
              <option key={d} value={d}>{d} ({items.filter(x => (x.disenador_nombre||'')===d).length})</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ padding:12, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:6, color:'#b91c1c', fontSize:12, marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        {cargando ? (
          <p style={{ color:D.textDim, fontSize:12 }}>Cargando…</p>
        ) : visibles.length === 0 ? (
          <p style={{ color:D.textDim, fontSize:12 }}>{filtroDisenador ? `Ningún advertorial de ${filtroDisenador}.` : 'No hay advertoriales guardados todavía.'}</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {visibles.map(it => (
              <div key={it.id} style={{ background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:D.text, fontSize:13, fontWeight:700, marginBottom:4 }}>📄 {it.producto || '(sin nombre)'}</div>
                    <div style={{ color:D.textDim, fontSize:10, fontFamily:'monospace', marginBottom:3 }}>
                      {fmtFecha(it.creado_en)}{it.mercado ? ` · ${it.mercado}` : ''}{it.modelo ? ` · ${it.modelo}` : ''}
                    </div>
                    <div style={{ color:D.blue, fontSize:11, fontWeight:600 }}>
                      👤 Diseñador: {it.disenador_nombre || 'desconocido'}
                    </div>
                    {it.avatar && (
                      <div style={{ color:D.textMid, fontSize:11, marginTop:4 }}>Avatar: {it.avatar}</div>
                    )}
                    {(it.costo_usd > 0) && (
                      <div style={{ color:D.textDim, fontSize:10, fontFamily:'monospace', marginTop:4 }}>
                        ${Number(it.costo_usd).toFixed(4)} USD · {it.operaciones || 0} ops
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <a href={`/ads/advertorial?id=${it.id}`}
                      style={{ fontSize:11, color:D.blue, border:`1px solid ${D.cardBorder}`, borderRadius:6, padding:'5px 10px', background:'transparent', textDecoration:'none' }}>
                      Abrir
                    </a>
                    <button onClick={()=>eliminar(it.id)}
                      style={{ fontSize:11, color:'#b91c1c', border:`1px solid #fecaca`, borderRadius:6, padding:'5px 10px', background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
