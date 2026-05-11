import { useState, useEffect } from 'react'
import Head from 'next/head'
import { DOCTRINA_TIPOS_IMAGEN } from '../data/doctrina-tipos-imagen'

const D = {
  bg:'#fafafa',card:'#ffffff',cardBorder:'#e5e7eb',
  input:'#ffffff',inputBorder:'#d1d5db',
  blue:'#1a8cc4',blueLight:'#0e6a98',blueDark:'#eff6fb',blueDim:'#bfdde9',
  text:'#111827',textMid:'#374151',textDim:'#6b7280',textFaint:'#9ca3af',
  accent:'#f9fafb',green:'#059669',greenBg:'#ecfdf5',greenBorder:'#a7f3d0'
}

const DOCTRINA_NIVELES = {
  1: { titulo: 'Inconsciente', color: '#9ca3af', regla: 'NO menciona producto, marca, mecanismo ni ingredientes.', enfoque: 'Activar curiosidad sobre un problema que el avatar aún no identifica.', cta: '"Mira en el enlace por qué te pasa esto" / "Aprende qué hay detrás" / "Descubre lo que pocos saben"' },
  2: { titulo: 'Consciente del problema', color: '#f59e0b', regla: 'NO menciona producto ni marca.', enfoque: 'Validar el dolor y prometer que hay respuesta sin decir cuál.', cta: '"Entra al enlace y entiende cómo otros lo resolvieron" / "Mira lo que muchos ya están haciendo"' },
  3: { titulo: 'Consciente de la solución', color: '#1a8cc4', regla: 'Producto como hallazgo natural, no anuncio. NUNCA verbos imperativos de compra.', enfoque: 'Presentar el producto como descubrimiento personal.', cta: '"Descubrí algo que cambió todo" / "Mira esto que encontré"' },
  4: { titulo: 'Consciente del producto', color: '#059669', regla: 'Producto con beneficios concretos y prueba social.', enfoque: 'Convencer al avatar que ya conoce el producto pero duda.', cta: 'Urgencia suave: "Pruébalo tú mismo" / "Es momento de intentarlo"' },
  5: { titulo: 'Totalmente consciente', color: '#dc2626', regla: 'Venta directa, escasez, urgencia real.', enfoque: 'Cerrar la venta con quien ya está listo.', cta: '"Pídelo ahora" / "No lo dejes pasar"' }
}

const DOCTRINA_MOTIVOS = {
  Emocional: { color: '#ec4899', emocion: 'Frustración → Orgullo / Vergüenza → Validación', enfoque: 'Alivio y validación', estructura: 'Frustración personal → Identificación → Alivio → Orgullo', pieza: 'Storytelling, testimonio en primera persona', palabras: '"yo sentía", "no era la única", "por fin", "alivio", "me entiende"' },
  Funcional: { color: '#1a8cc4', emocion: 'Confianza / Control', enfoque: 'Resultado visible y demostrable', estructura: 'Problema concreto → Demostración del resultado → Evidencia visual', pieza: 'Before & After, UGC directo, demo en uso', palabras: '"mira cómo", "el resultado es", "en X días", "la diferencia se nota"' },
  Educativo: { color: '#8b5cf6', emocion: 'Curiosidad / Claridad', enfoque: 'Descubrimiento, explicación de un porqué', estructura: 'Pregunta o dato curioso → Explicación clara → Aplicación práctica', pieza: 'Tutoriales, tips, comparativas', palabras: '"¿sabías que?", "la razón es", "esto pasa porque", "lo que muchos no saben"' },
  Aspiracional: { color: '#f59e0b', emocion: 'Deseo / Admiración', enfoque: 'Imagen, identidad y transformación de vida', estructura: 'Vida actual del avatar → Vida deseada → Producto como puente → Invitación a convertirse', pieza: 'Lifestyle, video aspiracional, transformación', palabras: '"vive como", "sé esa persona", "tu mejor versión", "por fin tener", "convertirte en"' },
  Racional: { color: '#059669', emocion: 'Orden / Tranquilidad', enfoque: 'Simplificación, método, sistema claro', estructura: 'Confusión común → Método organizado → Tranquilidad mental', pieza: 'Explicativos, guías cortas, paso a paso', palabras: '"el método", "los pasos son", "sin complicaciones", "claro y simple"' }
}

const DOCTRINA_ANGULOS = {
  'Problema/Dolor': { que: 'Activa el problema concreto del avatar antes de cualquier solución.', estructura: '1) Nombrar el dolor 2) Mostrar consecuencia 3) Insinuar salida 4) CTA acorde al nivel', tono: 'Empático, directo, validador', ejemplo: 'Si llegas a la noche con la espalda destrozada, no eres tú: es tu silla.' },
  'Beneficio/Resultado': { que: 'Empieza mostrando el resultado final ya logrado.', estructura: '1) Resultado visible 2) Cómo se siente 3) Mecanismo breve 4) CTA', tono: 'Optimista, concreto, demostrativo', ejemplo: 'Dormí 8 horas seguidas por primera vez en años.' },
  'Curiosidad': { que: 'Genera intriga con un dato, pregunta o secreto.', estructura: '1) Gancho intrigante 2) Tensión 3) Revelación parcial 4) CTA hacia el enlace', tono: 'Conversacional, casi cómplice', ejemplo: 'El error que el 90% comete y no sabe que comete...' },
  'Urgencia/Escasez': { que: 'El motor es el tiempo o la disponibilidad limitada.', estructura: '1) Oferta o ventana 2) Por qué se cierra 3) Qué pierde si no actúa 4) CTA con tiempo', tono: 'Firme, no agresivo', ejemplo: 'Solo quedan 12 unidades antes del próximo lote.' },
  'Autoridad/Prueba Social': { que: 'Apoya en evidencia externa, números, testimonios o expertos.', estructura: '1) Cifra/prueba 2) Quién lo respalda 3) Qué significa para el avatar 4) CTA', tono: 'Sereno, fáctico', ejemplo: 'Más de 12.000 madres en Colombia ya lo usan a diario.' },
  'Novedad': { que: 'Posiciona como recién llegado, descubrimiento, primero en categoría.', estructura: '1) Anuncio del descubrimiento 2) Por qué es nuevo 3) Qué cambia 4) CTA', tono: 'Fresco, revelador', ejemplo: 'La primera crema con [mecanismo] que llega al país.' },
  'Comparación/Contraste': { que: 'Confronta con la alternativa tradicional.', estructura: '1) Lo viejo y sus defectos 2) Lo nuevo 3) Diferencia clara 4) CTA', tono: 'Claro, no peleón', ejemplo: 'Las dietas restrictivas vs. comer lo que quieras con método.' },
  'Enemigo en Común': { que: 'Identifica un villano externo que el avatar también odia.', estructura: '1) Nombrar al enemigo 2) Cómo te afecta 3) Cómo el producto te libera 4) CTA', tono: 'Empático con un toque de rebeldía', ejemplo: 'La industria del azúcar te hizo creer que la grasa era el problema.' },
  'Historia': { que: 'Cuenta una historia real que lleva al producto.', estructura: '1) Personaje 2) Problema 3) Hallazgo 4) Transformación + CTA', tono: 'Narrativo, humano', ejemplo: 'Hace 8 meses no podía subir las escaleras sin pausa...' },
  'Transformación': { que: 'Antes y después claros y contrastados.', estructura: '1) Antes 2) Punto de quiebre 3) Después 4) CTA', tono: 'Esperanzador, evidencial', ejemplo: 'De 92kg a 74kg sin pasar hambre. Esto fue lo que cambié.' },
  'FOMO': { que: 'Otros ya están avanzando sin él.', estructura: '1) Lo que otros ya logran 2) Implicancia para él 3) Camino simple 4) CTA', tono: 'Movilizador, no juzgador', ejemplo: 'Mientras tú dudas, ellas ya recuperaron su energía.' },
  'Simplicidad': { que: 'Lo que parecía difícil con este producto es fácil.', estructura: '1) Lo complicado del enfoque viejo 2) Lo simple del nuevo 3) Demostración 4) CTA', tono: 'Tranquilo, didáctico', ejemplo: 'Sin contar calorías. Sin pesar comida. Solo seguir el método.' },
  'Ironía/Provocación': { que: 'Va contra la creencia común.', estructura: '1) Mito popular 2) Por qué es mentira 3) Verdad incómoda 4) CTA', tono: 'Irónico, retador, nunca grosero', ejemplo: 'Hacer más cardio te está engordando.' },
  'Precio/Valor': { que: 'Justifica el precio como inversión.', estructura: '1) Precio aparente 2) Costo real de no actuar 3) Valor entregado 4) CTA', tono: 'Racional, tranquilo', ejemplo: 'Cuesta lo mismo que dos almuerzos por mes y te quita el dolor de espalda.' },
  'Exclusividad': { que: 'No es para todos, es para él específicamente.', estructura: '1) A quién SÍ va dirigido 2) A quién NO 3) Por qué es para él 4) CTA', tono: 'Selectivo, sin elitismo barato', ejemplo: 'Esto no es para quien busca atajos. Es para quien quiere método.' },
  'Aspiracional': { que: 'Conecta el producto con la imagen/vida que el avatar quiere.', estructura: '1) Imagen deseada 2) Identidad 3) Producto como puente 4) CTA', tono: 'Inspirador, concreto', ejemplo: 'Conviértete en la versión de ti que siempre supiste que podías ser.' }
}

function PanelDoctrina({ open, setOpen, titulo, color, children }) {
  return (
    <div style={{ marginTop: 12, borderLeft: `4px solid ${color}`, background: D.accent, borderRadius: 8, overflow: 'hidden', border: `1px solid ${D.cardBorder}` }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: D.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>{titulo}</span>
        <span style={{ color: D.textDim, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '0 16px 16px 16px', fontSize: 14, color: D.textMid, lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function DLine({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: D.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: D.textMid, lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}

export default function Home() {
  const [pais,setPais]=useState('Colombia')
  const [plat,setPlat]=useState('Meta Ads')
  const [nombre,setNombre]=useState('')
  const [prod,setProd]=useState('')
  const [url,setUrl]=useState('')
  const [archivos,setArchivos]=useState([]) // [{nombre,kind,text,chars}]
  const [subiendoArchivo,setSubiendoArchivo]=useState(false)
  const [analizando,setAnalizando]=useState(false)
  const [analisis,setAnalisis]=useState(null)
  const [promptAnalisis,setPromptAnalisis]=useState('')
  const [nivelSel,setNivelSel]=useState(null)
  const [tipo,setTipo]=useState(null)
  const [formato,setFormato]=useState('video')
  const [duracion,setDuracion]=useState('30')
  const [generando,setGenerando]=useState(false)
  const [versiones,setVersiones]=useState([])
  const [promptGen,setPromptGen]=useState('')
  const [versionActiva,setVersionActiva]=useState(0)
  const [correccion,setCorreccion]=useState('')
  const [historial,setHistorial]=useState([])
  const [msgs,setMsgs]=useState([])
  const [modalPrompt,setModalPrompt]=useState(null)
  const [sesionHistorial,setSesionHistorial]=useState([])
  const [mostrarSesion,setMostrarSesion]=useState(false)
  const [sesionActiva,setSesionActiva]=useState(null)
  const [generandoVariaciones,setGenerandoVariaciones]=useState(false)
  const [avatarSel,setAvatarSel]=useState(null)   // índice del avatar o null
  const [avatarManual,setAvatarManual]=useState('')
  const [anguloSel,setAnguloSel]=useState(null)   // string del ángulo
  const [openPanelNivel,setOpenPanelNivel]=useState(false)
  const [openPanelMotivo,setOpenPanelMotivo]=useState(false)
  const [openPanelAngulo,setOpenPanelAngulo]=useState(false)
  const [openPanelTipoImagen,setOpenPanelTipoImagen]=useState(false)
  const [copiadoKey,setCopiadoKey]=useState(null)
  const [hooksUsadosImg,setHooksUsadosImg]=useState([])
  const [ultimoCosto,setUltimoCosto]=useState(null)
  const [costoSesion,setCostoSesion]=useState({usd:0,cop:0,operaciones:0})
  const [variaciones,setVariaciones]=useState([])
  const [variacionActiva,setVariacionActiva]=useState(0)
  // ── NUEVO: selector de API ──────────────────────────────────────
  const [modeloSel,setModeloSel]=useState('claude-sonnet-4-6')
  const [formatoImagen,setFormatoImagen]=useState('Funcional')
  const [ctxFromAdvertorial,setCtxFromAdvertorial]=useState(null)
  const [verCtxAdv,setVerCtxAdv]=useState(false)
  const [auditorias,setAuditorias]=useState({}) // {0: textoAuditoria, 1: ..., 2: ...} (video) o {imagen_0: ..., imagen_1: ...}
  const [auditando,setAuditando]=useState(null) // índice que se está auditando

  // Limpia outputs al cambiar formato (video↔imagen) — preserva análisis y decisiones del Paso 02/03
  useEffect(()=>{
    setVersiones([])
    setVariaciones([])
    setVersionActiva(0)
    setVariacionActiva(0)
    setAuditorias({})
    setAuditando(null)
    setHistorial([])
    setMsgs([])
    setCorreccion('')
    setPromptGen('')
    setSesionActiva(null)
    setCopiadoKey(null)
    setHooksUsadosImg([])
  },[formato])

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    if(params.get('ctx')!=='advertorial') return
    const raw=localStorage.getItem('advertorial_ctx')
    if(!raw) return
    try{
      const data=JSON.parse(raw)
      const dec=data.decisiones||{}
      const adv=data.advertorial||{}
      const txt=(v)=>typeof v==='string'?v:(v?JSON.stringify(v):'')

      // Pre-llena Paso 1 — descripción VISIBLE corta y limpia
      const ingredientes = (() => {
        const p = txt(adv.producto)
        const matches = [...p.matchAll(/[🌿🌱🍃🌸🌼🌺🌻🌷]\s*([^·\n]+)·([^"\n]+)/g)]
        if (matches.length === 0) return ''
        return matches.slice(0,5).map(m => m[1].trim()).join(', ')
      })()
      const promesaCorta = txt(adv.bajada).split('.')[0].slice(0,150)
      const descCorta = [
        (adv.nombresMecanismo||[])[0] ? `Mecanismo: ${(adv.nombresMecanismo||[])[0]}` : '',
        ingredientes ? `Ingredientes: ${ingredientes}` : '',
        promesaCorta ? `Promesa: ${promesaCorta}.` : '',
        dec.avatar ? `Avatar: ${dec.avatar}` : '',
      ].filter(Boolean).join('\n')
      if(data.nombre) setNombre(data.nombre)
      setProd(descCorta)
      if(data.mercado) setPais(data.mercado)

      // Construye análisis sintético (sin IA) — usa decisiones del modal
      const niveles=[
        {numero:1, nombre:'Inconsciente',                 angulo:'Despertar el problema',   porque_si:'Audiencia que no sabe que tiene el problema', porque_no:'Si tu mercado ya conoce el dolor',  ejemplo_hook:''},
        {numero:2, nombre:'Consciente del problema',      angulo:'Validar y profundizar dolor', porque_si:'Saben que les pasa pero no saben por qué', porque_no:'Si ya conocen la solución',         ejemplo_hook:''},
        {numero:3, nombre:'Consciente de la solución',    angulo:'Mostrar tu mecanismo',    porque_si:'Buscan opciones de solución',                porque_no:'Si ya conocen tu producto',         ejemplo_hook:''},
        {numero:4, nombre:'Consciente del producto',      angulo:'Diferenciación vs alternativas', porque_si:'Comparan productos',                  porque_no:'Si nunca oyeron del producto',      ejemplo_hook:''},
        {numero:5, nombre:'Totalmente consciente',        angulo:'Oferta directa, urgencia', porque_si:'Listos para comprar, falta empujón',         porque_no:'Si están explorando todavía',       ejemplo_hook:''},
      ]
      const tipos=[
        {tipo:'Emocional', score:80, porque_convierte:'Conecta con emociones del avatar', porque_no:'Puede sentirse manipulador', mejor_nivel:2},
        {tipo:'Funcional', score:75, porque_convierte:'Comunica beneficios concretos',   porque_no:'Frío sin contexto emocional',mejor_nivel:3},
        {tipo:'Educativo', score:78, porque_convierte:'Construye autoridad y confianza', porque_no:'Puede ser largo o pasivo',  mejor_nivel:2},
        {tipo:'Racional',     score:70, porque_convierte:'Datos, garantías, comparativas',          porque_no:'No genera deseo emocional',           mejor_nivel:4},
        {tipo:'Aspiracional', score:72, porque_convierte:'Conecta con la identidad y aspiración del avatar', porque_no:'Requiere claridad sobre la identidad deseada', mejor_nivel:4},
      ].map(t=>t.tipo===dec.tipo?{...t,score:90}:t).sort((a,b)=>b.score-a.score)

      const analisisSint={
        niveles, tipos,
        nivel_recomendado:dec.nivel||2,
        tipo_recomendado:dec.tipo||'Educativo',
        razon_recomendacion:`Heredado del advertorial "${data.nombre}".`,
        avatares:[{
          nombre:'Avatar del advertorial',
          descripcion:dec.avatar||data.avatar||'',
          dolor_principal:txt(adv.apertura).slice(0,200),
          tamano_publico:'Definido por el advertorial',
          relevancia:95
        }],
        avatar_recomendado:0,
        angulos_recomendados:[
          {angulo:dec.angulo||'Problema/Dolor', score:90, porque:'Elegido en el modal de configuración'}
        ]
      }
      setAnalisis(analisisSint)
      setNivelSel(dec.nivel||2)
      setTipo(dec.tipo||'Educativo')
      setAvatarSel(0)
      setAvatarManual(dec.avatar||'')
      setAnguloSel(dec.angulo||null)
      setCtxFromAdvertorial(data)
    }catch(e){console.error('Error cargando advertorial:',e)}
  },[])

  async function api(messages,modo) {
    const r=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages,modo,apiProvider:modeloSel.startsWith('claude')?'claude':'openai',modelo:modeloSel})   // <-- pasa el provider
    })
    const d=await r.json()
    if(d.error) throw new Error(d.error)
    if(d.costoOperacion) {
      setUltimoCosto(d.costoOperacion)
      setCostoSesion(prev=>({
        usd: prev.usd + d.costoOperacion.totales.usd,
        cop: prev.cop + d.costoOperacion.totales.cop,
        operaciones: prev.operaciones + 1
      }))
    }
    return d
  }

  async function subirArchivo(file) {
    if (!file) return
    setSubiendoArchivo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/extract-file', { method:'POST', body: fd })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al procesar archivo')
      setArchivos(a => [...a, { nombre: d.filename, kind: d.kind, text: d.text, chars: d.chars, size: d.size }])
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setSubiendoArchivo(false)
  }

  async function analizar() {
    if(!nombre.trim()&&!prod.trim()&&!url.trim()&&archivos.length===0) return alert('Necesito al menos: nombre, descripción, URL, o un archivo')
    setAnalizando(true);setAnalisis(null);setTipo(null);setVersiones([]);setNivelSel(null);setAvatarSel(null);setAvatarManual('');setAnguloSel(null)
    const archivosTexto = archivos.filter(a=>a.kind==='text').map(a=>`\n\n--- ARCHIVO: ${a.nombre} ---\n${a.text}`).join('')
    const archivosImg = archivos.filter(a=>a.kind==='image')
    const ctxBase = `${nombre.trim()?'NOMBRE: '+nombre+'\n':''}${prod.trim()?'PRODUCTO: '+prod:''}${url.trim()?'\nURL: '+url:''}\nMERCADO: ${pais}\nPLATAFORMA: ${plat}${archivosTexto}`
    // Si hay imágenes, las pasamos como mensajes multimodales
    const userContent = archivosImg.length>0
      ? [{type:'text', text: ctxBase}, ...archivosImg.map(a=>({type:'image_url', image_url:{url:a.text}}))]
      : ctxBase
    const ctx = userContent
    try {
      const d=await api([{role:'user',content:ctx}],'analizar')
      const text=d.content?.[0]?.text||''
      // Extraer y limpiar JSON
      let cleanJson = text.replace(/```json|```/g,'').trim()
      const jsonStart = cleanJson.indexOf('{')
      const jsonEnd = cleanJson.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) cleanJson = cleanJson.slice(jsonStart, jsonEnd+1)
      // Reemplazar " por ' para evitar JSON inválido
      cleanJson = cleanJson
        .replace(/\\"/g, "'")
        .replace(/[ -]/g,' ')
      // Parser JSON tolerante con auto-fix
      const parseConFix = (str) => {
        try { return JSON.parse(str) } catch(e1) {
          let fixed = str
            .replace(/}\s*{/g, '},{')
            .replace(/]\s*\[/g, '],[')
            .replace(/}\s*"/g, '},"')
            .replace(/]\s*"/g, '],"')
            .replace(/"\s*{/g, '",{')
            .replace(/"\s*\[/g, '",[')
            .replace(/,(\s*[}\]])/g, '$1')
          try { return JSON.parse(fixed) } catch(e2) {
            const opens = (fixed.match(/{/g)||[]).length
            const closes = (fixed.match(/}/g)||[]).length
            const opensA = (fixed.match(/\[/g)||[]).length
            const closesA = (fixed.match(/]/g)||[]).length
            if (opens > closes || opensA > closesA) {
              let extra = fixed
              for (let k=0; k<opensA-closesA; k++) extra += ']'
              for (let k=0; k<opens-closes; k++) extra += '}'
              try { return JSON.parse(extra) } catch(e3) { throw e1 }
            }
            throw e1
          }
        }
      }
      const parsed = parseConFix(cleanJson)
      const sorted={...parsed,tipos:[...(parsed.tipos||[])].sort((a,b)=>b.score-a.score)}
      setAnalisis(sorted)
      setNivelSel(parsed.nivel_recomendado)
      setTipo(parsed.tipo_recomendado)
      // Ángulo OBLIGATORIO: preselecciona el recomendado de mayor score
      const anguloRec = parsed.angulos_recomendados?.[0]?.angulo
      if (anguloRec) setAnguloSel(anguloRec)
      // Avatar OBLIGATORIO: preselecciona el recomendado
      if (parsed.avatar_recomendado !== undefined) setAvatarSel(parsed.avatar_recomendado)
      if(d.promptEjecutado) setPromptAnalisis(d.promptEjecutado)
    } catch(e){alert('Error al analizar: '+e.message)}
    setAnalizando(false)
  }

  function tiposAjustados(nivel) {
    if(!analisis) return []
    const aj={1:{Educativo:+15,Emocional:+10,Racional:-10,Aspiracional:-20},2:{Emocional:+15,Funcional:+10,Educativo:+5,Aspiracional:-15},3:{Funcional:+15,Educativo:+10,Racional:+5,Aspiracional:-5},4:{Aspiracional:+20,Funcional:+10,Racional:+5,Emocional:-10},5:{Aspiracional:+25,Funcional:+5,Emocional:-10,Educativo:-15}}
    const adj=nivel===analisis.nivel_recomendado?{}:(aj[nivel]||{})
    return [...analisis.tipos].map(t=>({...t,score:Math.min(99,Math.max(10,t.score+(adj[t.tipo]||0)))})).sort((a,b)=>b.score-a.score)
  }

  function buildCtx() {
    const nv=nivelSel||analisis.nivel_recomendado
    const ni=analisis.niveles.find(n=>n.numero===nv)
    const durStr=formato==='video'?`\nDURACIÓN: ${duracion} segundos`:''
    const prodStr=prod.trim()?`\nPRODUCTO: ${prod}`:''
    const urlStr=url.trim()?`\nURL: ${url}`:''
    const fmtImgStr = formato==='imagen' ? `\nFORMATO_IMG: ${formatoImagen}` : ''
    const avatarStr = avatarManual.trim() ? avatarManual.trim() : (avatarSel!==null && analisis?.avatares?.[avatarSel] ? analisis.avatares[avatarSel].nombre + ' — ' + analisis.avatares[avatarSel].dolor_principal : '')
    const avatarLine = avatarStr ? `\nAVATAR: ${avatarStr}` : ''
    const anguloLine = anguloSel ? `\nANGULO_VENTA: ${anguloSel}` : ''
    const hooksUsadosLine = (formato==='imagen' && hooksUsadosImg.length>0) ? `\nHOOKS_YA_USADOS: ${hooksUsadosImg.join(',')}` : ''
    const adv = ctxFromAdvertorial?.advertorial
    const txt = (v)=>typeof v==='string'?v:(v?JSON.stringify(v):'')
    const advLine = adv ? '\n\n'+buildAdvertorialContext(ctxFromAdvertorial) : ''
    return `TIPO: ${tipo}\nMERCADO: ${pais}\nPLATAFORMA: ${plat}\nFORMATO: ${formato}${durStr}${fmtImgStr}\nNIVEL: ${nv} - ${ni.nombre}\nÁNGULO: ${ni.angulo}${avatarLine}${anguloLine}${hooksUsadosLine}${prodStr}${urlStr}${advLine}`
  }

  function buildAdvertorialContext(ctx) {
    const adv = ctx?.advertorial
    if (!adv) return ''
    const txt = (v)=>typeof v==='string'?v:(v?JSON.stringify(v):'')
    return `═══ CONTEXTO_ADVERTORIAL_FUENTE ═══
El ad debe alinear con este funnel: usar el mismo lenguaje, dolor, mecanismo y testimonios reales.

PRODUCTO: ${ctx.nombre||''}
MERCADO: ${ctx.mercado||''}
AVATAR ELEGIDO: ${ctx.avatar||''}

TITULARES:
${txt(adv.titulares)}

PROMESA / SUMARIO:
${txt(adv.bajada)}

FICHA DEL EXPERTO:
${txt(adv.fichaExperto)}

APERTURA - DOLOR DEL AVATAR:
${txt(adv.apertura)}

HISTORIA DEL PACIENTE:
${txt(adv.historiaPaciente)}

CITA EXPERTO:
${txt(adv.citaExperto)}

DESARROLLO EDUCATIVO:
${txt(adv.desarrolloEducativo)}

COMPARATIVA ANTES/DESPUÉS:
${txt(adv.comparativaEstados)}

POR QUÉ OTROS FALLAN:
${txt(adv.porQueOtrosFallan)}

MECANISMO ÚNICO:
${(adv.nombresMecanismo||[])[0]||''}
${txt(adv.transicionMecanismo)}

PRODUCTO E INGREDIENTES:
${txt(adv.producto)}

PROMOCIONES:
${txt(adv.promociones)}

GARANTÍA:
${txt(adv.garantia)}

TESTIMONIOS DETALLADOS:
${txt(adv.testimonios)}

PREGUNTAS Y RESPUESTAS:
${txt(adv.faq)}

CIERRE / CTA DEL ADVERTORIAL:
${txt(adv.cierreCTA)}

═══ INSTRUCCIONES ═══
- El ad debe llevar al usuario A LEER este advertorial
- Usa el mismo lenguaje del dolor
- Referencia el mecanismo único por nombre
- Si usas testimonio, escoge uno real de los listados (no inventes)
- El hook puede salir de los titulares, apertura o historia
- NO contradigas la promesa del advertorial
═══════════════════════════════════`
  }

  async function generar(esCorr) {
    if(!tipo) return
    const corr=correccion.trim()
    if(esCorr&&!corr) return alert('Escribe qué corregir')
    setGenerando(true)
    let newMsgs
    if(!esCorr) {
      newMsgs=[{role:'user',content:buildCtx()}]
      setHistorial([]);setMsgs(newMsgs);setVersionActiva(0);setVariaciones([]);setVariacionActiva(0)
    } else {
      const textoActual=versiones.map((v,i)=>`VERSIÓN ${i+1} — Hook: ${v.hook}\n${v.guionCompleto}`).join('\n\n---\n\n')
      newMsgs=[...msgs,
        {role:'assistant',content:textoActual},
        {role:'user',content:`Aplica esta corrección a las 2 versiones manteniendo estructura, producto, tono y mercado. Solo cambia lo indicado:\n"${corr}"\nDevuelve las 2 versiones completas con el mismo formato exacto, empezando directo con VERSIÓN 1 sin texto introductorio.`}
      ]
      setHistorial(h=>[...h,corr]);setCorreccion('');setMsgs(newMsgs)
    }
    try {
      const d=await api(newMsgs,esCorr?'correccion':'generar')
      const text=d.content?.[0]?.text||''
      if(d.promptEjecutado) setPromptGen(d.promptEjecutado)
      // Anti-repetición: acumular índices de hooks usados (solo formato imagen)
      if(formato==='imagen' && Array.isArray(d.hooksIndicesUsados) && d.hooksIndicesUsados.length>0) {
        setHooksUsadosImg(prev => Array.from(new Set([...prev, ...d.hooksIndicesUsados.map(n=>parseInt(n,10)).filter(n=>!isNaN(n))])))
      }
      const parsed=parseVersiones(text,formato)
      if(parsed.length>0) {
        const entrada={
          id:Date.now(),tipo,formato,duracion,
          nivel:nivelSel||analisis.nivel_recomendado,
          pais,versiones:parsed,
          analisis:analisis,
          prompt:d.promptEjecutado||'',
          ts:new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})
        }
        setSesionHistorial(h=>[entrada,...h].slice(0,10))
        setSesionActiva(entrada.id)
      }
    } catch(e){alert('Error: '+e.message)}
    setGenerando(false)
  }

  function parseVersiones(rawText,fmt) {
    const text=rawText.trim()
    const cleanStr=t=>t.replace(/\*\*/g,'').replace(/^\s*\*+|\*+\s*$/gm,'').trim()
    let vers=[]

    if(fmt==='imagen') {
      // Limpiar meta-texto al final (preguntas al usuario, conclusiones)
      const text2 = text
        .replace(/\n+(¿[^?]+\?[^\n]*)+\s*$/g, '')
        .replace(/\n+Con estas \d+ ideas[\s\S]*$/gi, '')
        .replace(/\n+En conclusi[oó]n[\s\S]*$/gi, '')

      const parseBloque = (bloque, idx) => {
        // Hook: captura tolerante hasta el siguiente section-header o fin (no truncar a una sola línea)
        const hookMatch = bloque.match(/Hook\s*:\s*([\s\S]*?)(?=\n\s*(?:Descripci[oó]n\s*de\s*la\s*imagen|Descripci[oó]n|Imagen|Texto en imagen|Bullets|Texto)\s*:|\n\s*---|$)/i)
        const hookTituloMatch = bloque.match(/IDEA DE IMAGEN\s*\d+[^\n]*?(?:Hook:|—\s*)([^\n]+)/i)
        let hookRaw = hookMatch ? cleanStr(hookMatch[1].trim().replace(/\n+/g,' ')) : hookTituloMatch ? cleanStr(hookTituloMatch[1]) : `Idea ${idx+1}`
        // SIN cap rígido de 9 palabras — el LLM ya tiene instrucciones explícitas; mostramos hook completo.
        const hook = hookRaw
        // Detectar hooks cortados (terminan con preposición/artículo/conjunción) — solo como warning, no recorta.
        const palabrasCorte = ['de','la','el','los','las','un','una','que','y','o','con','por','para','en','del','al','sin','pero','aunque','mi','tu','su','este','esta','ese','esa']
        const ultimaPalabra = hook.replace(/[.,;:!?]+$/,'').split(/\s+/).pop()?.toLowerCase()
        const hookCortado = palabrasCorte.includes(ultimaPalabra)

        // Descripción: parser tolerante a contenido en misma línea Y multi-línea
        const descMatch = bloque.match(/(?:Descripci[oó]n de la imagen|Descripci[oó]n|Imagen)\s*:\s*([\s\S]*?)(?=\n\s*(?:Texto en imagen|Bullets|Texto)\s*:|\n\s*---|$)/i)
        const descRaw = descMatch ? descMatch[1].trim() : ''
        const descBullets = descRaw
          .split('\n')
          .map(l=>cleanStr(l.replace(/^[•\-\*]+\s*/,'')))
          .filter(l=>l.length>3 && !l.match(/^---/) && !l.match(/^Texto en imagen/i) && !l.match(/^Bullets/i) && !l.match(/^Texto\s*:/i) && !l.match(/^Hook/i))
        const descripcion = descRaw
        const descripcionArr = descBullets

        // Texto en imagen / Bullets: parser tolerante a contenido en misma línea Y multi-línea
        const textoMatch = bloque.match(/(?:Texto en imagen|Bullets|Texto)\s*:\s*([\s\S]*?)(?=\n\s*---|$)/i)
        const bulletsRaw = textoMatch ? textoMatch[1].trim() : ''
        const bullets = bulletsRaw.split('\n')
          .map(l=>cleanStr(l.replace(/^[•\-\*\d\.]+\s*/,'')))
          .filter(l=>l.length>3 && !l.match(/^---/))
        return {hook, hookCortado, descripcion, descripcionArr, bullets, bulletsRaw, guionCompleto:bloque, guionVisual:bloque, guionNeto:''}
      }

      // Dividir por IDEA DE IMAGEN N
      const matches=[...text2.matchAll(/IDEA DE IMAGEN\s*\d+[^\n]*/gi)]
      if(matches.length>=1) {
        for(let i=0;i<Math.min(matches.length,2);i++) {
          const start=matches[i].index
          const end=i+1<matches.length?matches[i+1].index:text2.length
          const bloque=text2.substring(start,end).trim()
          if(bloque.length>20) vers.push(parseBloque(bloque,i))
        }
      }

      // Fallback: dividir por ---
      if(vers.length===0) {
        const bloques=text2.split(/\n---+\n/).map(b=>b.trim()).filter(b=>b.length>20)
        for(let i=0;i<Math.min(bloques.length,2);i++) {
          vers.push(parseBloque(bloques[i],i))
        }
      }

      if(vers.length===0) {
        vers=[{hook:'Idea generada',descripcion:text2,descripcionArr:[],bullets:[],guionCompleto:text2,guionVisual:text2,guionNeto:''}]
      }

    } else {
      // Video: formato limpio — solo hook + texto narrado
      const hookMatches=[...text.matchAll(/VERSI[OÓ]N\s*\d+\s*[—\-–]\s*Hook:\s*([^\n]+)/gi)]
      const hooks=hookMatches.map(m=>m[1].trim())
      // Split por separador ═══, filtro solo que tenga contenido real
      const bloques=text.split(/═{3,}[^\n]*\n/g).map(p=>p.trim()).filter(p=>p.length>20&&!p.match(/^VERSI[OÓ]N\s*\d+\s*[—\-–]/i))
      for(let i=0;i<Math.min(bloques.length,2);i++) {
        // Limpiar --- del final
        const neto=bloques[i].replace(/^---\s*|\s*---$/g,'').trim()
        vers.push({hook:hooks[i]||`Versión ${i+1}`,guionCompleto:neto,guionVisual:neto,guionNeto:neto,descripcion:'',bullets:[]})
      }
    }

    if(vers.length===0) vers=[{hook:'Generado',guionCompleto:text,guionVisual:text,guionNeto:'',descripcion:'',bullets:[]}]
    setVersiones(vers)
    setVersionActiva(0)
    return vers
  }

  async function generarVariaciones() {
    if(!versiones[versionActiva]||formato!=='video') return
    if(!tipo) return alert('Selecciona un motivo primero')
    setGenerandoVariaciones(true)
    const v = versiones[versionActiva]
    const nv = nivelSel||analisis?.nivel_recomendado
    const ni = analisis?.niveles?.find(n=>n.numero===nv)
    const tipoVar = tipo || sesionHistorial.find(e=>e.id===sesionActiva)?.tipo || 'Funcional'
    const paisVar = pais || sesionHistorial.find(e=>e.id===sesionActiva)?.pais || 'Colombia'
    const durVar = duracion || sesionHistorial.find(e=>e.id===sesionActiva)?.duracion || '30'
    const avatarStr = avatarManual.trim() ? avatarManual.trim() : (avatarSel!==null && analisis?.avatares?.[avatarSel] ? analisis.avatares[avatarSel].nombre + ' — ' + analisis.avatares[avatarSel].dolor_principal : '')
    const avatarLine = avatarStr ? `\nAVATAR: ${avatarStr}` : ''
    const anguloLine = anguloSel ? `\nANGULO_VENTA: ${anguloSel}` : ''
    const ctx = `TIPO: ${tipoVar}\nMERCADO: ${paisVar}\nPLATAFORMA: ${plat}\nFORMATO: video\nDURACIÓN: ${durVar} segundos\nNIVEL: ${nv} - ${ni?.nombre||''}${avatarLine}${anguloLine}\n\n${v.guionCompleto}`
    try {
      const d = await api([{role:'user',content:ctx}],'variaciones')
      const text = d.content?.[0]?.text||''
      if(d.promptEjecutado) setPromptGen(d.promptEjecutado)
      // parseVersiones llama setVersiones internamente — lo evitamos para variaciones
      const hookMatchesVar=[...text.matchAll(/VERSI[OÓ]N\s*\d+\s*[-—–]\s*Hook:\s*([^\n]+)/gi)]
      const hooksVar=hookMatchesVar.map(m=>m[1].trim())
      const bloquesVar=text.split(/═{3,}[^\n]*\n/g).map(p=>p.trim()).filter(p=>p.length>20&&!p.match(/^VERSI[OÓ]N\s*\d+\s*[—\-–]/i))
      const parsedVar=[]
      for(let i=0;i<Math.min(bloquesVar.length,2);i++){
        const neto=bloquesVar[i].replace(/^---\s*|\s*---$/g,'').trim()
        parsedVar.push({hook:hooksVar[i]||('Variación '+(i+1)),guionCompleto:neto,guionVisual:neto,guionNeto:neto,descripcion:'',bullets:[]})
      }
      if(parsedVar.length>0){
        setVariaciones(parsedVar)
        setVariacionActiva(0)
        setTimeout(()=>document.getElementById('variaciones-section')?.scrollIntoView({behavior:'smooth',block:'start'}),200)
      }
    } catch(e){alert('Error: '+e.message)}
    setGenerandoVariaciones(false)
  }

  async function auditarVersion(idx, fmt) {
    const v = versiones[idx]
    if (!v) return
    const key = (fmt==='imagen'?'imagen_':'')+idx
    setAuditando(key)
    try {
      const nv = nivelSel||analisis?.nivel_recomendado
      const ni = analisis?.niveles?.find(n=>n.numero===nv)
      const avatarStr = avatarManual.trim() || (avatarSel!==null && analisis?.avatares?.[avatarSel] ? analisis.avatares[avatarSel].nombre+' — '+analisis.avatares[avatarSel].dolor_principal : '')
      const adv = ctxFromAdvertorial?.advertorial
      const advBrief = adv ? `\n\nADVERTORIAL FUENTE (resumen):\n- Mecanismo: ${(adv.nombresMecanismo||[])[0]||''}\n- Promesa: ${typeof adv.bajada==='string'?adv.bajada.slice(0,200):''}\n- Dolor del avatar (apertura): ${typeof adv.apertura==='string'?adv.apertura.slice(0,250):''}` : ''
      const guionTexto = v.guionCompleto || v.guionVisual || v.guionNeto || JSON.stringify(v)

      // Construye bloques de lineamientos desde las constantes locales (single source of truth en frontend)
      const dNivel = DOCTRINA_NIVELES[nv]
      const dMotivo = DOCTRINA_MOTIVOS[tipo]
      const dAngulo = anguloSel ? DOCTRINA_ANGULOS[anguloSel] : null
      const dTipoImg = (fmt==='imagen' && formatoImagen) ? DOCTRINA_TIPOS_IMAGEN[formatoImagen] : null

      const lineamientosBloque = [
        dNivel ? `LINEAMIENTO NIVEL ${nv} (${dNivel.titulo}):
- Regla: ${dNivel.regla}
- Enfoque: ${dNivel.enfoque}
- CTA permitido: ${dNivel.cta}` : '',
        dMotivo ? `LINEAMIENTO MOTIVO ${tipo}:
- Emoción dominante: ${dMotivo.emocion}
- Enfoque: ${dMotivo.enfoque}
- Estructura: ${dMotivo.estructura}
- Pieza ideal: ${dMotivo.pieza}
- Palabras clave esperadas: ${dMotivo.palabras}` : '',
        dAngulo ? `LINEAMIENTO ÁNGULO ${anguloSel}:
- Qué hace: ${dAngulo.que}
- Estructura: ${dAngulo.estructura}
- Tono: ${dAngulo.tono}
- Ejemplo de referencia: "${dAngulo.ejemplo}"` : '',
        dTipoImg ? `LINEAMIENTO TIPO DE IMAGEN ${formatoImagen}:
- Esencia: ${dTipoImg.esencia}
- Composición visual obligatoria: ${dTipoImg.composicion}
- Evitar (anti-cruce): ${dTipoImg.evitar}
- Regla del texto en pieza: ${dTipoImg.reglaTextoEnPieza || '(no especificada)'}` : ''
      ].filter(Boolean).join('\n\n')

      const ctxAud = `DECISIONES TOMADAS AL CREAR ESTE CONTENIDO:
- AVATAR: ${avatarStr}
- NIVEL DE CONSCIENCIA: ${nv} - ${ni?.nombre||''}
- MOTIVO/TIPO: ${tipo}
- ÁNGULO DE VENTA: ${anguloSel || '(no se eligió ángulo específico)'}
- FORMATO: ${fmt}${fmt==='imagen' && formatoImagen ? `\n- TIPO DE IMAGEN: ${formatoImagen}` : ''}
- MERCADO: ${pais}${advBrief}

═══ LINEAMIENTOS DEL CLIENTE A VERIFICAR ═══
${lineamientosBloque}
═══════════════════════════════════════════════

CONTENIDO GENERADO A AUDITAR:
${guionTexto}`

      const d = await api([{role:'user', content:ctxAud}], 'auditar')
      const text = d.content?.[0]?.text || ''
      setAuditorias(a=>({...a, [key]: text}))
    } catch(e) {
      alert('Error al auditar: '+e.message)
    }
    setAuditando(null)
  }

  async function copiarAlPortapapeles(texto, key) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto)
      } else {
        const el = document.createElement('textarea')
        el.value = texto
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopiadoKey(key)
      setTimeout(() => setCopiadoKey(k => k === key ? null : k), 2000)
    } catch (e) {
      console.error('No se pudo copiar:', e)
      alert('No se pudo copiar al portapapeles')
    }
  }

  function textoCompletoIdea(v) {
    if (!v) return ''
    const partes = []
    if (v.hook) partes.push('HOOK: ' + v.hook)
    const desc = (v.descripcion && v.descripcion.trim()) || (Array.isArray(v.descripcionArr) ? v.descripcionArr.join('\n') : '')
    if (desc) partes.push('DESCRIPCIÓN DE LA IMAGEN:\n' + desc)
    const blts = Array.isArray(v.bullets) ? v.bullets.filter(s => s && s.trim()) : []
    if (blts.length > 0) partes.push('BULLETS:\n' + blts.join('\n'))
    else if (v.bulletsRaw && v.bulletsRaw.trim()) partes.push('BULLETS:\n' + v.bulletsRaw.trim())
    return partes.join('\n\n')
  }

  function textoCompletoVersion(v) {
    if (!v) return ''
    const partes = []
    if (v.hook) partes.push('HOOK: ' + v.hook)
    const guion = v.guionNeto || v.guionVisual || v.guionCompleto || ''
    if (guion) partes.push(guion)
    return partes.join('\n\n')
  }

  // Render estructurado de la auditoría: colorea ✅/⚠️/❌, destaca PUNTAJE y RECOMENDACIONES.
  function renderAuditoria(textoAud) {
    if (!textoAud) return null
    const lineas = textoAud.split('\n')
    const verdeOk = D.green
    const ambar = '#f59e0b'
    const rojo = '#dc2626'
    const sectionHeaders = /^(NIVEL|MOTIVO|[ÁA]NGULO|TIPO DE IMAGEN|📊 AUDITOR[IÍ]A)/i
    const puntajeRe = /^PUNTAJE GLOBAL:\s*(\d+)\s*\/\s*100/i
    const recoRe = /^RECOMENDACIONES/i

    let enRecos = false
    const out = []
    for (let i = 0; i < lineas.length; i++) {
      const raw = lineas[i]
      const trim = raw.trim()
      if (!trim) { out.push(<div key={i} style={{height:6}}/>); continue }

      const mPuntaje = trim.match(puntajeRe)
      if (mPuntaje) {
        const score = parseInt(mPuntaje[1], 10)
        const colorScore = score >= 90 ? verdeOk : score >= 70 ? ambar : rojo
        out.push(
          <div key={i} style={{margin:'10px 0',padding:'10px 14px',background:D.accent,border:`1px solid ${colorScore}`,borderRadius:8,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:11,fontWeight:700,color:D.textDim,letterSpacing:0.5,textTransform:'uppercase'}}>Puntaje global</span>
            <span style={{fontSize:20,fontWeight:800,color:colorScore}}>{score}/100</span>
          </div>
        )
        enRecos = false
        continue
      }

      if (recoRe.test(trim)) {
        enRecos = true
        out.push(
          <div key={i} style={{marginTop:14,marginBottom:6,padding:'8px 12px',border:`1px solid ${D.blue}`,borderLeft:`3px solid ${D.blue}`,borderRadius:6,background:D.accent}}>
            <span style={{fontSize:11,fontWeight:700,color:D.blue,letterSpacing:0.5,textTransform:'uppercase'}}>{trim}</span>
          </div>
        )
        continue
      }

      if (sectionHeaders.test(trim)) {
        out.push(
          <div key={i} style={{marginTop:i===0?0:12,marginBottom:6,fontSize:12,fontWeight:700,color:D.text,letterSpacing:0.3,textTransform:'uppercase'}}>{trim}</div>
        )
        enRecos = false
        continue
      }

      const startsOk = trim.startsWith('✅')
      const startsWarn = trim.startsWith('⚠️') || trim.startsWith('⚠')
      const startsBad = trim.startsWith('❌')
      const c = startsOk ? verdeOk : startsWarn ? ambar : startsBad ? rojo : D.textMid
      out.push(
        <div key={i} style={{fontSize:13,color:c,lineHeight:1.55,paddingLeft:enRecos?12:0,marginBottom:3}}>{trim}</div>
      )
    }
    return <div style={{display:'flex',flexDirection:'column',gap:0}}>{out}</div>
  }

  function cargarDeSesion(entrada) {
    setVersiones(entrada.versiones)
    setTipo(entrada.tipo)
    setFormato(entrada.formato)
    setDuracion(entrada.duracion)
    setNivelSel(entrada.nivel)
    setVersionActiva(0)
    setHistorial([])
    setSesionActiva(entrada.id)
    setMostrarSesion(false)
    setPromptGen(entrada.prompt||'')
    if(entrada.analisis) setAnalisis(entrada.analisis)
    setTimeout(()=>document.getElementById('resultado-section')?.scrollIntoView({behavior:'smooth',block:'start'}),200)
  }

  // ── Render contenido de imagen (nuevo formato) ──────────────────
  function renderImagen(v) {
    const descTexto = (v.descripcion && v.descripcion.trim()) || (v.descripcionArr && v.descripcionArr.length>0 ? v.descripcionArr.join('\n') : '')
    const bulletsTrim = Array.isArray(v.bullets) ? v.bullets.filter(s=>s && s.trim()) : []
    const bulletsRawTrim = (v.bulletsRaw && v.bulletsRaw.trim()) || ''
    // Render adaptativo de bullets: párrafo si es texto corrido (1 ítem o ítems largos), lista si son bullets reales cortos
    const bulletsAsParagraph = bulletsTrim.length === 0 ? false
      : bulletsTrim.length === 1 || bulletsTrim.some(s => s.length > 80)
    const ideaKey = 'idea_' + (v.hook ? v.hook.slice(0, 40) : Math.random())
    const bulletsKey = 'bullets_' + (v.hook ? v.hook.slice(0, 40) : Math.random())
    const bulletsTexto = bulletsTrim.length > 0 ? bulletsTrim.join('\n') : bulletsRawTrim
    return (
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {/* Hook + Copiar */}
        <div style={{background:D.accent,border:`1px solid ${v.hookCortado?'#c47a3a':D.cardBorder}`,borderRadius:10,padding:'12px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,gap:10}}>
            <div style={{fontSize:12,fontWeight:700,color:v.hookCortado?'#c47a3a':D.blue,letterSpacing:0.5,textTransform:'uppercase'}}>Hook</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {v.hookCortado&&<div style={{fontSize:9,fontWeight:600,color:'#c47a3a',letterSpacing:'.05em',textTransform:'uppercase'}}>⚠ Posible corte — regenera</div>}
              <button onClick={()=>copiarAlPortapapeles(textoCompletoIdea(v), ideaKey)} style={{fontSize:11,color:copiadoKey===ideaKey?D.green:D.blueLight,border:`1px solid ${copiadoKey===ideaKey?D.green:D.blue}`,background:'transparent',borderRadius:7,padding:'3px 10px',cursor:'pointer',fontFamily:'inherit'}}>{copiadoKey===ideaKey?'✓ Copiado':'Copiar'}</button>
            </div>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:D.text,lineHeight:1.4}}>{v.hook}</div>
        </div>

        {/* Descripción */}
        <div style={{background:D.card,border:`1px solid ${D.cardBorder}`,borderRadius:10,padding:16}}>
          <div style={{fontSize:12,fontWeight:700,color:D.blue,letterSpacing:0.5,textTransform:'uppercase',marginBottom:6}}>Descripción de la imagen</div>
          {descTexto ? (
            <div style={{fontSize:14,color:D.textMid,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{descTexto}</div>
          ) : (
            <div style={{fontSize:12,color:D.textFaint,fontStyle:'italic'}}>El modelo no entregó descripción. Usa el botón "Regenerar" para reintentar.</div>
          )}
        </div>

        {/* Bullets (adaptativo) */}
        {(bulletsTrim.length>0 || bulletsRawTrim) && (
          <div style={{background:D.card,border:`1px solid ${D.cardBorder}`,borderRadius:10,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,gap:10}}>
              <div style={{fontSize:12,fontWeight:700,color:D.blue,letterSpacing:0.5,textTransform:'uppercase'}}>Bullets</div>
              <button onClick={()=>copiarAlPortapapeles(bulletsTexto, bulletsKey)} style={{fontSize:11,color:copiadoKey===bulletsKey?D.green:D.blueLight,border:`1px solid ${copiadoKey===bulletsKey?D.green:D.blue}`,background:'transparent',borderRadius:7,padding:'3px 10px',cursor:'pointer',fontFamily:'inherit'}}>{copiadoKey===bulletsKey?'✓ Copiado':'Copiar'}</button>
            </div>
            {bulletsAsParagraph || bulletsTrim.length===0 ? (
              <div style={{fontSize:14,color:D.textMid,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{bulletsTrim.length>0 ? bulletsTrim.join('\n') : bulletsRawTrim}</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {bulletsTrim.map((b,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8}}>
                    <span style={{color:D.blue,fontWeight:700,flexShrink:0,marginTop:1}}>•</span>
                    <span style={{fontSize:14,color:D.textMid,lineHeight:1.6}}>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  function renderContenido(v,fmt) {
    if(!v) return null
    if(fmt==='imagen') return renderImagen(v)
    const neto = v.guionNeto || v.guionVisual || v.guionCompleto
    return (
      <div style={{border:`1px solid ${D.blue}`,borderRadius:10,background:D.blueDark,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontSize:10,fontWeight:700,color:D.blueLight,letterSpacing:'.1em',textTransform:'uppercase'}}>Guión neto — para app de voz</span>
          <button onClick={()=>copiarAlPortapapeles(neto, 'guionNeto')} style={{fontSize:11,color:copiadoKey==='guionNeto'?D.green:D.blueLight,border:`1px solid ${copiadoKey==='guionNeto'?D.green:D.blue}`,background:'transparent',borderRadius:7,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}>{copiadoKey==='guionNeto'?'✓ Copiado':'Copiar'}</button>
        </div>
        <div style={{fontSize:14,color:D.text,lineHeight:1.9,whiteSpace:'pre-wrap'}}>{neto}</div>
      </div>
    )
  }

  const InfoBtn=({prompt,label})=>(
    <button onClick={()=>setModalPrompt({prompt,label})} title="Ver prompt"
      style={{fontSize:10,padding:'2px 8px',borderRadius:10,border:`1px solid ${D.cardBorder}`,background:'transparent',color:D.textDim,cursor:'pointer',marginLeft:8,fontFamily:'inherit'}}>{'{ }'}</button>
  )

  const inp={width:'100%',background:D.input,border:`1px solid ${D.inputBorder}`,borderRadius:8,padding:'10px 12px',color:D.text,fontSize:13,fontFamily:'inherit',resize:'vertical'}
  const sel={width:'100%',background:D.input,border:`1px solid ${D.inputBorder}`,borderRadius:8,padding:'9px 11px',color:D.text,fontSize:13,fontFamily:'inherit',appearance:'none'}
  const btnMain={width:'100%',padding:13,fontSize:13,fontWeight:600,borderRadius:9,cursor:'pointer',border:'none',background:`linear-gradient(135deg,#1270a0,${D.blue})`,color:'#fff',letterSpacing:'.03em',marginTop:6}
  const crd={background:D.card,border:`1px solid ${D.cardBorder}`,borderRadius:14,padding:'18px 20px',marginBottom:10}
  const stepRow={display:'flex',alignItems:'center',gap:10,marginBottom:12}
  const stepNum={width:28,height:28,borderRadius:'50%',background:D.blue,color:'#ffffff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}
  const stepLbl={fontSize:12,fontWeight:500,color:D.textMid,letterSpacing:'.06em',textTransform:'uppercase'}
  const fldLbl={fontSize:10,color:D.textDim,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:5,fontWeight:500}
  const chipBtn=(active)=>({fontSize:12,padding:'6px 14px',borderRadius:20,border:`1px solid ${active?D.blue:D.cardBorder}`,background:active?D.blueDark:'transparent',color:active?D.blueLight:D.textDim,cursor:'pointer',fontFamily:'inherit',fontWeight:active?500:400,transition:'all .15s'})
  const copyBtn={fontSize:11,color:D.textDim,border:`1px solid ${D.cardBorder}`,background:'transparent',borderRadius:7,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}

  return (
    <>
      <Head>
        <title>Ideo Team — Ads Creator</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${D.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif}textarea:focus,input:focus,select:focus{outline:none;border-color:${D.blue}!important}textarea::placeholder,input::placeholder{color:#9ca3af}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${D.bg}}::-webkit-scrollbar-thumb{background:${D.cardBorder};border-radius:2px}`}</style>
      </Head>
      <div style={{background:D.bg,minHeight:'100vh',color:D.text}}>

        {modalPrompt&&(
          <div onClick={()=>setModalPrompt(null)} style={{position:'fixed',inset:0,background:'rgba(17,24,39,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 16px',overflowY:'auto'}}>
            <div onClick={e=>e.stopPropagation()} style={{background:'#ffffff',border:`1px solid ${D.cardBorder}`,borderRadius:14,padding:'1.25rem',width:'100%',maxWidth:700}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:D.blue,letterSpacing:'.07em',textTransform:'uppercase'}}>Prompt — {modalPrompt.label}</div>
                <button onClick={()=>setModalPrompt(null)} style={{fontSize:12,border:'none',background:'transparent',cursor:'pointer',color:D.textDim}}>✕</button>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8}}>
                <button onClick={()=>navigator.clipboard.writeText(modalPrompt.prompt)} style={copyBtn}>Copiar</button>
              </div>
              <pre style={{fontSize:12,color:D.textMid,background:D.accent,padding:12,borderRadius:8,whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:1.6,maxHeight:480,overflowY:'auto',margin:0}}>{modalPrompt.prompt}</pre>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div style={{background:'#ffffff',borderBottom:`1px solid ${D.cardBorder}`,padding:'0 28px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
          <div style={{lineHeight:1}}>
            <div style={{fontSize:16,fontWeight:800,color:D.text,letterSpacing:'.1em'}}>IDEO TEAM</div>
            <div style={{fontSize:9,color:D.blue,letterSpacing:'.2em',textTransform:'uppercase',marginTop:3}}>Ads Creator</div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {/* ── Selector de modelo (dropdown nativo) ── */}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:11,color:D.textDim,letterSpacing:0.5,textTransform:'uppercase',fontWeight:500}}>Modelo IA</span>
              <select value={modeloSel} onChange={e=>setModeloSel(e.target.value)}
                style={{background:D.input,border:`1px solid ${D.inputBorder}`,color:D.text,padding:'6px 28px 6px 10px',borderRadius:6,fontSize:13,cursor:'pointer',outline:'none',fontFamily:'inherit'}}>
                <option value="gpt-4.1-mini">GPT-4.1 mini (rápido)</option>
                <option value="gpt-4o-mini">GPT-4o mini (económico)</option>
                <option value="gpt-4o">GPT-4o (calidad)</option>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (mejor Claude)</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5 (rápido Claude)</option>
              </select>
            </div>

            {sesionHistorial.length>0&&(
              <button onClick={()=>setMostrarSesion(v=>!v)}
                style={{fontSize:11,color:D.blueLight,border:`1px solid ${D.blueDim}`,borderRadius:20,padding:'5px 14px',background:mostrarSesion?D.blueDark:'transparent',cursor:'pointer',fontFamily:'inherit'}}>
                Sesión ({sesionHistorial.length})
              </button>
            )}
          </div>
        </div>

        {mostrarSesion&&(
          <div style={{background:'#f9fafb',borderBottom:`1px solid ${D.cardBorder}`,padding:'12px 16px'}}>
            <div style={{maxWidth:700,margin:'0 auto'}}>
              <div style={{fontSize:10,color:D.textDim,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:10,fontWeight:500}}>
                Generaciones de esta sesión ({sesionHistorial.length}) — clic para recuperar
              </div>
              {sesionHistorial.length===0?(
                <div style={{fontSize:12,color:D.textFaint}}>Aún no hay generaciones en esta sesión</div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {sesionHistorial.map(e=>(
                    <div key={e.id} onClick={()=>cargarDeSesion(e)}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:sesionActiva===e.id?D.blueDark:D.input,border:`1px solid ${sesionActiva===e.id?D.blue:D.cardBorder}`,borderRadius:8,cursor:'pointer',transition:'all .15s'}}>
                      <div style={{fontSize:10,color:D.textDim,minWidth:36}}>{e.ts}</div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:5,marginBottom:2,flexWrap:'wrap'}}>
                          <span style={{fontSize:10,fontWeight:600,padding:'1px 6px',borderRadius:8,background:D.blueDark,color:D.blue,border:`1px solid ${D.blueDim}`}}>{e.tipo}</span>
                          <span style={{fontSize:10,color:D.textDim,padding:'1px 6px',borderRadius:8,background:D.accent,border:`1px solid ${D.cardBorder}`}}>
                            {e.formato==='imagen'?'Imagen':`Video ${e.duracion}s`} · Nv.{e.nivel} · {e.pais}
                          </span>
                        </div>
                        <div style={{fontSize:11,color:D.textFaint,lineHeight:1.3}}>{e.versiones[0]?.hook}</div>
                      </div>
                      <div style={{fontSize:10,color:D.blue,flexShrink:0}}>Cargar →</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{maxWidth:700,margin:'0 auto',padding:'28px 16px 80px'}}>

          {/* ── PASO 01 ── */}
          <div style={crd}>
            <div style={stepRow}><div style={stepNum}>01</div><div style={stepLbl}>Información del producto</div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <div><div style={fldLbl}>Mercado</div>
                <select value={pais} onChange={e=>setPais(e.target.value)} style={sel}><option>Colombia</option><option>Guatemala</option></select>
              </div>
              <div><div style={fldLbl}>Plataforma</div>
                <select value={plat} onChange={e=>setPlat(e.target.value)} style={sel}><option>Meta Ads</option><option>TikTok Ads</option><option value="Meta Ads y TikTok Ads">Meta + TikTok</option></select>
              </div>
            </div>
            <div style={fldLbl}>Nombre del producto</div>
            <input type="text" value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Migraine Stick, Suero Anti-Edad, Curso de Inglés..." style={{...inp,height:38,padding:'9px 12px',marginBottom:12}}/>
            <div style={fldLbl}>Descripción del producto <span style={{color:D.textFaint,fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional si pones URL o subes archivo)</span></div>
            <textarea value={prod} onChange={e=>setProd(e.target.value)} rows={3} placeholder="Qué es, qué problema resuelve, beneficios clave, para quién, precio..." style={{...inp,marginBottom:ctxFromAdvertorial?6:12}}/>
            {ctxFromAdvertorial && (() => {
              const fullCtx = buildAdvertorialContext(ctxFromAdvertorial)
              return (
                <div style={{marginBottom:12, border:`1px solid ${D.greenBorder}`, background:D.greenBg, borderRadius:6, overflow:'hidden'}}>
                  <button onClick={()=>setVerCtxAdv(v=>!v)}
                    style={{width:'100%', padding:'9px 12px', background:'transparent', border:'none', color:D.green, fontSize:11, textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span><b>📄 Contexto del advertorial cargado</b> — esto se enviará al modelo</span>
                    <span style={{color:D.textDim, fontWeight:400}}>{fullCtx.length.toLocaleString()} caracteres {verCtxAdv?'▲':'▼'}</span>
                  </button>
                  {verCtxAdv && (
                    <pre style={{margin:0, padding:'10px 12px', background:D.input, borderTop:`1px solid ${D.greenBorder}`, fontSize:10, color:D.textMid, lineHeight:1.5, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace:'pre-wrap', maxHeight:400, overflowY:'auto'}}>
                      {fullCtx}
                    </pre>
                  )}
                </div>
              )
            })()}
            <div style={fldLbl}>URL del producto <span style={{color:D.textFaint,fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional)</span></div>
            <input type="text" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." style={{...inp,resize:'none',height:38,padding:'9px 12px',marginBottom:12}}/>

            {/* Uploader de archivos */}
            <div style={fldLbl}>Archivos de contexto <span style={{color:D.textFaint,fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional · PDF, DOCX, TXT, MD, imágenes)</span></div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <label style={{flex:1,padding:'10px 12px',background:D.input,border:`1px dashed ${D.cardBorder}`,borderRadius:5,cursor:subiendoArchivo?'wait':'pointer',textAlign:'center',fontSize:11,color:subiendoArchivo?D.textFaint:D.blueLight,fontFamily:'inherit',transition:'all .15s'}}>
                {subiendoArchivo ? '⏳ Procesando archivo...' : '📎 Click aquí para subir archivo'}
                <input type="file" disabled={subiendoArchivo}
                  accept=".pdf,.docx,.txt,.md,.markdown,image/png,image/jpeg,image/webp,image/gif"
                  onChange={e=>{ const f=e.target.files?.[0]; if(f){subirArchivo(f); e.target.value=''} }}
                  style={{display:'none'}}/>
              </label>
            </div>
            {archivos.length>0 && (
              <div style={{marginBottom:12,display:'flex',flexDirection:'column',gap:5}}>
                {archivos.map((a,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:D.input,border:`1px solid ${D.cardBorder}`,borderRadius:5}}>
                    <span style={{fontSize:14}}>{a.kind==='image'?'🖼️':'📄'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:D.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.nombre}</div>
                      <div style={{fontSize:10,color:D.textDim}}>
                        {a.kind==='image'?'Imagen (vision)':`${a.chars.toLocaleString()} caracteres extraídos`}
                      </div>
                    </div>
                    <button onClick={()=>setArchivos(arr=>arr.filter((_,idx)=>idx!==i))}
                      style={{fontSize:11,color:D.textDim,background:'transparent',border:'none',cursor:'pointer',padding:4}}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontSize:11,color:D.textFaint,marginBottom:8}}>Cualquier combinación de descripción + URL + archivos enriquece el contexto.</div>
            <button onClick={analizar} disabled={analizando||(!nombre.trim()&&!prod.trim()&&!url.trim()&&archivos.length===0)} style={{...btnMain,opacity:(analizando||(!nombre.trim()&&!prod.trim()&&!url.trim()&&archivos.length===0))?.5:1}}>
              {analizando?'Analizando producto...':'Analizar producto'}
            </button>
          </div>

          {analisis&&(
            <>
              {/* ── PASO 02 ── */}
              <div style={crd}>
                <div style={stepRow}>
                  <div style={stepNum}>02</div>
                  <div style={stepLbl}>Análisis del producto</div>
                  <InfoBtn prompt={promptAnalisis} label="Análisis profundo"/>
                </div>
                <div style={{fontSize:12,color:D.blue,background:D.blueDark,border:`1px solid ${D.blueDim}`,borderRadius:8,padding:'10px 14px',marginBottom:14,lineHeight:1.6}}>
                  {analisis.razon_recomendacion}
                </div>

                {analisis.avatares?.length>0&&(
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:10,color:D.textDim,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8,fontWeight:500}}>Avatar — ¿a quién le hablas?</div>
                    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:8}}>
                      {analisis.avatares.map((av,i)=>{
                        const AVATAR_DEF = [
                          {accent:'#3a8cc4', icon:'👤'},
                          {accent:'#3aa87e', icon:'👥'},
                          {accent:'#c47a3a', icon:'🎯'},
                          {accent:'#8a5cd0', icon:'🧭'},
                          {accent:'#c43a7a', icon:'✦'},
                        ]
                        const def = AVATAR_DEF[i] || AVATAR_DEF[0]
                        const isSel = avatarSel===i && !avatarManual
                        return (
                          <div key={i} onClick={()=>{setAvatarSel(i);setAvatarManual('')}}
                            style={{
                              padding:'10px 14px',
                              borderRadius:8,
                              border:`1px solid ${isSel?def.accent:D.cardBorder}`,
                              background:isSel?D.blueDark:D.input,
                              cursor:'pointer',
                              transition:'all .15s',
                              display:'flex',alignItems:'center',gap:12,
                              borderLeft:`3px solid ${def.accent}`,
                            }}>
                            <div style={{width:28,height:28,borderRadius:'50%',background:D.accent,border:`2px solid ${def.accent}`,color:def.accent,fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                            <div style={{flex:1}}>
                              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                                <span style={{fontSize:12,fontWeight:600,color:D.text}}>{av.nombre}</span>
                                {i===analisis.avatar_recomendado&&<span style={{fontSize:9,color:def.accent,fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase'}}>· Recomendado</span>}
                                {av.tamano_publico&&<span style={{fontSize:9,color:D.textDim}}>· {av.tamano_publico}</span>}
                              </div>
                              <div style={{fontSize:11,color:D.textFaint,lineHeight:1.4}}>{av.dolor_principal}</div>
                            </div>
                            <div style={{fontSize:10,fontWeight:600,color:isSel?def.accent:D.textFaint,minWidth:28,textAlign:'right'}}>{av.relevancia}</div>
                          </div>
                        )
                      })}
                    </div>
                    <input type="text" value={avatarManual} onChange={e=>{setAvatarManual(e.target.value);setAvatarSel(null)}}
                      placeholder="O escribe tu propio avatar..."
                      style={{width:'100%',background:D.input,border:`1px solid ${avatarManual?D.blue:D.inputBorder}`,borderRadius:8,padding:'9px 12px',color:D.text,fontSize:13,fontFamily:'inherit'}}/>
                  </div>
                )}

                <div style={{fontSize:10,color:D.textDim,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:10,fontWeight:500}}>Niveles de conciencia — selecciona el que quieres atacar</div>
                {analisis.niveles.map(n=>{
                  // Gradiente de temperatura (frío → caliente) con barra lateral sutil
                  const NIVEL_ACCENTS = {
                    1: '#4a6a8a',  // gris azulado, audiencia fría
                    2: '#3a8cc4',  // azul medio
                    3: '#3aa898',  // verde-azul, audiencia tibia
                    4: '#c4a83a',  // ámbar, caliente
                    5: '#c46a3a',  // naranja terracota, lista
                  }
                  const accent = NIVEL_ACCENTS[n.numero] || NIVEL_ACCENTS[3]
                  const isRec=n.numero===analisis.nivel_recomendado
                  const isSel=n.numero===nivelSel
                  return(
                    <div key={n.numero} onClick={()=>setNivelSel(n.numero)}
                      style={{
                        background:isSel?D.blueDark:D.input,
                        borderRadius:8,
                        padding:'12px 14px',
                        marginBottom:8,
                        border:`1px solid ${isSel?accent:D.inputBorder}`,
                        borderLeft:`3px solid ${accent}`,
                        cursor:'pointer',
                        transition:'all .15s'
                      }}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:D.accent,border:`2px solid ${accent}`,color:accent,fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{n.numero}</div>
                        <div style={{fontSize:11,fontWeight:600,color:D.text,textTransform:'uppercase',letterSpacing:'.05em'}}>Nivel {n.numero} · {n.nombre}</div>
                        {isRec&&<span style={{fontSize:9,color:accent,fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase'}}>· Recomendado</span>}
                      </div>
                      <div style={{fontSize:13,fontWeight:500,marginBottom:8,color:D.textMid,lineHeight:1.5}}>{n.angulo}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:6}}>
                        <div style={{fontSize:11,color:D.green,lineHeight:1.4}}>✓ {n.porque_si}</div>
                        <div style={{fontSize:11,color:D.textFaint,lineHeight:1.4}}>✗ {n.porque_no}</div>
                      </div>
                      <div style={{fontSize:11,color:D.textFaint,fontStyle:'italic',borderTop:`1px solid ${D.cardBorder}`,paddingTop:6}}>Hook: "{n.ejemplo_hook}"</div>
                    </div>
                  )
                })}

                {/* ── Panel doctrina del nivel seleccionado (colapsable) ── */}
                {(nivelSel || analisis?.nivel_recomendado) && DOCTRINA_NIVELES[nivelSel || analisis?.nivel_recomendado] && (() => {
                  const nv = nivelSel || analisis?.nivel_recomendado
                  const d = DOCTRINA_NIVELES[nv]
                  return (
                    <PanelDoctrina
                      open={openPanelNivel}
                      setOpen={setOpenPanelNivel}
                      titulo={`Nivel ${nv}: ${d.titulo} — Lineamientos`}
                      color={d.color}
                    >
                      <DLine label="Regla" value={d.regla} />
                      <DLine label="Enfoque" value={d.enfoque} />
                      <DLine label="CTA permitido" value={d.cta} />
                    </PanelDoctrina>
                  )
                })()}
              </div>

              {/* ── PASO 03 — ahora se llama MOTIVO ── */}
              <div style={crd}>
                <div style={stepRow}><div style={stepNum}>03</div><div style={stepLbl}>Motivo</div></div>
                <div style={{fontSize:11,color:D.textFaint,marginBottom:12}}>Ordenados por potencial para nivel {nivelSel} con este producto</div>
                {tiposAjustados(nivelSel||analisis.nivel_recomendado).map((t,idx)=>{
                  const TIPO_DEF = {
                    'Emocional': {accent:'#c43a7a', icon:'♥'},
                    'Funcional': {accent:'#3a8cc4', icon:'⚙'},
                    'Educativo': {accent:'#8a5cd0', icon:'◆'},
                    'Racional':     {accent:'#3aa87e', icon:'▤'},
                    'Aspiracional': {accent:'#c4a83a', icon:'🌟'},
                  }
                  const def = TIPO_DEF[t.tipo] || TIPO_DEF['Emocional']
                  const isSel=tipo===t.tipo
                  const isTop=idx===0
                  return(
                    <div key={t.tipo} onClick={()=>setTipo(t.tipo)}
                      style={{
                        padding:'12px 14px',
                        border:`1px solid ${isSel?def.accent:D.cardBorder}`,
                        borderLeft:`3px solid ${def.accent}`,
                        borderRadius:8,
                        background:isSel?D.blueDark:D.input,
                        cursor:'pointer',
                        marginBottom:7,
                        transition:'all .15s'
                      }}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <span style={{fontSize:13,color:def.accent,opacity:.85}}>{def.icon}</span>
                        <span style={{fontSize:13,fontWeight:600,color:D.text}}>{t.tipo}</span>
                        <div style={{flex:1,height:3,background:D.cardBorder,borderRadius:2,maxWidth:100}}>
                          <div style={{height:3,borderRadius:2,background:def.accent,width:`${t.score}%`,transition:'width .4s'}}/>
                        </div>
                        <span style={{fontSize:10,fontWeight:600,color:def.accent,minWidth:28,textAlign:'right'}}>{t.score}%</span>
                        {isTop&&<span style={{fontSize:9,fontWeight:600,color:def.accent,letterSpacing:'.05em',textTransform:'uppercase'}}>· Mejor</span>}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        <div style={{fontSize:11,color:D.green}}>✓ {t.porque_convierte}</div>
                        <div style={{fontSize:11,color:D.textFaint}}>✗ {t.porque_no}</div>
                      </div>
                    </div>
                  )
                })}

                {/* ── Panel doctrina del motivo seleccionado (colapsable) ── */}
                {tipo && DOCTRINA_MOTIVOS[tipo] && (
                  <PanelDoctrina
                    open={openPanelMotivo}
                    setOpen={setOpenPanelMotivo}
                    titulo={`Motivo ${tipo} — Lineamientos`}
                    color={DOCTRINA_MOTIVOS[tipo].color}
                  >
                    <DLine label="Emoción dominante" value={DOCTRINA_MOTIVOS[tipo].emocion} />
                    <DLine label="Enfoque" value={DOCTRINA_MOTIVOS[tipo].enfoque} />
                    <DLine label="Estructura" value={DOCTRINA_MOTIVOS[tipo].estructura} />
                    <DLine label="Pieza ideal" value={DOCTRINA_MOTIVOS[tipo].pieza} />
                    <DLine label="Palabras clave" value={DOCTRINA_MOTIVOS[tipo].palabras} />
                  </PanelDoctrina>
                )}

                <div style={{borderTop:`1px solid ${D.cardBorder}`,margin:'14px 0'}}/>
                <div style={fldLbl}>Ángulo de venta</div>
                <div style={{fontSize:11,color:D.textFaint,marginBottom:10}}>Ordenados por relevancia. Click en cualquiera para ver definición. El recomendado está marcado.</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                  {(()=>{
                    // Familias visuales por intención psicológica
                    const ANGULO_META = {
                      'Problema/Dolor':       {fam:'dolor',     icon:'🔥', def:'Empieza activando el problema concreto del avatar. Muestra el dolor reconocible antes de cualquier solución.'},
                      'Enemigo en Común':     {fam:'dolor',     icon:'⚔️', def:'Identifica un villano externo (industria, mito, marca implícita) contra el que el producto pelea junto al avatar.'},
                      'Ironía/Provocación':   {fam:'dolor',     icon:'😏', def:'Tono irreverente o sarcástico. Cuestiona algo obvio, rompe la cuarta pared. Memorable por descarado.'},
                      'Beneficio/Resultado':  {fam:'deseo',     icon:'✨', def:'Empieza mostrando el resultado final ya logrado. Lo que el avatar va a tener/sentir/lograr es el centro.'},
                      'Aspiracional':         {fam:'deseo',     icon:'🌟', def:'Apela al ideal, deseo de convertirse en mejor versión. Conecta producto con estilo de vida o identidad.'},
                      'Transformación':       {fam:'deseo',     icon:'🦋', def:'Cambio del avatar de antes a ahora. El producto es el catalizador del cambio personal.'},
                      'Urgencia/Escasez':     {fam:'urgencia',  icon:'⏰', def:'El motor es el tiempo o disponibilidad limitada. "Antes que se acabe", "solo por hoy", "últimas unidades".'},
                      'FOMO':                 {fam:'urgencia',  icon:'👀', def:'Ya hay gente que lo tiene/usa. Quien no actúa se queda fuera. "Mientras tú lees esto otros ya están..."'},
                      'Exclusividad':         {fam:'urgencia',  icon:'🔐', def:'No es para todos. Selectivo, especial, para quienes saben/merecen. Apela al estatus o pertenencia.'},
                      'Autoridad/Prueba Social':{fam:'prueba',  icon:'🛡️', def:'Apóyate en evidencia externa: número de clientes, recomendado por X, testimonios reales, datos verificables.'},
                      'Comparación/Contraste':{fam:'prueba',    icon:'⚖️', def:'Confronta dos opciones: producto vs lo tradicional, antes vs ahora, ellos vs nosotros. El producto siempre gana.'},
                      'Precio/Valor':         {fam:'prueba',    icon:'💰', def:'Centro en relación valor/precio. "Por menos de X", "una compra que reemplaza Y". Justifica económicamente.'},
                      'Curiosidad':           {fam:'curiosidad',icon:'🧐', def:'Abre con dato/pregunta que genere "necesito saber más". Mantén misterio durante el desarrollo y resuélvelo al final.'},
                      'Novedad':              {fam:'curiosidad',icon:'🆕', def:'Posiciona como algo nuevo, recién llegado, descubrimiento reciente. "Acaba de salir", "lo último en", "la nueva forma de".'},
                      'Historia':             {fam:'curiosidad',icon:'📖', def:'Narrativa de personaje (real o representativo) con transformación. Estructura: situación, conflicto, descubrimiento, resolución.'},
                      'Simplicidad':          {fam:'curiosidad',icon:'🎯', def:'El ángulo es la facilidad. "Solo 3 pasos", "tan simple como", "sin complicaciones". El producto resuelve sin esfuerzo.'},
                    }
                    const FAM_ACCENTS = {
                      dolor:      '#c45a5a',
                      deseo:      '#c4a83a',
                      urgencia:   '#c47a3a',
                      prueba:     '#3a8cc4',
                      curiosidad: '#8a5cd0',
                    }
                    const angulos = Object.keys(ANGULO_META)
                    const recomendados = analisis?.angulos_recomendados?.map(a=>a.angulo) || []
                    const recomendado = recomendados[0] || null
                    const ordenados = [...angulos].sort((a,b)=>{
                      const ia = recomendados.indexOf(a), ib = recomendados.indexOf(b)
                      if(ia===-1&&ib===-1) return 0
                      if(ia===-1) return 1
                      if(ib===-1) return -1
                      return ia-ib
                    })
                    return ordenados.map(ang=>{
                      const meta = ANGULO_META[ang]
                      const accent = FAM_ACCENTS[meta.fam]
                      const isRec = ang===recomendado
                      const isSel = anguloSel===ang
                      const score = analisis?.angulos_recomendados?.find(a=>a.angulo===ang)?.score
                      return(
                        <button key={ang}
                          onClick={()=>setAnguloSel(isSel?null:ang)}
                          title={meta.def}
                          style={{
                            fontSize:11,
                            padding:'6px 12px 6px 10px',
                            borderRadius:20,
                            border:`1px solid ${isSel?accent:D.cardBorder}`,
                            background:isSel?D.blueDark:D.input,
                            color:D.text,
                            cursor:'pointer',
                            fontFamily:'inherit',
                            fontWeight:isSel?600:500,
                            display:'inline-flex',
                            alignItems:'center',
                            gap:6,
                            transition:'all .15s'
                          }}>
                          <span style={{fontSize:11,color:accent,opacity:.85}}>{meta.icon}</span>
                          <span>{ang}</span>
                          {isRec&&<span style={{fontSize:9,color:accent,opacity:.7}}>★</span>}
                          {score&&<span style={{fontSize:9,color:D.textDim,marginLeft:2}}>{score}</span>}
                        </button>
                      )
                    })
                  })()}
                </div>

                {/* ── Panel doctrina del ángulo seleccionado (colapsable) ── */}
                {anguloSel && DOCTRINA_ANGULOS[anguloSel] && (
                  <PanelDoctrina
                    open={openPanelAngulo}
                    setOpen={setOpenPanelAngulo}
                    titulo={`Ángulo ${anguloSel} — Lineamientos`}
                    color={D.blue}
                  >
                    <DLine label="Qué hace" value={DOCTRINA_ANGULOS[anguloSel].que} />
                    <DLine label="Estructura" value={DOCTRINA_ANGULOS[anguloSel].estructura} />
                    <DLine label="Tono" value={DOCTRINA_ANGULOS[anguloSel].tono} />
                    <DLine label="Ejemplo" value={`"${DOCTRINA_ANGULOS[anguloSel].ejemplo}"`} />
                  </PanelDoctrina>
                )}

                <div style={{borderTop:`1px solid ${D.cardBorder}`,margin:'14px 0'}}/>
                <div style={fldLbl}>Formato</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                  {[['video','Video'],['imagen','Ideas de imagen']].map(([v,l])=>(
                    <button key={v} onClick={()=>{setFormato(v);setUltimoCosto(null)}} style={chipBtn(formato===v)}>{l}</button>
                  ))}
                </div>

                {formato==='imagen'&&(
                  <>
                    <div style={fldLbl}>Tipo de imagen</div>
                    <div style={{fontSize:11,color:D.textFaint,marginBottom:8}}>Cada tipo te entrega una idea con instrucciones específicas para diseño. Click para ver qué hace.</div>
                    {(()=>{
                      // Familias de imágenes por intención
                      const TIPO_META = {
                        'Funcional':            {fam:'producto',  icon:'📸', desc:'Producto en acción real. Escena cinematográfica concreta: persona+momento+plano+luz.', cuando:'Cuando el producto se entiende mejor viéndolo en uso.'},
                        'Collage':              {fam:'producto',  icon:'🧩', desc:'3-4 piezas combinadas en una composición. Cada zona cuenta una parte de la historia.', cuando:'Cuando una sola escena no alcanza para mostrar todo lo relevante.'},
                        'Antes y Después':      {fam:'transform', icon:'🔀', desc:'Contraste visual: el problema en la mitad izquierda, el resultado en la derecha. Tonos fríos vs cálidos.', cuando:'Cuando el cambio que produce el producto es visible y obvio.'},
                        'Infográfico':          {fam:'educa',     icon:'📊', desc:'Información organizada con jerarquía visual. Dato central arriba + 3-4 puntos con iconos.', cuando:'Cuando hay datos, ciencia o explicación que convencen mejor que una imagen.'},
                        'Beneficios':           {fam:'educa',     icon:'✅', desc:'Lista visual de 3-5 beneficios concretos del producto. Iconos + texto, producto al lado o integrado.', cuando:'Cuando el avatar ya conoce el problema y necesita ver qué gana.'},
                        'Respuesta a Comentario':{fam:'social',   icon:'💬', desc:'Captura de un comentario orgánico de usuario en redes. UN solo comentario, sin respuesta de marca.', cuando:'Para tráfico frío que confía más en otro usuario que en la marca.'},
                        'Testimonial':          {fam:'social',    icon:'⭐', desc:'Foto de persona real con cita, nombre, ciudad y 5 estrellas. Estilo cálido, no de catálogo.', cuando:'Para añadir credibilidad humana al ad. Excelente con productos de salud o belleza.'},
                      }
                      const FAM_ACCENTS = {
                        producto:  '#3a8cc4',
                        transform: '#c47a3a',
                        educa:     '#8a5cd0',
                        social:    '#3aa87e',
                      }
                      return (
                        <>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                            {Object.keys(TIPO_META).map(f=>{
                              const meta = TIPO_META[f]
                              const accent = FAM_ACCENTS[meta.fam]
                              const isSel = formatoImagen===f
                              return (
                                <button key={f} onClick={()=>setFormatoImagen(f)} title={meta.desc}
                                  style={{
                                    fontSize:11,
                                    padding:'6px 12px 6px 10px',
                                    borderRadius:20,
                                    border:`1px solid ${isSel?accent:D.cardBorder}`,
                                    background:isSel?D.blueDark:D.input,
                                    color:D.text,
                                    cursor:'pointer',
                                    fontFamily:'inherit',
                                    fontWeight:isSel?600:500,
                                    display:'inline-flex',
                                    alignItems:'center',
                                    gap:6,
                                    transition:'all .15s'
                                  }}>
                                  <span style={{fontSize:11,color:accent,opacity:.85}}>{meta.icon}</span>
                                  <span>{f}</span>
                                </button>
                              )
                            })}
                          </div>
                          {formatoImagen && TIPO_META[formatoImagen] && (() => {
                            const meta = TIPO_META[formatoImagen]
                            const accent = FAM_ACCENTS[meta.fam]
                            return (
                              <div style={{
                                marginBottom:14,
                                padding:'12px 14px',
                                background:D.input,
                                border:`1px solid ${D.cardBorder}`,
                                borderLeft:`3px solid ${accent}`,
                                borderRadius:8,
                              }}>
                                <div style={{fontSize:10,color:D.textDim,fontWeight:600,marginBottom:6,letterSpacing:'.05em',textTransform:'uppercase'}}>
                                  Qué hace este tipo
                                </div>
                                <div style={{fontSize:12,color:D.text,lineHeight:1.5,marginBottom:8}}>
                                  {meta.desc}
                                </div>
                                <div style={{fontSize:11,color:D.textMid,lineHeight:1.5,paddingTop:8,borderTop:`1px solid ${D.cardBorder}`}}>
                                  <span style={{color:accent,fontWeight:600}}>Cuándo usarlo:</span> {meta.cuando}
                                </div>
                              </div>
                            )
                          })()}
                        </>
                      )
                    })()}

                    {/* ── Panel doctrina del tipo de imagen seleccionado (colapsable) ── */}
                    {formato==='imagen' && formatoImagen && DOCTRINA_TIPOS_IMAGEN[formatoImagen] && (
                      <PanelDoctrina
                        open={openPanelTipoImagen}
                        setOpen={setOpenPanelTipoImagen}
                        titulo={`Tipo ${formatoImagen} — Lineamientos`}
                        color={DOCTRINA_TIPOS_IMAGEN[formatoImagen].color}
                      >
                        <DLine label="Esencia" value={DOCTRINA_TIPOS_IMAGEN[formatoImagen].esencia} />
                        <DLine label="Composición visual" value={DOCTRINA_TIPOS_IMAGEN[formatoImagen].composicion} />
                        <DLine label="Evitar (anti-cruce)" value={DOCTRINA_TIPOS_IMAGEN[formatoImagen].evitar} />
                      </PanelDoctrina>
                    )}
                  </>
                )}

                {formato==='video'&&(
                  <>
                    <div style={fldLbl}>Duración</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                      {['10','20','30','40','50','60'].map(s=>(
                        <button key={s} onClick={()=>setDuracion(s)} style={{...chipBtn(duracion===s),minWidth:50,textAlign:'center'}}>{s}s</button>
                      ))}
                    </div>
                  </>
                )}

                {(() => {
                  const tieneAvatar = avatarManual.trim() || (avatarSel !== null && analisis?.avatares?.[avatarSel])
                  const tieneAngulo = !!anguloSel
                  const tieneNivel = !!nivelSel || nivelSel===0
                  const tieneTipo = !!tipo
                  const faltantes = []
                  if (!tieneNivel) faltantes.push('Nivel')
                  if (!tieneTipo) faltantes.push('Motivo')
                  if (!tieneAvatar) faltantes.push('Avatar')
                  if (!tieneAngulo) faltantes.push('Ángulo')
                  const ok = faltantes.length === 0
                  return (
                    <button onClick={()=>generar(false)} disabled={!ok||generando} style={{...btnMain,marginTop:0,opacity:(!ok||generando)?.4:1}}>
                      {generando
                        ?formato==='imagen'?'Generando 2 ideas...':'Generando 2 versiones...'
                        :ok
                          ?formato==='imagen'?'Generar 2 ideas de imagen':`Generar 2 versiones (${duracion}s)`
                          :`Falta seleccionar: ${faltantes.join(', ')}`}
                    </button>
                  )
                })()}
              </div>
            </>
          )}

          {/* ── RESULTADO ── */}
          {versiones.length>0&&(
            <div id="resultado-section" style={crd}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                  <span style={{fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:D.blueDark,color:D.blue,border:`1px solid ${D.blueDim}`}}>{tipo}</span>
                  <span style={{fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:D.greenBg,color:'#059669',border:`1px solid ${D.greenBorder}`}}>
                    {formato==='imagen'?'Imagen estática':`Video ${duracion}s`}
                  </span>
                  <span style={{fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:D.accent,color:D.textMid,border:`1px solid ${D.cardBorder}`}}>{pais} · Nivel {nivelSel||analisis?.nivel_recomendado}</span>
                  <span style={{fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:modeloSel.startsWith('claude')?'#ecfdf5':'#1a1000',color:modeloSel.startsWith('claude')?'#059669':'#92400e',border:`1px solid ${modeloSel.startsWith('claude')?'#a7f3d0':'#fde68a'}`}}>
                    {modeloSel==='gpt-4.1-mini'?'GPT 4.1 Mini':modeloSel==='gpt-4o-mini'?'GPT 4o Mini':modeloSel==='gpt-4o'?'GPT-4o':modeloSel.includes('sonnet')?'Claude Sonnet':'Claude Haiku'}
                  </span>
                  {historial.length>0&&<span style={{fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:'#fef3c7',color:'#ba7517',border:'1px solid #fde68a'}}>{historial.length} corrección{historial.length>1?'es':''}</span>}
                  <InfoBtn prompt={promptGen} label={`Generación ${tipo}`}/>
                </div>
              </div>

              {ultimoCosto && (
                <div style={{background:D.accent,border:'1px solid '+D.cardBorder,borderRadius:8,padding:'8px 12px',fontSize:12,color:D.textMid,display:'flex',alignItems:'center',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                  <span>Última operación:</span>
                  <span><strong>{ultimoCosto.totales.inputTokens.toLocaleString()}</strong> in + <strong>{ultimoCosto.totales.outputTokens.toLocaleString()}</strong> out tokens</span>
                  <span>≈ <strong>${ultimoCosto.totales.usd.toFixed(4)}</strong> USD</span>
                  <span>(<strong>${ultimoCosto.totales.cop.toFixed(0)}</strong> COP)</span>
                  <span style={{marginLeft:'auto',color:D.textDim}}>Sesión: ${costoSesion.usd.toFixed(4)} USD · {costoSesion.operaciones} ops</span>
                </div>
              )}

              {formato==='imagen'?(
                <>
                  <div style={{display:'flex',gap:8,marginBottom:16}}>
                    {versiones.map((v,i)=>(
                      <button key={i} onClick={()=>setVersionActiva(i)}
                        style={{flex:1,padding:'10px 8px',borderRadius:9,border:`1px solid ${versionActiva===i?D.blue:D.cardBorder}`,background:versionActiva===i?D.blueDark:D.input,cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                        <div style={{fontSize:10,fontWeight:600,color:versionActiva===i?D.blue:D.textDim,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:3}}>Idea {i+1}</div>
                        <div style={{fontSize:11,color:versionActiva===i?D.blueLight:D.textFaint,lineHeight:1.3}}>{v.hook}</div>
                      </button>
                    ))}
                  </div>
                  {renderContenido(versiones[versionActiva],formato)}

                  {/* Botón auditar + cuadro de auditoría — VIDEO */}
                  <div style={{marginTop:14, paddingTop:14, borderTop:`1px solid ${D.cardBorder}`}}>
                    {!auditorias[versionActiva] && (
                      <button onClick={()=>auditarVersion(versionActiva,'video')} disabled={auditando===String(versionActiva)}
                        style={{fontSize:11, padding:'7px 14px', background:D.accent, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontWeight:600, opacity:auditando===String(versionActiva)?.5:1}}>
                        {auditando===String(versionActiva)?'🔍 Auditando...':'🔍 Auditar este guion'}
                      </button>
                    )}
                    {auditorias[versionActiva] && (
                      <div style={{background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:'14px 16px', marginTop:6}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                          <div style={{fontSize:11, color:D.text, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase'}}>
                            🔍 Auditoría · Versión {versionActiva+1}
                          </div>
                          <button onClick={()=>setAuditorias(a=>{const n={...a};delete n[versionActiva];return n})}
                            style={{fontSize:10, color:D.textDim, background:'transparent', border:'none', cursor:'pointer'}}>
                            ✕ cerrar
                          </button>
                        </div>
                        <div style={{margin:0, padding:'10px 12px', background:D.accent, borderRadius:6, fontFamily:'inherit'}}>
                          {renderAuditoria(auditorias[versionActiva])}
                        </div>
                        <div style={{marginTop:10, display:'flex', gap:6}}>
                          <button onClick={()=>auditarVersion(versionActiva,'video')} disabled={auditando===String(versionActiva)}
                            style={{fontSize:10, color:D.textMid, background:'transparent', border:`1px solid ${D.cardBorder}`, borderRadius:5, padding:'4px 9px', cursor:'pointer'}}>
                            ⟳ Re-auditar
                          </button>
                          <button onClick={()=>copiarAlPortapapeles(auditorias[versionActiva], 'audit_'+versionActiva)}
                            style={{fontSize:10, color:copiadoKey==='audit_'+versionActiva?D.green:D.textDim, background:'transparent', border:`1px solid ${copiadoKey==='audit_'+versionActiva?D.green:D.cardBorder}`, borderRadius:5, padding:'4px 9px', cursor:'pointer'}}>
                            {copiadoKey==='audit_'+versionActiva?'✓ Copiado':'📋 Copiar auditoría'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {versiones.map((v,i)=>(
                    <div key={i} style={{border:`1px solid ${D.cardBorder}`,borderRadius:10,background:D.card,padding:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,gap:10}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10,flex:1,minWidth:0}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:D.blue,color:'#ffffff',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <span style={{fontSize:9,fontWeight:700,color:D.textDim,letterSpacing:'.1em',textTransform:'uppercase'}}>Versión {i+1}</span>
                            <div style={{fontSize:13,fontWeight:600,color:D.blue,marginTop:3,lineHeight:1.4}}>{v.hook}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:6,flexShrink:0}}>
                          <button onClick={()=>copiarAlPortapapeles(textoCompletoVersion(v), 'version_'+i)} style={{fontSize:11,color:copiadoKey==='version_'+i?D.green:D.blueLight,border:`1px solid ${copiadoKey==='version_'+i?D.green:D.blue}`,background:'transparent',borderRadius:7,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}>{copiadoKey==='version_'+i?'✓ Copiado':'Copiar'}</button>
                          <button onClick={()=>{setVersionActiva(i);setTimeout(generarVariaciones,50)}} disabled={generandoVariaciones} style={{fontSize:11,color:D.green,border:`1px solid ${D.greenBorder}`,background:D.greenBg,borderRadius:7,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit',opacity:generandoVariaciones?.5:1}}>⟳ Variaciones</button>
                        </div>
                      </div>
                      <div style={{fontSize:14,color:D.text,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{(()=>{
                        const raw=v.guionNeto||v.guionVisual||v.guionCompleto||''
                        if(v.guionNeto) return v.guionNeto
                        // Limpiar indicaciones de producción
                        return raw
                          .replace(/ESCENA\s+\d+[^\n]*/gi,'')
                          .replace(/Narración:\s*/gi,'')
                          .replace(/Producción:[^\n]*/gi,'')
                          .replace(/---[^\n]*/g,'')
                          .replace(/VERSIÓN\s*\d+[^\n]*/gi,'')
                          .replace(/\n{2,}/g,'\n')
                          .trim()
                      })()}</div>

                      {/* Auditar idea de imagen */}
                      <div style={{marginTop:12, paddingTop:10, borderTop:`1px solid ${D.cardBorder}`}}>
                        {!auditorias['imagen_'+i] && (
                          <button onClick={()=>auditarVersion(i,'imagen')} disabled={auditando==='imagen_'+i}
                            style={{fontSize:11, padding:'6px 12px', background:D.accent, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontWeight:600, opacity:auditando==='imagen_'+i?.5:1}}>
                            {auditando==='imagen_'+i?'🔍 Auditando...':'🔍 Auditar esta idea'}
                          </button>
                        )}
                        {auditorias['imagen_'+i] && (
                          <div style={{background:D.card, border:`1px solid ${D.cardBorder}`, borderRadius:8, padding:'12px 14px', marginTop:6}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                              <div style={{fontSize:11, color:D.text, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase'}}>
                                🔍 Auditoría · Idea {i+1}
                              </div>
                              <button onClick={()=>setAuditorias(a=>{const n={...a};delete n['imagen_'+i];return n})}
                                style={{fontSize:10, color:D.textDim, background:'transparent', border:'none', cursor:'pointer'}}>
                                ✕
                              </button>
                            </div>
                            <div style={{margin:0, padding:'10px 12px', background:D.accent, borderRadius:6, fontFamily:'inherit'}}>
                              {renderAuditoria(auditorias['imagen_'+i])}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}



              {historial.length>0&&(
                <div style={{padding:'8px 10px',background:D.accent,borderRadius:7,margin:'12px 0'}}>
                  <div style={{fontSize:10,color:D.textFaint,marginBottom:4,letterSpacing:'.06em',textTransform:'uppercase'}}>Correcciones aplicadas</div>
                  {historial.map((c,i)=><div key={i} style={{fontSize:11,color:D.textDim,padding:'2px 0'}}>{i+1}. {c}</div>)}
                </div>
              )}

              <div style={{border:`1px solid ${D.cardBorder}`,borderRadius:10,padding:14,background:D.accent,marginTop:12}}>
                <div style={{fontSize:10,color:D.textDim,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:6,fontWeight:500}}>Corrección o ajuste</div>
                <textarea value={correccion} onChange={e=>setCorreccion(e.target.value)} rows={2}
                  placeholder={formato==='imagen'?'Ej: más dramático · fondo diferente · otro ángulo...':'Ej: ganchos más directos · más corto · tono más coloquial...'}
                  style={{...inp,marginBottom:0}}/>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <button onClick={()=>generar(false)} disabled={generando} style={{flex:1,padding:10,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:8,background:'transparent',color:D.textDim,cursor:'pointer',fontFamily:'inherit'}}>
                    {generando?'...':'Regenerar'}
                  </button>
                  <button onClick={()=>generar(true)} disabled={generando||!correccion.trim()} style={{flex:2,padding:10,fontSize:12,fontWeight:600,border:`1px solid ${D.blue}60`,borderRadius:8,background:D.blueDark,color:D.blue,cursor:'pointer',fontFamily:'inherit',opacity:(!correccion.trim()||generando)?.4:1}}>
                    {generando?'Aplicando...':'Aplicar corrección y regenerar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {variaciones.length>0&&(
            <div id="variaciones-section" style={{background:D.greenBg,border:`1px solid ${D.greenBorder}`,borderRadius:14,padding:'18px 20px',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                <div style={{width:24,height:24,borderRadius:'50%',border:`1px solid ${D.green}`,background:D.card,color:D.green,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>⟳</div>
                <div style={{fontSize:12,fontWeight:500,color:D.textMid,letterSpacing:'.06em',textTransform:'uppercase'}}>Variaciones del guión seleccionado</div>
                <button onClick={()=>setVariaciones([])} style={{marginLeft:'auto',fontSize:10,color:D.textDim,border:`1px solid ${D.cardBorder}`,background:'transparent',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontFamily:'inherit'}}>✕ cerrar</button>
              </div>
              <div style={{display:'flex',gap:8,marginBottom:16}}>
                {variaciones.map((v,i)=>(
                  <button key={i} onClick={()=>setVariacionActiva(i)}
                    style={{flex:1,padding:'10px 8px',borderRadius:9,border:`1px solid ${variacionActiva===i?D.green:D.greenBorder}`,background:variacionActiva===i?D.card:D.input,cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                    <div style={{fontSize:10,fontWeight:600,color:variacionActiva===i?D.green:D.textDim,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:3}}>Variación {i+1}</div>
                    <div style={{fontSize:11,color:variacionActiva===i?D.text:D.textMid,lineHeight:1.3}}>{v.hook}</div>
                  </button>
                ))}
              </div>
              {renderContenido(variaciones[variacionActiva],'video')}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
