import { useState, useEffect } from 'react'
import Head from 'next/head'

const D = {
  bg:'#07111c',card:'#0b1e2d',cardBorder:'#0d2f45',
  input:'#071824',inputBorder:'#0d2f45',
  blue:'#1a8cc4',blueLight:'#6ab8d8',blueDark:'#0a2236',blueDim:'#0d3a52',
  text:'#c8dde8',textMid:'#8ab4cc',textDim:'#3d7a9a',textFaint:'#1d5a78',
  accent:'#071420',green:'#1f7a60',greenBg:'#071e1a',greenBorder:'#0a3028'
}

export default function AdsDesdeAdvertorial() {
  const [advData, setAdvData] = useState(null)
  const [analisis, setAnalisis] = useState(null)
  const [errorMapeo, setErrorMapeo] = useState(null)
  const [mapeando, setMapeando] = useState(true)

  // Decisiones del usuario (paso 2)
  const [pais, setPais] = useState('Colombia')
  const [plat, setPlat] = useState('Meta Ads')
  const [formato, setFormato] = useState('video')
  const [duracion, setDuracion] = useState('30')
  const [formatoImagen, setFormatoImagen] = useState('Funcional')
  const [nivelSel, setNivelSel] = useState(null)
  const [tipo, setTipo] = useState(null)
  const [avatarSel, setAvatarSel] = useState(null)
  const [avatarManual, setAvatarManual] = useState('')
  const [anguloSel, setAnguloSel] = useState(null)
  const [modeloSel, setModeloSel] = useState('gpt-4.1-mini')

  // Generación
  const [generando, setGenerando] = useState(false)
  const [versiones, setVersiones] = useState([])
  const [versionActiva, setVersionActiva] = useState(0)
  const [correccion, setCorreccion] = useState('')
  const [historial, setHistorial] = useState([])
  const [msgs, setMsgs] = useState([])
  const [mostrarContexto, setMostrarContexto] = useState(false)

  // Cargar advertorial al montar y mapear con IA
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('advertorial_ctx') : null
    if (!raw) {
      setErrorMapeo('No hay advertorial cargado. Vuelve al advertorial y haz clic en "Generar Ad/Guion".')
      setMapeando(false)
      return
    }
    let data
    try {
      data = JSON.parse(raw)
    } catch(e) {
      setErrorMapeo('El advertorial cargado tiene formato inválido.')
      setMapeando(false)
      return
    }
    setAdvData(data)
    if (data.mercado) setPais(data.mercado)

    mapearAdvertorial(data)
  }, [])

  async function api(messages, modo) {
    const r = await fetch('/api/generate', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({messages, modo, apiProvider: modeloSel.startsWith('claude')?'claude':'openai', modelo: modeloSel})
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error)
    return d
  }

  async function mapearAdvertorial(data) {
    setMapeando(true); setErrorMapeo(null)
    const adv = data.advertorial || {}
    const txt = (v) => typeof v === 'string' ? v : (v ? JSON.stringify(v) : '')

    // Construir el "advertorial fuente" como texto plano para enviar al modelo
    const adFuente = `
NOMBRE PRODUCTO: ${data.nombre || ''}
MERCADO: ${data.mercado || 'Colombia'}
AVATAR INICIAL: ${data.avatar || ''}
CONTEXTO BASE: ${data.contexto || ''}

TITULARES: ${txt(adv.titulares)}

SUMARIO: ${txt(adv.bajada)}

FICHA EXPERTO: ${txt(adv.fichaExperto)}

APERTURA: ${txt(adv.apertura)}

HISTORIA PACIENTE: ${txt(adv.historiaPaciente)}

CITA EXPERTO: ${txt(adv.citaExperto)}

DESARROLLO EDUCATIVO: ${txt(adv.desarrolloEducativo)}

COMPARATIVA: ${txt(adv.comparativaEstados)}

POR QUÉ OTROS FALLAN: ${txt(adv.porQueOtrosFallan)}

MECANISMO ÚNICO: ${txt(adv.transicionMecanismo)}
NOMBRES MECANISMO: ${txt(adv.nombresMecanismo)}

PRODUCTO: ${txt(adv.producto)}

PROMOCIONES: ${txt(adv.promociones)}

GARANTÍA: ${txt(adv.garantia)}

TESTIMONIOS: ${txt(adv.testimonios)}

FAQ: ${txt(adv.faq)}

CIERRE CTA: ${txt(adv.cierreCTA)}
`.trim()

    try {
      const d = await api([{role:'user', content: adFuente}], 'mapear_advertorial')
      const text = d.content?.[0]?.text || ''
      let cleanJson = text.replace(/```json|```/g, '').trim()
      const jsonStart = cleanJson.indexOf('{')
      const jsonEnd = cleanJson.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) cleanJson = cleanJson.slice(jsonStart, jsonEnd+1)
      cleanJson = cleanJson.replace(/\\"/g, "'").replace(/[\u0000-\u001f]/g, ' ')
      const parsed = JSON.parse(cleanJson)
      const sorted = {...parsed, tipos: [...parsed.tipos].sort((a,b) => b.score - a.score)}
      setAnalisis(sorted)
      setNivelSel(parsed.nivel_recomendado)
      setTipo(parsed.tipo_recomendado)
      setAvatarSel(parsed.avatar_recomendado || 0)
    } catch(e) {
      setErrorMapeo('Error mapeando: ' + e.message)
    }
    setMapeando(false)
  }

  function tiposAjustados(nivel) {
    if (!analisis) return []
    const aj = {1:{Educativo:+15,Emocional:+10,Racional:-10,Directo:-20},2:{Emocional:+15,Funcional:+10,Educativo:+5,Directo:-15},3:{Funcional:+15,Educativo:+10,Racional:+5,Directo:-5},4:{Directo:+20,Funcional:+10,Racional:+5,Emocional:-10},5:{Directo:+25,Funcional:+5,Emocional:-10,Educativo:-15}}
    const adj = nivel === analisis.nivel_recomendado ? {} : (aj[nivel] || {})
    return [...analisis.tipos].map(t => ({...t, score: Math.min(99, Math.max(10, t.score + (adj[t.tipo] || 0)))})).sort((a,b) => b.score - a.score)
  }

  function buildCtx() {
    const nv = nivelSel || analisis.nivel_recomendado
    const ni = analisis.niveles.find(n => n.numero === nv)
    const durStr = formato === 'video' ? `\nDURACIÓN: ${duracion} segundos` : ''
    const fmtImgStr = formato === 'imagen' ? `\nFORMATO_IMG: ${formatoImagen}` : ''
    const avatarStr = avatarManual.trim() ? avatarManual.trim() : (avatarSel !== null && analisis?.avatares?.[avatarSel] ? analisis.avatares[avatarSel].nombre + ' — ' + analisis.avatares[avatarSel].dolor_principal : '')
    const avatarLine = avatarStr ? `\nAVATAR: ${avatarStr}` : ''
    const anguloLine = anguloSel ? `\nANGULO_VENTA: ${anguloSel}` : ''

    // Bloque del advertorial: contexto narrativo del funnel
    const adv = advData?.advertorial || {}
    const txt = (v) => typeof v === 'string' ? v : (v ? JSON.stringify(v) : '')
    const advLine = adv ? `

CONTEXTO_ADVERTORIAL_FUENTE (el ad debe alinear con este funnel):
- Mecanismo: ${(adv.nombresMecanismo || [])[0] || ''}
- Promesa: ${txt(adv.bajada).slice(0,300)}
- Dolor del avatar: ${txt(adv.apertura).slice(0,400)}
- Historia clave: ${txt(adv.historiaPaciente).slice(0,400)}
- Producto/ingredientes: ${txt(adv.producto).slice(0,400)}
- Testimonios disponibles: ${txt(adv.testimonios).slice(0,400)}
INSTRUCCIÓN: el ad debe llevar al usuario al advertorial; usa mismo lenguaje y mismo dolor.` : ''

    return `TIPO: ${tipo}\nMERCADO: ${pais}\nPLATAFORMA: ${plat}\nFORMATO: ${formato}${durStr}${fmtImgStr}\nNIVEL: ${nv} - ${ni.nombre}\nÁNGULO: ${ni.angulo}${avatarLine}${anguloLine}\nPRODUCTO: ${advData?.nombre || ''}${advLine}`
  }

  function parseVersiones(rawText, fmt) {
    const text = rawText.trim()
    const cleanStr = t => t.replace(/\*\*/g, '').replace(/^\s*\*+|\*+\s*$/gm, '').trim()
    let vers = []

    if (fmt === 'imagen') {
      const parseBloque = (bloque, idx) => {
        const hookMatch = bloque.match(/Hook:\s*([^\n]+)/i)
        const hookTituloMatch = bloque.match(/IDEA DE IMAGEN\s*\d+[^\n]*?(?:Hook:|—\s*)([^\n]+)/i)
        let hookRaw = hookMatch ? cleanStr(hookMatch[1]) : hookTituloMatch ? cleanStr(hookTituloMatch[1]) : `Idea ${idx+1}`
        const hookPalabras = hookRaw.split(/\s+/).filter(w => w.length > 0)
        const hook = hookPalabras.length > 7 ? hookPalabras.slice(0,7).join(' ') : hookRaw
        const descMatch = bloque.match(/Descripci[oó]n de la imagen:\s*([\s\S]*?)(?=Texto en imagen:|$)/i)
        const descripcion = descMatch ? cleanStr(descMatch[1]) : ''
        const textoMatch = bloque.match(/Texto en imagen:\s*([\s\S]*?)(?=---|$)/i)
        const bullets = (textoMatch ? textoMatch[1] : '').split('\n').map(l => cleanStr(l.replace(/^[•\-\*\d\.]+\s*/, ''))).filter(l => l.length > 3)
        return {hook, descripcion, bullets, guionCompleto: bloque, guionVisual: bloque, guionNeto: ''}
      }
      const matches = [...text.matchAll(/IDEA DE IMAGEN\s*\d+[^\n]*/gi)]
      if (matches.length >= 1) {
        for (let i = 0; i < Math.min(matches.length, 3); i++) {
          const start = matches[i].index
          const end = i+1 < matches.length ? matches[i+1].index : text.length
          const bloque = text.substring(start, end).trim()
          if (bloque.length > 20) vers.push(parseBloque(bloque, i))
        }
      }
      if (vers.length === 0) {
        const bloques = text.split(/\n---+\n/).map(b => b.trim()).filter(b => b.length > 20)
        for (let i = 0; i < Math.min(bloques.length, 3); i++) vers.push(parseBloque(bloques[i], i))
      }
      if (vers.length === 0) vers = [{hook:'Idea generada', descripcion: text, bullets: [], guionCompleto: text, guionVisual: text, guionNeto: ''}]
    } else {
      const hookMatches = [...text.matchAll(/VERSI[OÓ]N\s*\d+\s*[—\-–]\s*Hook:\s*([^\n]+)/gi)]
      const hooks = hookMatches.map(m => m[1].trim())
      const bloques = text.split(/═{3,}[^\n]*\n/g).map(p => p.trim()).filter(p => p.length > 20 && !p.match(/^VERSI[OÓ]N\s*\d+\s*[—\-–]/i))
      for (let i = 0; i < Math.min(bloques.length, 3); i++) {
        const neto = bloques[i].replace(/^---\s*|\s*---$/g, '').trim()
        vers.push({hook: hooks[i] || `Versión ${i+1}`, guionCompleto: neto, guionVisual: neto, guionNeto: neto, descripcion: '', bullets: []})
      }
    }
    if (vers.length === 0) vers = [{hook:'Generado', guionCompleto: text, guionVisual: text, guionNeto: '', descripcion: '', bullets: []}]
    setVersiones(vers)
    setVersionActiva(0)
    return vers
  }

  async function generar(esCorr) {
    if (!tipo) return alert('Selecciona un motivo (tipo)')
    const corr = correccion.trim()
    if (esCorr && !corr) return alert('Escribe qué corregir')
    setGenerando(true)
    let newMsgs
    if (!esCorr) {
      newMsgs = [{role:'user', content: buildCtx()}]
      setHistorial([]); setMsgs(newMsgs); setVersionActiva(0)
    } else {
      const textoActual = versiones.map((v,i) => `VERSIÓN ${i+1} — Hook: ${v.hook}\n${v.guionCompleto}`).join('\n\n---\n\n')
      newMsgs = [...msgs,
        {role:'assistant', content: textoActual},
        {role:'user', content: `Aplica esta corrección a las 3 versiones manteniendo estructura, producto, tono y mercado. Solo cambia lo indicado:\n"${corr}"\nDevuelve las 3 versiones completas con el mismo formato exacto, empezando directo con VERSIÓN 1 sin texto introductorio.`}
      ]
      setHistorial(h => [...h, corr]); setCorreccion(''); setMsgs(newMsgs)
    }
    try {
      const d = await api(newMsgs, esCorr ? 'correccion' : 'generar')
      const text = d.content?.[0]?.text || ''
      parseVersiones(text, formato)
    } catch(e) { alert('Error: ' + e.message) }
    setGenerando(false)
  }

  // ───────── UI ─────────
  const inp = {width:'100%', padding:'9px 11px', background:D.input, border:`1px solid ${D.inputBorder}`, color:D.text, borderRadius:5, fontSize:12, fontFamily:'inherit', outline:'none'}
  const sel = {...inp, cursor:'pointer'}
  const chipBtn = (active) => ({fontSize:12, padding:'6px 14px', borderRadius:20, border:`1px solid ${active?D.blue:D.cardBorder}`, background:active?D.blueDark:'transparent', color:active?D.blueLight:D.textDim, cursor:'pointer', fontFamily:'inherit', fontWeight:active?500:400, transition:'all .15s'})

  if (mapeando) {
    return (
      <div style={{minHeight:'100vh', background:D.bg, color:D.text, fontFamily:'system-ui, -apple-system, sans-serif', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:14, color:D.blueLight, marginBottom:12}}>Cargando advertorial y mapeando ángulos…</div>
          <div style={{fontSize:11, color:D.textDim}}>(usa el modelo seleccionado · ~5 segundos)</div>
        </div>
      </div>
    )
  }

  if (errorMapeo) {
    return (
      <div style={{minHeight:'100vh', background:D.bg, color:D.text, fontFamily:'system-ui', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{maxWidth:500, textAlign:'center', padding:20}}>
          <div style={{fontSize:14, color:'#ff6b6b', marginBottom:12}}>{errorMapeo}</div>
          <button onClick={() => window.location.href='/advertorial'} style={{padding:'10px 20px', background:D.blue, color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:600}}>
            ← Volver al advertorial
          </button>
        </div>
      </div>
    )
  }

  if (!analisis) return null

  const nv = nivelSel || analisis.nivel_recomendado
  const tiposVis = tiposAjustados(nv)

  return (
    <div style={{minHeight:'100vh', background:D.bg, color:D.text, fontFamily:'system-ui, -apple-system, sans-serif'}}>
      <Head><title>Ads desde Advertorial</title></Head>

      {/* Header */}
      <div style={{background:D.card, borderBottom:`1px solid ${D.cardBorder}`, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize:11, color:D.textDim, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:2}}>Pasarela</div>
          <div style={{fontSize:15, color:D.blueLight, fontWeight:600}}>📄 → 🎬  {advData?.nombre || 'Producto'}</div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:4, background:D.input, border:`1px solid ${D.cardBorder}`, borderRadius:20, padding:'3px 4px'}}>
            {[
              {id:'gpt-4.1-mini', label:'GPT 4.1 Mini'},
              {id:'gpt-4o-mini', label:'4o Mini'},
              {id:'gpt-4o', label:'GPT-4o'},
              {id:'claude-sonnet-4-20250514', label:'Sonnet'},
              {id:'claude-haiku-4-5-20251001', label:'Haiku'},
            ].map(m => (
              <button key={m.id} onClick={()=>setModeloSel(m.id)}
                style={{fontSize:10, fontWeight:600, padding:'4px 9px', borderRadius:16, border:'none', cursor:'pointer', fontFamily:'inherit',
                  background:modeloSel===m.id?D.blue:'transparent', color:modeloSel===m.id?'#fff':D.textDim}}>
                {m.label}
              </button>
            ))}
          </div>
          <button onClick={()=>window.location.href='/advertorial'} style={{fontSize:11, color:D.textMid, background:'transparent', border:`1px solid ${D.cardBorder}`, borderRadius:5, padding:'6px 12px', cursor:'pointer'}}>
            ← Advertorial
          </button>
        </div>
      </div>

      <div style={{maxWidth:900, margin:'0 auto', padding:'20px'}}>

        {/* Banner contexto cargado */}
        <div style={{background:D.greenBg, border:`1px solid ${D.greenBorder}`, borderRadius:8, padding:'12px 14px', marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: mostrarContexto?10:0}}>
            <div style={{fontSize:12, color:D.text}}>
              ✓ <b>Contexto cargado:</b> {advData?.nombre} · {pais} · Mecanismo: <b style={{color:D.blueLight}}>{(advData?.advertorial?.nombresMecanismo||[])[0]||'—'}</b>
            </div>
            <button onClick={()=>setMostrarContexto(v=>!v)} style={{fontSize:10, color:D.blueLight, background:'transparent', border:'none', cursor:'pointer'}}>
              {mostrarContexto?'▲ Ocultar':'▼ Ver detalle'}
            </button>
          </div>
          {mostrarContexto && (
            <div style={{fontSize:11, color:D.textMid, lineHeight:1.5, paddingTop:8, borderTop:`1px solid ${D.greenBorder}`}}>
              <div style={{marginBottom:6}}><b style={{color:D.textDim}}>Avatar principal:</b> {analisis.avatares?.[0]?.nombre} — {analisis.avatares?.[0]?.dolor_principal}</div>
              <div style={{marginBottom:6}}><b style={{color:D.textDim}}>Promesa:</b> {(advData?.advertorial?.bajada||'').slice(0,200)}</div>
              <div style={{marginBottom:6}}><b style={{color:D.textDim}}>Tipo dominante (heredado):</b> {analisis.tipo_recomendado}</div>
              <div><b style={{color:D.textDim}}>Razón:</b> {analisis.razon_recomendacion}</div>
            </div>
          )}
        </div>

        {/* Decisiones del usuario */}
        <div style={{background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:18, marginBottom:16}}>
          <div style={{fontSize:12, color:D.blueLight, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:14, fontWeight:600}}>
            Decisiones del Ad
          </div>

          {/* Mercado y Plataforma */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14}}>
            <div>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase'}}>Mercado</label>
              <select value={pais} onChange={e=>setPais(e.target.value)} style={{...sel, marginTop:4}}>
                <option>Colombia</option><option>Guatemala</option><option>México</option><option>Perú</option><option>Chile</option><option>Argentina</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase'}}>Plataforma</label>
              <select value={plat} onChange={e=>setPlat(e.target.value)} style={{...sel, marginTop:4}}>
                <option>Meta Ads</option><option>TikTok Ads</option><option>YouTube Ads</option>
              </select>
            </div>
          </div>

          {/* Formato */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Formato</label>
            <div style={{display:'flex', gap:6}}>
              {[['video','Video'],['imagen','Imagen']].map(([v,l])=>(
                <button key={v} onClick={()=>setFormato(v)} style={chipBtn(formato===v)}>{l}</button>
              ))}
            </div>
          </div>

          {formato==='video' && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Duración</label>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {['10','15','20','30','40','50','60'].map(s=>(
                  <button key={s} onClick={()=>setDuracion(s)} style={{...chipBtn(duracion===s), minWidth:50, textAlign:'center'}}>{s}s</button>
                ))}
              </div>
            </div>
          )}

          {formato==='imagen' && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Estilo de imagen</label>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {['Funcional','Emocional','Educativa','Comparativa'].map(f=>(
                  <button key={f} onClick={()=>setFormatoImagen(f)} style={{...chipBtn(formatoImagen===f), fontSize:11, padding:'5px 12px'}}>{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* Avatar */}
          {analisis.avatares?.length > 0 && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Avatar — A quién hablarle</label>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {analisis.avatares.map((av, i) => (
                  <button key={i} onClick={()=>{setAvatarSel(i); setAvatarManual('')}}
                    style={{...chipBtn(avatarSel===i && !avatarManual.trim()), padding:'8px 12px', textAlign:'left', flexDirection:'column', display:'flex', alignItems:'flex-start', maxWidth:220}}>
                    <div style={{fontSize:11, fontWeight:600, marginBottom:2}}>{av.nombre} {i===analisis.avatar_recomendado && <span style={{fontSize:9, color:D.blue}}>· Recom.</span>}</div>
                    <div style={{fontSize:10, color:D.textDim, lineHeight:1.3}}>{av.dolor_principal?.slice(0,60)}</div>
                  </button>
                ))}
              </div>
              <input type="text" value={avatarManual} onChange={e=>{setAvatarManual(e.target.value); if(e.target.value.trim()) setAvatarSel(null)}} placeholder="O escribe un avatar manual..." style={{...inp, marginTop:8, fontSize:11}}/>
            </div>
          )}

          {/* Niveles de consciencia */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Nivel de consciencia</label>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:6}}>
              {analisis.niveles.map(n=>{
                const isRec = n.numero === analisis.nivel_recomendado
                const isSel = n.numero === nv
                return (
                  <div key={n.numero} onClick={()=>setNivelSel(n.numero)}
                    style={{padding:'9px 11px', border:`1px solid ${isSel?D.blue:D.cardBorder}`, background:isSel?D.blueDark:D.input, borderRadius:6, cursor:'pointer', transition:'all .15s'}}>
                    <div style={{fontSize:10, color:D.textDim, marginBottom:2}}>NIVEL {n.numero} {isRec && <span style={{color:D.blue}}>★</span>}</div>
                    <div style={{fontSize:11, color:isSel?D.blueLight:D.text, fontWeight:500}}>{n.nombre}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tipos */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Tipo de creativo (motivo)</label>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:6}}>
              {tiposVis.map(t=>(
                <div key={t.tipo} onClick={()=>setTipo(t.tipo)}
                  style={{padding:'9px 11px', border:`1px solid ${tipo===t.tipo?D.blue:D.cardBorder}`, background:tipo===t.tipo?D.blueDark:D.input, borderRadius:6, cursor:'pointer', textAlign:'center'}}>
                  <div style={{fontSize:11, color:tipo===t.tipo?D.blueLight:D.text, fontWeight:500, marginBottom:2}}>{t.tipo}</div>
                  <div style={{fontSize:10, color:D.textDim}}>{t.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ángulo de venta */}
          {analisis.angulos_recomendados?.length > 0 && (
            <div style={{marginBottom:14}}>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Ángulo de venta</label>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                <button onClick={()=>setAnguloSel(null)} style={chipBtn(!anguloSel)}>Auto</button>
                {analisis.angulos_recomendados.slice(0,5).map((a,i)=>(
                  <button key={i} onClick={()=>setAnguloSel(a.angulo)} style={{...chipBtn(anguloSel===a.angulo), fontSize:11}}>
                    {a.angulo} · {a.score}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón generar */}
          <button onClick={()=>generar(false)} disabled={generando || !tipo}
            style={{width:'100%', padding:'12px', background:tipo?D.blue:D.cardBorder, color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:700, cursor:tipo?'pointer':'not-allowed', marginTop:6}}>
            {generando ? 'Generando 3 versiones…' : '🎬 Generar 3 versiones'}
          </button>
        </div>

        {/* Resultados */}
        {versiones.length > 0 && (
          <div style={{background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:18}}>
            <div style={{display:'flex', gap:6, marginBottom:14, borderBottom:`1px solid ${D.cardBorder}`, paddingBottom:10}}>
              {versiones.map((v,i)=>(
                <button key={i} onClick={()=>setVersionActiva(i)}
                  style={{padding:'7px 14px', background:versionActiva===i?D.blueDark:'transparent', border:`1px solid ${versionActiva===i?D.blue:D.cardBorder}`, color:versionActiva===i?D.blueLight:D.textDim, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer'}}>
                  V{i+1} · {v.hook?.slice(0,30)}
                </button>
              ))}
            </div>

            <pre style={{whiteSpace:'pre-wrap', fontSize:12, color:D.text, lineHeight:1.6, fontFamily:'system-ui', margin:0}}>
              {versiones[versionActiva]?.guionCompleto}
            </pre>

            <div style={{marginTop:14, display:'flex', gap:8}}>
              <button onClick={()=>navigator.clipboard.writeText(versiones[versionActiva]?.guionCompleto||'')}
                style={{padding:'8px 14px', background:D.blueDark, border:`1px solid ${D.blueDim}`, color:D.blueLight, borderRadius:5, fontSize:11, cursor:'pointer'}}>
                📋 Copiar
              </button>
            </div>

            {/* Corrección */}
            <div style={{marginTop:18, paddingTop:14, borderTop:`1px solid ${D.cardBorder}`}}>
              <label style={{fontSize:10, color:D.textDim, letterSpacing:'.05em', textTransform:'uppercase', display:'block', marginBottom:6}}>Corregir / Iterar</label>
              <textarea value={correccion} onChange={e=>setCorreccion(e.target.value)} rows={2} placeholder="Ej: hazlas más cortas, agrega urgencia, cambia el hook..." style={{...inp, marginBottom:8}}/>
              <button onClick={()=>generar(true)} disabled={generando || !correccion.trim()}
                style={{padding:'8px 14px', background:correccion.trim()?D.green:D.cardBorder, color:'#fff', border:'none', borderRadius:5, fontSize:11, cursor:correccion.trim()?'pointer':'not-allowed', fontWeight:600}}>
                {generando?'Aplicando…':'Aplicar corrección'}
              </button>
              {historial.length>0 && (
                <div style={{marginTop:10, fontSize:10, color:D.textDim}}>
                  Correcciones aplicadas: {historial.length}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
