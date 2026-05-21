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

const USUARIOS_PERMITIDOS = ['Santiago', 'Michelle', 'Andres', 'Mateo']
const PASSWORD_GRUPO = 'IdeoTeam'

const BADGES_METODO = {
  'crear':   { label: '🎬 Crear',         bg: '#dbeafe', color: '#1e40af' },
  'metodo1': { label: '🔍 Variar Hook',   bg: '#fef3c7', color: '#92400e' },
  'metodo2': { label: '🔗 Fusión',        bg: '#dcfce7', color: '#166534' },
  'metodo3': { label: '🔄 Reestructurar', bg: '#fce7f3', color: '#9f1239' }
}

// FIX 1 — Labels visuales de duración recalibrados +10s. El valor enviado al
// backend (state `duracion`) NO cambia; solo se desplaza lo que ve el usuario.
const DURACIONES_DISPONIBLES = [
  { valor: '10', label: '20s' },
  { valor: '20', label: '30s' },
  { valor: '30', label: '40s' },
  { valor: '40', label: '50s' },
  { valor: '50', label: '60s' },
  { valor: '60', label: '70s' }
]
const labelDuracion = (v) => {
  const d = DURACIONES_DISPONIBLES.find(x => String(x.valor) === String(v))
  return d ? d.label : `${v}s`
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

function VersionesExpandidas({ id, onCargar, D }) {
  const [cargando, setCargando] = useState(true)
  const [versiones, setVersiones] = useState([])
  const [error, setError] = useState(null)
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        const r = await fetch('/api/historial/' + id)
        const d = await r.json()
        if (cancelado) return
        if (!r.ok || d.error) throw new Error(d.error || 'No se pudo cargar')
        setVersiones(Array.isArray(d.versiones) ? d.versiones : [])
      } catch (e) {
        if (!cancelado) setError(e.message)
      } finally {
        if (!cancelado) setCargando(false)
      }
    })()
    return () => { cancelado = true }
  }, [id])
  if (cargando) return <div style={{padding:'8px 14px 12px 40px',fontSize:11,color:D.textDim}}>Cargando versiones…</div>
  if (error) return <div style={{padding:'8px 14px 12px 40px',fontSize:11,color:'#dc2626'}}>Error: {error}</div>
  if (versiones.length === 0) return <div style={{padding:'8px 14px 12px 40px',fontSize:11,color:D.textFaint,fontStyle:'italic'}}>Sin versiones aún.</div>
  return (
    <div style={{padding:'4px 14px 12px 40px',background:D.bg,display:'flex',flexDirection:'column',gap:4}}>
      {versiones.map(v => (
        <div key={v.id} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',background:'#fff',border:`1px solid ${D.cardBorder}`,borderRadius:6}}>
          <div style={{flex:1,minWidth:0,fontSize:11,color:D.textMid,display:'flex',gap:8,flexWrap:'wrap'}}>
            <span style={{fontWeight:600,color:D.text,textTransform:'uppercase',letterSpacing:'.05em',fontSize:10}}>{v.tipo}</span>
            <span>·</span>
            <span>{new Date(v.creado_en).toLocaleString('es-CO',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
            {v.modelo && <><span>·</span><span style={{color:D.textDim}}>{v.modelo}</span></>}
            <span>·</span>
            <span>${Number(v.costo_usd||0).toFixed(4)} USD</span>
          </div>
          <button onClick={() => onCargar(id, v.id)}
            style={{fontSize:10,padding:'3px 10px',background:'transparent',color:D.blueLight,border:`1px solid ${D.blue}`,borderRadius:4,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
            Cargar
          </button>
        </div>
      ))}
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
  const [costoAnuncio,setCostoAnuncio]=useState({usd:0,cop:0,operaciones:0})
  const [nombreAutor,setNombreAutor]=useState('')
  // ── Login compartido ───────────────────────────────────────────
  const [autenticado,setAutenticado]=useState(false)
  const [loginNombre,setLoginNombre]=useState('')
  const [loginPassword,setLoginPassword]=useState('')
  const [loginError,setLoginError]=useState('')
  const [mostrarHistorial,setMostrarHistorial]=useState(false)
  const [historialItems,setHistorialItems]=useState([])
  const [historialCargando,setHistorialCargando]=useState(false)
  const [busquedaHist,setBusquedaHist]=useState('')
  const [anuncioIdActual,setAnuncioIdActual]=useState(null)
  const [bannerSesion,setBannerSesion]=useState(null) // {id} si se recuperó sesión
  const [historialExpandido,setHistorialExpandido]=useState({}) // {id:true}
  const [variaciones,setVariaciones]=useState([])
  const [variacionActiva,setVariacionActiva]=useState(0)
  // ── NUEVO: selector de API ──────────────────────────────────────
  const [modeloSel,setModeloSel]=useState('claude-haiku-4-5')
  const [formatoImagen,setFormatoImagen]=useState('Funcional')
  const [ctxFromAdvertorial,setCtxFromAdvertorial]=useState(null)
  const [verCtxAdv,setVerCtxAdv]=useState(false)
  const [auditorias,setAuditorias]=useState({}) // {0: textoAuditoria, 1: ..., 2: ...} (video) o {imagen_0: ..., imagen_1: ...}
  const [auditando,setAuditando]=useState(null) // índice que se está auditando
  // ── NUEVO: sistema de tabs + Método 1 (Variar Hook) ────────────
  const [modo,setModo]=useState('crear') // 'crear' | 'metodo1' | 'metodo2' | 'metodo3'
  const [m1Cargando,setM1Cargando]=useState(false)
  const [m1Paso,setM1Paso]=useState(1) // 1=input guion, 2=editar análisis, 3=output hooks
  const [guionInput,setGuionInput]=useState('')
  const [m1Contexto,setM1Contexto]=useState('')
  const [m1Analisis,setM1Analisis]=useState(null) // editable {avatar,producto,formato,...}
  const [m1HookOriginal,setM1HookOriginal]=useState('')
  const [m1Cuerpo,setM1Cuerpo]=useState('')
  const [m1Hooks,setM1Hooks]=useState([])
  const [m1Detalles,setM1Detalles]=useState(false) // collapse de detalles del análisis
  // ── Método 2 — Fusión Hook + Cuerpo ────────────────────────────
  const [m2Cargando,setM2Cargando]=useState(false)
  const [m2Paso,setM2Paso]=useState(1) // 1=input, 2=revisar, 3=resultado
  const [m2TextoHook,setM2TextoHook]=useState('')
  const [m2TextoCuerpo,setM2TextoCuerpo]=useState('')
  const [m2Contexto,setM2Contexto]=useState('')
  const [m2HookExtraido,setM2HookExtraido]=useState('')
  const [m2CuerpoExtraido,setM2CuerpoExtraido]=useState('')
  const [m2HookDescartado,setM2HookDescartado]=useState('')
  const [m2AnalisisHook,setM2AnalisisHook]=useState(null)
  const [m2AnalisisCuerpo,setM2AnalisisCuerpo]=useState(null)
  const [m2Compatibilidad,setM2Compatibilidad]=useState(null)
  const [m2GuionFusionado,setM2GuionFusionado]=useState('')
  const [m2TransicionAgregada,setM2TransicionAgregada]=useState('')
  const [m2Notas,setM2Notas]=useState('')
  const [m2Detalles,setM2Detalles]=useState(false) // collapse de detalles
  // ── Método 3 — Reestructurar ───────────────────────────────────
  const [m3Cargando,setM3Cargando]=useState(false)
  const [m3Paso,setM3Paso]=useState(1) // 1=input, 2=revisar, 3=resultado
  const [m3GuionInput,setM3GuionInput]=useState('')
  const [m3Contexto,setM3Contexto]=useState('')
  const [m3Analisis,setM3Analisis]=useState(null)
  const [m3Estructura,setM3Estructura]=useState([])
  const [m3PalabrasClave,setM3PalabrasClave]=useState([])
  const [m3PalabrasClaveTexto,setM3PalabrasClaveTexto]=useState('') // textarea editable como string
  const [m3Versiones,setM3Versiones]=useState([])
  const [m3Detalles,setM3Detalles]=useState(false)
  const [m3VerOriginal,setM3VerOriginal]=useState(false)
  const [m3VerEstructura,setM3VerEstructura]=useState(false) // FIX 4 — estructura plegada por defecto
  const [m3VerDetalleVersion,setM3VerDetalleVersion]=useState({}) // {0:true,1:true}

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

  // Hidrata nombreAutor + sesión de login desde localStorage (SSR-safe)
  useEffect(()=>{
    try {
      const storedAutor = localStorage.getItem('autor')
      const storedAuth = localStorage.getItem('autenticado')
      if (storedAutor && USUARIOS_PERMITIDOS.includes(storedAutor) && storedAuth === 'true') {
        setNombreAutor(storedAutor)
        setAutenticado(true)
      } else if (storedAutor) {
        setNombreAutor(storedAutor)
      }
    } catch {}
  },[])

  // Recuperación de sesión: si hay anuncioIdActual en localStorage, carga la última versión
  useEffect(()=>{
    let cancelado = false
    ;(async ()=>{
      try {
        const raw = localStorage.getItem('anuncioIdActual')
        const idGuardado = raw ? parseInt(raw, 10) : NaN
        if (!idGuardado || isNaN(idGuardado)) return
        const r = await fetch('/api/historial/' + idGuardado)
        if (!r.ok) { try { localStorage.removeItem('anuncioIdActual') } catch {}; return }
        const d = await r.json()
        if (cancelado) return
        if (d?.error || !Array.isArray(d?.versiones) || d.versiones.length===0) return
        restaurarDesdeVersion(d, d.versiones[0])
        setAnuncioIdActual(idGuardado)
        setBannerSesion({ id: idGuardado })
      } catch (e) {
        console.error('Recuperación de sesión falló:', e)
      }
    })()
    return ()=>{ cancelado = true }
  },[])

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

  async function api(messages,modo,extra) {
    if (!(nombreAutor || '').trim()) { alert('Escribe tu nombre antes de continuar'); return }
    if(modo==='analizar') setCostoAnuncio({usd:0,cop:0,operaciones:0})
    const r=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages,modo,apiProvider:modeloSel.startsWith('claude')?'claude':'openai',modelo:modeloSel,...(extra||{})})   // <-- pasa el provider + campos extra (ej: formato)
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
      setCostoAnuncio(prev=>({
        usd: prev.usd + d.costoOperacion.totales.usd,
        cop: prev.cop + d.costoOperacion.totales.cop,
        operaciones: prev.operaciones + 1
      }))
    }
    return d
  }

  // ── Historial compartido (SQLite) ─────────────────────────────
  function avatarTextoActual() {
    if (avatarManual.trim()) return avatarManual.trim()
    if (avatarSel !== null && analisis?.avatares?.[avatarSel]) {
      const a = analisis.avatares[avatarSel]
      return (a.nombre || '') + (a.dolor_principal ? ' — ' + a.dolor_principal : '')
    }
    return ''
  }

  function briefingActual(extra={}) {
    const nv = nivelSel ?? analisis?.nivel_recomendado ?? ''
    return {
      autor: nombreAutor.trim() || 'Anónimo',
      producto: (nombre || prod || '').toString().slice(0,200),
      avatar: avatarTextoActual().slice(0,300),
      formato,
      duracion: formato==='video' ? String(duracion||'') : '',
      tipoImagen: formato==='imagen' ? (formatoImagen||'') : '',
      nivel: nv===null||nv===undefined ? '' : String(nv),
      motivo: tipo || '',
      angulo: anguloSel || '',
      modelo: modeloSel,
      briefingJson: {
        nombre, prod, url, pais, plat, formato, duracion, formatoImagen,
        nivelSel, tipo, avatarSel, avatarManual, anguloSel, modeloSel,
        ...extra
      }
    }
  }

  function snapshotState(over={}) {
    return {
      nombre, prod, url, pais, plat,
      formato, duracion, formatoImagen,
      nivelSel, tipo, avatarSel, avatarManual, anguloSel,
      modeloSel, analisis,
      versiones, versionActiva, variaciones, variacionActiva,
      historial, msgs, auditorias,
      promptGen, promptAnalisis,
      hooksUsadosImg,
      ...over
    }
  }

  async function crearAnuncioServer(briefingExtra={}) {
    try {
      const body = { briefing: briefingActual(briefingExtra), metodoPrincipal: 'crear' }
      const r = await fetch('/api/historial/anuncio', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error creando anuncio')
      return d.id
    } catch (e) {
      console.error('Auto-save (crear) falló:', e)
      return null
    }
  }

  async function actualizarBriefingServer(id, briefingExtra={}) {
    if (!id) return
    try {
      const body = { id, briefing: briefingActual(briefingExtra) }
      const r = await fetch('/api/historial/anuncio', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
      })
      if (!r.ok) {
        const d = await r.json().catch(()=>({}))
        console.error('Auto-save (briefing) falló:', d.error || r.statusText)
      }
    } catch (e) {
      console.error('Auto-save (briefing) falló:', e)
    }
  }

  async function guardarVersionServer(idAnuncio, modo, contenido, costoOp, modeloUsado) {
    if (!idAnuncio) return
    try {
      const body = {
        anuncioId: idAnuncio,
        tipo: modo,
        modelo: modeloUsado || modeloSel,
        costoUsd: costoOp?.totales?.usd || 0,
        costoCop: costoOp?.totales?.cop || 0,
        inputTokens: costoOp?.totales?.inputTokens || 0,
        outputTokens: costoOp?.totales?.outputTokens || 0,
        contenido
      }
      const r = await fetch('/api/historial/version', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
      })
      if (!r.ok) {
        const d = await r.json().catch(()=>({}))
        console.error('Auto-save (version) falló:', d.error || r.statusText)
      }
    } catch (e) {
      console.error('Auto-save (version) falló:', e)
    }
  }

  function restaurarDesdeVersion(anuncio, version) {
    const p = version?.contenido || {}
    if (p.nombre !== undefined) setNombre(p.nombre || '')
    if (p.prod !== undefined) setProd(p.prod || '')
    if (p.url !== undefined) setUrl(p.url || '')
    if (p.pais !== undefined) setPais(p.pais || 'Colombia')
    if (p.plat !== undefined) setPlat(p.plat || 'Meta Ads')
    if (p.formato !== undefined) setFormato(p.formato || 'video')
    if (p.duracion !== undefined) setDuracion(p.duracion || '30')
    if (p.formatoImagen !== undefined) setFormatoImagen(p.formatoImagen || 'Funcional')
    if (p.nivelSel !== undefined) setNivelSel(p.nivelSel)
    if (p.tipo !== undefined) setTipo(p.tipo)
    if (p.avatarSel !== undefined) setAvatarSel(p.avatarSel)
    if (p.avatarManual !== undefined) setAvatarManual(p.avatarManual || '')
    if (p.anguloSel !== undefined) setAnguloSel(p.anguloSel)
    if (p.modeloSel !== undefined) setModeloSel(p.modeloSel)
    if (p.analisis !== undefined) setAnalisis(p.analisis)
    if (Array.isArray(p.versiones)) setVersiones(p.versiones)
    if (p.versionActiva !== undefined) setVersionActiva(p.versionActiva || 0)
    if (Array.isArray(p.variaciones)) setVariaciones(p.variaciones)
    if (p.variacionActiva !== undefined) setVariacionActiva(p.variacionActiva || 0)
    if (Array.isArray(p.historial)) setHistorial(p.historial)
    if (Array.isArray(p.msgs)) setMsgs(p.msgs)
    if (p.auditorias && typeof p.auditorias === 'object') setAuditorias(p.auditorias)
    if (p.promptGen !== undefined) setPromptGen(p.promptGen || '')
    if (p.promptAnalisis !== undefined) setPromptAnalisis(p.promptAnalisis || '')
    if (Array.isArray(p.hooksUsadosImg)) setHooksUsadosImg(p.hooksUsadosImg)
    // Método 1 — restaura modo, paso y datos según tipo de versión
    if (p.modo === 'metodo1') {
      setModo('metodo1')
      setGuionInput(p.m1GuionInput || '')
      setM1Contexto(p.m1Contexto || '')
      setM1Analisis(p.m1Analisis || null)
      setM1HookOriginal(p.m1HookOriginal || '')
      setM1Cuerpo(p.m1Cuerpo || '')
      setM1Hooks(Array.isArray(p.m1Hooks) ? p.m1Hooks : [])
      // metodo1-generacion → paso 3; metodo1-analisis → paso 2
      setM1Paso(p.m1Paso || (Array.isArray(p.m1Hooks) && p.m1Hooks.length > 0 ? 3 : 2))
    } else if (p.modo === 'metodo2') {
      setModo('metodo2')
      setM2TextoHook(p.m2TextoHook || '')
      setM2TextoCuerpo(p.m2TextoCuerpo || '')
      setM2Contexto(p.m2Contexto || '')
      setM2HookExtraido(p.m2HookExtraido || '')
      setM2CuerpoExtraido(p.m2CuerpoExtraido || '')
      setM2HookDescartado(p.m2HookDescartado || '')
      setM2AnalisisHook(p.m2AnalisisHook || null)
      setM2AnalisisCuerpo(p.m2AnalisisCuerpo || null)
      setM2Compatibilidad(p.m2Compatibilidad || null)
      setM2GuionFusionado(p.m2GuionFusionado || '')
      setM2TransicionAgregada(p.m2TransicionAgregada || '')
      setM2Notas(p.m2Notas || '')
      // metodo2-fusion → paso 3; metodo2-analisis → paso 2
      setM2Paso(p.m2Paso || (p.m2GuionFusionado ? 3 : 2))
    } else if (p.modo === 'metodo3') {
      setModo('metodo3')
      setM3GuionInput(p.m3GuionInput || '')
      setM3Contexto(p.m3Contexto || '')
      setM3Analisis(p.m3Analisis || null)
      setM3Estructura(Array.isArray(p.m3Estructura) ? p.m3Estructura : [])
      const pc3 = Array.isArray(p.m3PalabrasClave) ? p.m3PalabrasClave : []
      setM3PalabrasClave(pc3)
      setM3PalabrasClaveTexto(pc3.join(', '))
      setM3Versiones(Array.isArray(p.m3Versiones) ? p.m3Versiones : [])
      // metodo3-regeneracion → paso 3; metodo3-analisis → paso 2
      setM3Paso(p.m3Paso || (Array.isArray(p.m3Versiones) && p.m3Versiones.length > 0 ? 3 : 2))
    } else {
      setModo(p.modo || 'crear')
    }
    // Reset costoAnuncio al costo acumulado del anuncio
    if (anuncio) {
      setCostoAnuncio({
        usd: Number(anuncio.costo_usd_total||0),
        cop: Number(anuncio.costo_cop_total||0),
        operaciones: Number(anuncio.versiones_count||0)
      })
    }
  }

  async function cargarHistorial(producto='') {
    setHistorialCargando(true)
    try {
      const r = await fetch('/api/historial/listar')
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al listar')
      const items = (d.items || []).filter(it=>{
        if (!producto || !producto.trim()) return true
        const q = producto.trim().toLowerCase()
        return (it.producto||'').toLowerCase().includes(q)
      })
      setHistorialItems(items)
    } catch (e) {
      alert('Error al cargar historial: ' + e.message)
    }
    setHistorialCargando(false)
  }

  async function cargarAnuncioHist(id, versionId=null) {
    try {
      const r = await fetch('/api/historial/' + id)
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'No encontrado')
      const versiones = Array.isArray(d.versiones) ? d.versiones : []
      const target = versionId
        ? versiones.find(v => v.id === versionId)
        : versiones[0]
      if (!target) {
        alert('Este anuncio aún no tiene versiones guardadas.')
        return
      }
      restaurarDesdeVersion(d, target)
      setAnuncioIdActual(id)
      try { localStorage.setItem('anuncioIdActual', String(id)) } catch {}
      setMostrarHistorial(false)
      setBannerSesion(null)
      setTimeout(() => document.getElementById('resultado-section')?.scrollIntoView({behavior:'smooth',block:'start'}), 150)
    } catch (e) {
      alert('Error al cargar: ' + e.message)
    }
  }

  async function eliminarAnuncioHist(id) {
    if (!confirm('¿Eliminar este anuncio y todas sus versiones del historial? Esta acción no se puede deshacer.')) return
    try {
      const r = await fetch('/api/historial/' + id, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al eliminar')
      setHistorialItems(items => items.filter(it => it.id !== id))
      setHistorialExpandido(prev => { const n={...prev}; delete n[id]; return n })
      if (anuncioIdActual === id) {
        setAnuncioIdActual(null)
        try { localStorage.removeItem('anuncioIdActual') } catch {}
      }
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  function nuevoAnuncioReset() {
    if (versiones.length > 0 && !confirm('Iniciar un anuncio nuevo? Lo actual ya está guardado y podrás recuperarlo desde el historial.')) return
    setAnuncioIdActual(null)
    try { localStorage.removeItem('anuncioIdActual') } catch {}
    setNombre(''); setProd(''); setUrl('')
    setArchivos([])
    setAnalisis(null); setPromptAnalisis('')
    setNivelSel(null); setTipo(null)
    setAvatarSel(null); setAvatarManual('')
    setAnguloSel(null)
    setVersiones([]); setVariaciones([])
    setVersionActiva(0); setVariacionActiva(0)
    setHistorial([]); setMsgs([])
    setCorreccion(''); setPromptGen('')
    setAuditorias({}); setAuditando(null)
    setHooksUsadosImg([])
    setCostoAnuncio({usd:0,cop:0,operaciones:0})
    setUltimoCosto(null)
    setBannerSesion(null)
    resetMetodo1()
    resetMetodo2()
    resetMetodo3()
  }

  // ── MÉTODO 1 — Variar Hook (flujo de 2 pasos) ──────────────────
  function aplicarCostoM1(costoOp) {
    if (!costoOp) return
    setUltimoCosto(costoOp)
    setCostoSesion(prev=>({
      usd: prev.usd + costoOp.totales.usd,
      cop: prev.cop + costoOp.totales.cop,
      operaciones: prev.operaciones + 1
    }))
    setCostoAnuncio(prev=>({
      usd: prev.usd + costoOp.totales.usd,
      cop: prev.cop + costoOp.totales.cop,
      operaciones: prev.operaciones + 1
    }))
  }

  function setM1Campo(campo, valor) {
    setM1Analisis(prev => ({ ...(prev || {}), [campo]: valor }))
  }

  function resetMetodo1() {
    setM1Paso(1); setGuionInput(''); setM1Contexto('')
    setM1Analisis(null); setM1HookOriginal(''); setM1Cuerpo(''); setM1Hooks([])
  }

  // Paso 1 → 2: analiza el guion (ingeniería inversa)
  async function analizarMetodo1() {
    if (!nombreValido) { alert('Escribe tu nombre antes de continuar'); return }
    if (!guionInput.trim()) return
    setM1Cargando(true)
    try {
      const r = await fetch('/api/metodo1/analizar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          guionCompleto: guionInput.trim(),
          contextoAdicional: m1Contexto.trim(),
          modelo: modeloSel,
          autor: nombreAutor.trim()
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al analizar el guion')
      setM1Analisis(d.analisis || {})
      setM1HookOriginal(d.hookOriginal || '')
      setM1Cuerpo(d.cuerpo || '')
      setM1Hooks([])
      if (d.anuncioId) {
        setAnuncioIdActual(d.anuncioId)
        try { localStorage.setItem('anuncioIdActual', String(d.anuncioId)) } catch {}
      }
      aplicarCostoM1(d.costoOperacion)
      setBannerSesion(null)
      setM1Paso(2)
    } catch(e) {
      alert('Error: ' + e.message)
    }
    setM1Cargando(false)
  }

  // Paso 2 → 3: genera 3 hooks con el análisis confirmado/editado
  async function generarHooksMetodo1() {
    if (!nombreValido) { alert('Escribe tu nombre antes de continuar'); return }
    if (!m1Analisis) return
    setM1Cargando(true)
    try {
      const r = await fetch('/api/metodo1/generar-hooks', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          anuncioId: anuncioIdActual || undefined,
          analisisConfirmado: m1Analisis,
          hookOriginal: m1HookOriginal,
          cuerpo: m1Cuerpo,
          modelo: modeloSel,
          autor: nombreAutor.trim()
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al generar los hooks')
      setM1Hooks(d.hooks || [])
      if (d.anuncioId) {
        setAnuncioIdActual(d.anuncioId)
        try { localStorage.setItem('anuncioIdActual', String(d.anuncioId)) } catch {}
      }
      aplicarCostoM1(d.costoOperacion)
      setM1Paso(3)
    } catch(e) {
      alert('Error: ' + e.message)
    }
    setM1Cargando(false)
  }

  // ── MÉTODO 2 — Fusión Hook + Cuerpo ────────────────────────────
  function resetMetodo2() {
    setM2Paso(1); setM2TextoHook(''); setM2TextoCuerpo(''); setM2Contexto('')
    setM2HookExtraido(''); setM2CuerpoExtraido(''); setM2HookDescartado('')
    setM2AnalisisHook(null); setM2AnalisisCuerpo(null); setM2Compatibilidad(null)
    setM2GuionFusionado(''); setM2TransicionAgregada(''); setM2Notas('')
    setM2Detalles(false)
  }

  // Paso 1 → 2: extrae hook y cuerpo, evalúa compatibilidad
  async function analizarMetodo2() {
    if (!nombreValido) { alert('Escribe tu nombre antes de continuar'); return }
    if (!m2TextoHook.trim() || !m2TextoCuerpo.trim()) return
    setM2Cargando(true)
    try {
      const r = await fetch('/api/metodo2/analizar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          textoConHook: m2TextoHook.trim(),
          textoConCuerpo: m2TextoCuerpo.trim(),
          contextoAdicional: m2Contexto.trim(),
          modelo: modeloSel,
          autor: nombreAutor.trim()
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al analizar los textos')
      setM2HookExtraido(d.hookExtraido || '')
      setM2CuerpoExtraido(d.cuerpoExtraido || '')
      setM2HookDescartado(d.hookDescartado || '')
      setM2AnalisisHook(d.analisisHook || null)
      setM2AnalisisCuerpo(d.analisisCuerpo || null)
      setM2Compatibilidad(d.compatibilidad || null)
      setM2GuionFusionado(''); setM2TransicionAgregada(''); setM2Notas('')
      if (d.anuncioId) {
        setAnuncioIdActual(d.anuncioId)
        try { localStorage.setItem('anuncioIdActual', String(d.anuncioId)) } catch {}
      }
      aplicarCostoM1(d.costoOperacion)
      setBannerSesion(null)
      setM2Paso(2)
    } catch(e) {
      alert('Error: ' + e.message)
    }
    setM2Cargando(false)
  }

  // Paso 2 → 3: fusiona el hook y el cuerpo confirmados
  async function fusionarMetodo2() {
    if (!nombreValido) { alert('Escribe tu nombre antes de continuar'); return }
    if (!m2HookExtraido.trim() || !m2CuerpoExtraido.trim()) return
    setM2Cargando(true)
    try {
      const r = await fetch('/api/metodo2/fusionar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          anuncioId: anuncioIdActual || undefined,
          hookConfirmado: m2HookExtraido,
          cuerpoConfirmado: m2CuerpoExtraido,
          analisisCompatibilidad: m2Compatibilidad,
          modelo: modeloSel,
          autor: nombreAutor.trim()
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al fusionar')
      setM2GuionFusionado(d.guionFusionado || '')
      setM2TransicionAgregada(d.transicionAgregada || '')
      setM2Notas(d.notas || '')
      if (d.anuncioId) {
        setAnuncioIdActual(d.anuncioId)
        try { localStorage.setItem('anuncioIdActual', String(d.anuncioId)) } catch {}
      }
      aplicarCostoM1(d.costoOperacion)
      setM2Paso(3)
    } catch(e) {
      alert('Error: ' + e.message)
    }
    setM2Cargando(false)
  }

  // ── MÉTODO 3 — Reestructurar ───────────────────────────────────
  function resetMetodo3() {
    setM3Paso(1); setM3GuionInput(''); setM3Contexto('')
    setM3Analisis(null); setM3Estructura([]); setM3PalabrasClave([]); setM3PalabrasClaveTexto('')
    setM3Versiones([]); setM3Detalles(false); setM3VerOriginal(false); setM3VerEstructura(false); setM3VerDetalleVersion({})
  }

  function setM3Campo(campo, valor) {
    setM3Analisis(prev => ({ ...(prev || {}), [campo]: valor }))
  }
  function setM3PasoFuncion(idx, valor) {
    setM3Estructura(prev => prev.map((s, i) => i === idx ? { ...s, funcion: valor } : s))
  }
  function m3MoverPaso(idx, dir) {
    setM3Estructura(prev => {
      const arr = [...prev]
      const j = idx + dir
      if (j < 0 || j >= arr.length) return prev
      const tmp = arr[idx]; arr[idx] = arr[j]; arr[j] = tmp
      return arr.map((s, i) => ({ ...s, paso: i + 1 }))
    })
  }
  function m3EliminarPaso(idx) {
    setM3Estructura(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, paso: i + 1 })))
  }
  function m3AgregarPaso() {
    setM3Estructura(prev => [...prev, { paso: prev.length + 1, funcion: '', ejemplo: '' }])
  }

  // Paso 1 → 2: analiza estructura + palabras clave
  async function analizarMetodo3() {
    if (!nombreValido) { alert('Escribe tu nombre antes de continuar'); return }
    if (!m3GuionInput.trim()) return
    setM3Cargando(true)
    try {
      const r = await fetch('/api/metodo3/analizar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          guionGanador: m3GuionInput.trim(),
          contextoAdicional: m3Contexto.trim(),
          modelo: modeloSel,
          autor: nombreAutor.trim()
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al analizar el guion')
      setM3Analisis(d.analisis || {})
      setM3Estructura(Array.isArray(d.estructura) ? d.estructura : [])
      const pc = Array.isArray(d.palabrasClave) ? d.palabrasClave : []
      setM3PalabrasClave(pc)
      setM3PalabrasClaveTexto(pc.join(', '))
      setM3Versiones([])
      if (d.anuncioId) {
        setAnuncioIdActual(d.anuncioId)
        try { localStorage.setItem('anuncioIdActual', String(d.anuncioId)) } catch {}
      }
      aplicarCostoM1(d.costoOperacion)
      setBannerSesion(null)
      setM3Paso(2)
    } catch(e) {
      alert('Error: ' + e.message)
    }
    setM3Cargando(false)
  }

  // Paso 2 → 3: genera 2 versiones nuevas con la misma estructura
  async function regenerarMetodo3() {
    if (!nombreValido) { alert('Escribe tu nombre antes de continuar'); return }
    if (!m3Analisis || m3Estructura.length === 0) return
    setM3Cargando(true)
    try {
      const palabras = m3PalabrasClaveTexto.split(',').map(s => s.trim()).filter(Boolean)
      const r = await fetch('/api/metodo3/regenerar', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          anuncioId: anuncioIdActual || undefined,
          analisisConfirmado: m3Analisis,
          estructuraConfirmada: m3Estructura,
          palabrasClaveOriginales: palabras,
          guionOriginal: m3GuionInput.trim(),
          modelo: modeloSel,
          autor: nombreAutor.trim()
        })
      })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error || 'Error al generar las versiones')
      setM3Versiones(d.versiones || [])
      setM3PalabrasClave(palabras)
      if (d.anuncioId) {
        setAnuncioIdActual(d.anuncioId)
        try { localStorage.setItem('anuncioIdActual', String(d.anuncioId)) } catch {}
      }
      aplicarCostoM1(d.costoOperacion)
      setM3Paso(3)
    } catch(e) {
      alert('Error: ' + e.message)
    }
    setM3Cargando(false)
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
    setAnalizando(true);setAnalisis(null);setTipo(null);setVersiones([]);setVariaciones([]);setNivelSel(null);setAvatarSel(null);setAvatarManual('');setAnguloSel(null);setAuditorias({});setHistorial([]);setMsgs([]);setHooksUsadosImg([])
    setBannerSesion(null)
    // Crea un nuevo anuncio (auto-save resiliente) y resetea costo del anuncio
    const nuevoId = await crearAnuncioServer()
    if (nuevoId) {
      setAnuncioIdActual(nuevoId)
      try { localStorage.setItem('anuncioIdActual', String(nuevoId)) } catch {}
    }
    setCostoAnuncio({usd:0,cop:0,operaciones:0})
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
      // Auto-save de la versión 'analisis' (no suma al costoAnuncio porque el modo analizar es gratuito por convención)
      if (nuevoId) {
        const contenido = snapshotState({
          analisis: sorted,
          nivelSel: parsed.nivel_recomendado,
          tipo: parsed.tipo_recomendado,
          anguloSel: anguloRec || null,
          avatarSel: parsed.avatar_recomendado ?? null,
          promptAnalisis: d.promptEjecutado || ''
        })
        guardarVersionServer(nuevoId, 'analisis', contenido, d.costoOperacion, modeloSel)
      }
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
      // Auto-save de la versión (resiliente)
      if (anuncioIdActual) {
        const nuevosHooks = (formato==='imagen' && Array.isArray(d.hooksIndicesUsados))
          ? Array.from(new Set([...hooksUsadosImg, ...d.hooksIndicesUsados.map(n=>parseInt(n,10)).filter(n=>!isNaN(n))]))
          : hooksUsadosImg
        actualizarBriefingServer(anuncioIdActual)
        const contenido = snapshotState({
          versiones: parsed,
          versionActiva: 0,
          variaciones: esCorr ? variaciones : [],
          variacionActiva: 0,
          historial: esCorr ? [...historial, correccion.trim()] : [],
          msgs: newMsgs,
          promptGen: d.promptEjecutado || promptGen,
          hooksUsadosImg: nuevosHooks
        })
        guardarVersionServer(anuncioIdActual, esCorr ? 'correccion' : 'generar', contenido, d.costoOperacion, modeloSel)
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
      if (anuncioIdActual) {
        actualizarBriefingServer(anuncioIdActual)
        const contenido = snapshotState({
          variaciones: parsedVar,
          variacionActiva: 0,
          promptGen: d.promptEjecutado || promptGen
        })
        guardarVersionServer(anuncioIdActual, 'variaciones', contenido, d.costoOperacion, modeloSel)
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

      const d = await api([{role:'user', content:ctxAud}], 'auditar', { formato: fmt })
      const text = d.content?.[0]?.text || ''
      const nuevasAud = { ...auditorias, [key]: text }
      setAuditorias(nuevasAud)
      if (anuncioIdActual) {
        actualizarBriefingServer(anuncioIdActual)
        const contenido = snapshotState({ auditorias: nuevasAud })
        guardarVersionServer(anuncioIdActual, 'auditar', contenido, d.costoOperacion, modeloSel)
      }
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

  const nombreValido = (nombreAutor || '').trim().length > 0
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
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${D.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif}textarea:focus,input:focus,select:focus{outline:none;border-color:${D.blue}!important}textarea::placeholder,input::placeholder{color:#9ca3af}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${D.bg}}::-webkit-scrollbar-thumb{background:${D.cardBorder};border-radius:2px}@keyframes m1spin{to{transform:rotate(360deg)}}`}</style>
      </Head>

      {/* ── MODAL DE LOGIN COMPARTIDO (bloqueante) ── */}
      {!autenticado && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>
          <div style={{background:'#ffffff',borderRadius:16,padding:'32px 28px',width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,0.35)'}}>
            <div style={{fontSize:22,fontWeight:800,color:D.text,letterSpacing:'.02em',marginBottom:6}}>Acceso a Ideo Team Ads Creator</div>
            <div style={{fontSize:13,color:D.textDim,marginBottom:20}}>Selecciona tu nombre</div>
            <div style={{display:'flex',gap:8,marginBottom:18}}>
              {USUARIOS_PERMITIDOS.map(u=>{
                const activo = loginNombre===u
                return (
                  <button key={u} onClick={()=>{ setLoginNombre(u); setLoginError('') }}
                    style={{flex:1,padding:'10px 6px',fontSize:13,fontWeight:600,fontFamily:'inherit',borderRadius:9,cursor:'pointer',
                      border:`1px solid ${activo?D.blue:D.cardBorder}`,background:activo?D.blueDark:'transparent',color:activo?D.blueLight:D.textMid}}>
                    {u}
                  </button>
                )
              })}
            </div>
            <input type="password" value={loginPassword}
              onChange={e=>{ setLoginPassword(e.target.value); setLoginError('') }}
              onKeyDown={e=>{ if(e.key==='Enter' && loginNombre && loginPassword) document.getElementById('m-login-entrar')?.click() }}
              placeholder="Contraseña"
              style={{width:'100%',background:D.input,border:`1px solid ${loginError?'#dc2626':D.inputBorder}`,color:D.text,padding:'11px 12px',borderRadius:9,fontSize:14,outline:'none',fontFamily:'inherit',marginBottom:loginError?6:18}}/>
            {loginError && (
              <div style={{fontSize:12,color:'#dc2626',marginBottom:14,lineHeight:1.4}}>{loginError}</div>
            )}
            <button id="m-login-entrar"
              disabled={!loginNombre || !loginPassword}
              onClick={()=>{
                if (loginPassword === PASSWORD_GRUPO && USUARIOS_PERMITIDOS.includes(loginNombre)) {
                  setNombreAutor(loginNombre)
                  setAutenticado(true)
                  try { localStorage.setItem('autor', loginNombre); localStorage.setItem('autenticado', 'true') } catch {}
                  setLoginError('')
                } else {
                  setLoginError('Contraseña incorrecta. Intenta de nuevo.')
                }
              }}
              style={{width:'100%',padding:13,fontSize:14,fontWeight:700,borderRadius:10,border:'none',
                background:(!loginNombre||!loginPassword)?D.cardBorder:`linear-gradient(135deg,#1270a0,${D.blue})`,
                color:'#fff',cursor:(!loginNombre||!loginPassword)?'not-allowed':'pointer',fontFamily:'inherit',letterSpacing:'.03em'}}>
              Entrar
            </button>
          </div>
        </div>
      )}

      {autenticado && (
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

        {mostrarHistorial&&(
          <div onClick={()=>setMostrarHistorial(false)} style={{position:'fixed',inset:0,background:'rgba(17,24,39,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 16px',overflowY:'auto'}}>
            <div onClick={e=>e.stopPropagation()} style={{background:'#ffffff',border:`1px solid ${D.cardBorder}`,borderRadius:14,padding:'1.25rem',width:'100%',maxWidth:820,maxHeight:'85vh',display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:D.blue,letterSpacing:'.07em',textTransform:'uppercase'}}>📂 Historial compartido</div>
                <button onClick={()=>setMostrarHistorial(false)} style={{fontSize:12,border:'none',background:'transparent',cursor:'pointer',color:D.textDim}}>✕</button>
              </div>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <input
                  value={busquedaHist}
                  onChange={e=>setBusquedaHist(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') cargarHistorial(busquedaHist) }}
                  placeholder="Buscar por producto…"
                  style={{flex:1,background:D.input,border:`1px solid ${D.inputBorder}`,color:D.text,padding:'7px 10px',borderRadius:6,fontSize:13,outline:'none',fontFamily:'inherit'}}
                />
                <button onClick={()=>cargarHistorial(busquedaHist)}
                  style={{fontSize:12,padding:'7px 14px',background:D.blue,color:'#fff',border:'none',borderRadius:6,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                  Buscar
                </button>
                {busquedaHist&&(
                  <button onClick={()=>{ setBusquedaHist(''); cargarHistorial('') }}
                    style={{fontSize:12,padding:'7px 12px',background:'transparent',color:D.textMid,border:`1px solid ${D.cardBorder}`,borderRadius:6,cursor:'pointer',fontFamily:'inherit'}}>
                    Limpiar
                  </button>
                )}
              </div>
              <div style={{flex:1,overflowY:'auto',border:`1px solid ${D.cardBorder}`,borderRadius:8,background:D.accent}}>
                {historialCargando ? (
                  <div style={{padding:24,textAlign:'center',color:D.textDim,fontSize:13}}>Cargando…</div>
                ) : historialItems.length===0 ? (
                  <div style={{padding:24,textAlign:'center',color:D.textDim,fontSize:13}}>Sin anuncios guardados todavía.</div>
                ) : historialItems.map(it=>{
                  const expandido = !!historialExpandido[it.id]
                  return (
                  <div key={it.id} style={{borderBottom:`1px solid ${D.cardBorder}`}}>
                    <div style={{padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
                      <button onClick={()=>setHistorialExpandido(prev=>({...prev,[it.id]:!prev[it.id]}))}
                        style={{fontSize:11,width:22,height:22,border:`1px solid ${D.cardBorder}`,background:expandido?D.blueDark:'transparent',color:D.textDim,borderRadius:4,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                        {expandido?'▾':'▸'}
                      </button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:D.text,marginBottom:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                          {(() => {
                            const badge = BADGES_METODO[it.metodo_principal] || BADGES_METODO['crear']
                            return (
                              <span style={{display:'inline-block',background:badge.bg,color:badge.color,padding:'2px 8px',borderRadius:6,fontSize:11,fontWeight:600,marginRight:8}}>
                                {badge.label}
                              </span>
                            )
                          })()}
                          #{it.id} · {it.producto || '(sin producto)'}
                        </div>
                        <div style={{fontSize:11,color:D.textDim,display:'flex',gap:8,flexWrap:'wrap'}}>
                          <span>{new Date(it.actualizado_en||it.creado_en).toLocaleString('es-CO',{year:'2-digit',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
                          <span>·</span>
                          <span>{it.autor || 'Anónimo'}</span>
                          {it.formato && <><span>·</span><span style={{color:it.formato==='imagen'?'#059669':D.blue}}>{it.formato==='imagen'?'Imagen':'Video'}</span></>}
                          {it.nivel && <><span>·</span><span>Nivel {it.nivel}</span></>}
                          {it.motivo && <><span>·</span><span>{it.motivo}</span></>}
                          <span>·</span>
                          <span>{it.versiones_count||0} versión{(it.versiones_count||0)===1?'':'es'}</span>
                          <span>·</span>
                          <span>${Number(it.costo_usd_total||0).toFixed(4)} USD</span>
                        </div>
                      </div>
                      <button onClick={()=>cargarAnuncioHist(it.id)}
                        style={{fontSize:11,padding:'5px 12px',background:D.blue,color:'#fff',border:'none',borderRadius:5,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                        Cargar última
                      </button>
                      <button onClick={()=>eliminarAnuncioHist(it.id)}
                        style={{fontSize:11,padding:'5px 10px',background:'transparent',color:'#dc2626',border:`1px solid #fecaca`,borderRadius:5,cursor:'pointer',fontFamily:'inherit'}}>
                        Eliminar
                      </button>
                    </div>
                    {expandido && (
                      <VersionesExpandidas id={it.id} onCargar={cargarAnuncioHist} D={D} />
                    )}
                  </div>
                  )
                })}
              </div>
              <div style={{marginTop:10,fontSize:11,color:D.textDim,textAlign:'right'}}>
                {historialItems.length} anuncio{historialItems.length===1?'':'s'}
              </div>
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
            {/* ── Indicador de usuario + cerrar sesión ── */}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:13,color:D.textMid}}>👤 {nombreAutor}</span>
              <button
                onClick={()=>{
                  try { localStorage.removeItem('autenticado'); localStorage.removeItem('autor') } catch {}
                  setAutenticado(false)
                  setNombreAutor('')
                  setLoginNombre('')
                  setLoginPassword('')
                }}
                style={{background:'transparent',border:'none',color:D.textDim,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
                Cerrar sesión
              </button>
            </div>

            <button onClick={nuevoAnuncioReset}
              style={{fontSize:11,color:D.blue,border:`1px solid ${D.blueDim}`,borderRadius:20,padding:'5px 14px',background:D.blueDark,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
              + Nuevo anuncio
            </button>

            <button onClick={()=>{ setMostrarHistorial(true); cargarHistorial(busquedaHist) }}
              style={{fontSize:11,color:D.text,border:`1px solid ${D.cardBorder}`,borderRadius:20,padding:'5px 14px',background:'transparent',cursor:'pointer',fontFamily:'inherit'}}>
              📂 Historial
            </button>

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

        {/* ── TABS DE MODOS ── */}
        <div style={{background:'#ffffff',borderBottom:`1px solid ${D.cardBorder}`,padding:'10px 16px',display:'flex',justifyContent:'center',gap:8,flexWrap:'wrap'}}>
          {[
            { id:'crear', label:'Crear desde cero' },
            { id:'metodo1', label:'Variar Hook' },
            { id:'metodo2', label:'Fusión Hook + Cuerpo' },
            { id:'metodo3', label:'Reestructurar' }
          ].map(t=>{
            const activo = modo===t.id
            return (
              <button key={t.id} disabled={!nombreValido}
                onClick={()=>{ if(nombreValido) setModo(t.id) }}
                title={!nombreValido?'Escribe tu nombre primero':undefined}
                style={{padding:'8px 16px',borderRadius:8,border:'none',fontSize:12,fontWeight:600,fontFamily:'inherit',
                  background:activo?D.blue:D.accent,color:activo?'#ffffff':D.textMid,
                  cursor:nombreValido?'pointer':'not-allowed',opacity:nombreValido?1:0.55,transition:'all .15s'}}>
                {t.label}
              </button>
            )
          })}
        </div>

        {bannerSesion && (
          <div style={{background:D.blueDark,borderBottom:`1px solid ${D.blueDim}`,padding:'8px 16px',display:'flex',justifyContent:'center'}}>
            <div style={{maxWidth:700,width:'100%',display:'flex',alignItems:'center',gap:10,fontSize:12,color:D.blueLight}}>
              <span style={{fontSize:14}}>↺</span>
              <span style={{flex:1}}>Continuando última sesión <strong>#{bannerSesion.id}</strong></span>
              <button onClick={()=>setBannerSesion(null)}
                style={{fontSize:14,border:'none',background:'transparent',color:D.blueLight,cursor:'pointer',padding:'0 4px',lineHeight:1}}>✕</button>
            </div>
          </div>
        )}

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

          {modo === 'crear' && (<>

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
            <button onClick={analizar} disabled={!nombreValido||analizando||(!nombre.trim()&&!prod.trim()&&!url.trim()&&archivos.length===0)} title={!nombreValido?'Escribe tu nombre primero':undefined} style={{...btnMain,opacity:(!nombreValido||analizando||(!nombre.trim()&&!prod.trim()&&!url.trim()&&archivos.length===0))?.5:1,cursor:nombreValido?'pointer':'not-allowed'}}>
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
                      {DURACIONES_DISPONIBLES.map(d=>(
                        <button key={d.valor} onClick={()=>setDuracion(d.valor)} style={{...chipBtn(duracion===d.valor),minWidth:50,textAlign:'center'}}>{d.label}</button>
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
                    <button onClick={()=>generar(false)} disabled={!nombreValido||!ok||generando} title={!nombreValido?'Escribe tu nombre primero':undefined} style={{...btnMain,marginTop:0,opacity:(!nombreValido||!ok||generando)?.4:1,cursor:nombreValido?'pointer':'not-allowed'}}>
                      {generando
                        ?formato==='imagen'?'Generando 2 ideas...':'Generando 2 versiones...'
                        :ok
                          ?formato==='imagen'?'Generar 2 ideas de imagen':`Generar 2 versiones (${labelDuracion(duracion)})`
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
                    {formato==='imagen'?'Imagen estática':`Video ${labelDuracion(duracion)}`}
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
                <div style={{background:D.accent,border:'1px solid '+D.cardBorder,borderRadius:8,padding:'8px 12px',fontSize:12,color:D.textMid,display:'flex',alignItems:'center',gap:12,marginBottom:6,flexWrap:'wrap'}}>
                  <span>Última: <strong>${ultimoCosto.totales.usd.toFixed(4)}</strong> USD (${ultimoCosto.totales.cop.toFixed(0)} COP)</span>
                  <span style={{color:D.blue}}>· Anuncio actual: <strong>${costoAnuncio.usd.toFixed(4)}</strong> USD (${costoAnuncio.cop.toFixed(0)} COP) · {costoAnuncio.operaciones} ops</span>
                  <span style={{marginLeft:'auto',color:D.textDim}}>Sesión: ${costoSesion.usd.toFixed(4)} USD · {costoSesion.operaciones} ops</span>
                </div>
              )}

              {anuncioIdActual && (
                <div style={{ fontSize: 11, color: D.textDim, marginBottom: 12 }}>
                  Auto-guardado en anuncio #{anuncioIdActual}
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
                      <button onClick={()=>auditarVersion(versionActiva,'video')} disabled={!nombreValido||auditando===String(versionActiva)} title={!nombreValido?'Escribe tu nombre primero':undefined}
                        style={{fontSize:11, padding:'7px 14px', background:D.accent, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:7, cursor:nombreValido?'pointer':'not-allowed', fontFamily:'inherit', fontWeight:600, opacity:(!nombreValido||auditando===String(versionActiva))?.5:1}}>
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
                          <button onClick={()=>auditarVersion(versionActiva,'video')} disabled={!nombreValido||auditando===String(versionActiva)} title={!nombreValido?'Escribe tu nombre primero':undefined}
                            style={{fontSize:10, color:D.textMid, background:'transparent', border:`1px solid ${D.cardBorder}`, borderRadius:5, padding:'4px 9px', cursor:nombreValido?'pointer':'not-allowed', opacity:nombreValido?1:0.5}}>
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
                          <button onClick={()=>{setVersionActiva(i);setTimeout(generarVariaciones,50)}} disabled={!nombreValido||generandoVariaciones} title={!nombreValido?'Escribe tu nombre primero':undefined} style={{fontSize:11,color:D.green,border:`1px solid ${D.greenBorder}`,background:D.greenBg,borderRadius:7,padding:'4px 10px',cursor:nombreValido?'pointer':'not-allowed',fontFamily:'inherit',opacity:(!nombreValido||generandoVariaciones)?.5:1}}>⟳ Variaciones</button>
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
                          <button onClick={()=>auditarVersion(i,'imagen')} disabled={!nombreValido||auditando==='imagen_'+i} title={!nombreValido?'Escribe tu nombre primero':undefined}
                            style={{fontSize:11, padding:'6px 12px', background:D.accent, border:`1px solid ${D.cardBorder}`, color:D.textMid, borderRadius:7, cursor:nombreValido?'pointer':'not-allowed', fontFamily:'inherit', fontWeight:600, opacity:(!nombreValido||auditando==='imagen_'+i)?.5:1}}>
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
                  <button onClick={()=>generar(false)} disabled={!nombreValido||generando} title={!nombreValido?'Escribe tu nombre primero':undefined} style={{flex:1,padding:10,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:8,background:'transparent',color:D.textDim,cursor:nombreValido?'pointer':'not-allowed',fontFamily:'inherit',opacity:nombreValido?1:0.5}}>
                    {generando?'...':'Regenerar'}
                  </button>
                  <button onClick={()=>generar(true)} disabled={!nombreValido||generando||!correccion.trim()} title={!nombreValido?'Escribe tu nombre primero':undefined} style={{flex:2,padding:10,fontSize:12,fontWeight:600,border:`1px solid ${D.blue}60`,borderRadius:8,background:D.blueDark,color:D.blue,cursor:nombreValido?'pointer':'not-allowed',fontFamily:'inherit',opacity:(!nombreValido||!correccion.trim()||generando)?.4:1}}>
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

          </>)}

          {modo === 'metodo1' && (
            <>
              {/* Indicador de pasos */}
              <div style={{display:'flex',gap:6,marginBottom:10,justifyContent:'center'}}>
                {[
                  {n:1,txt:'Tu guion'},
                  {n:2,txt:'Revisar análisis'},
                  {n:3,txt:'Hooks generados'}
                ].map(p=>(
                  <div key={p.n} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,
                    color:m1Paso===p.n?D.blue:m1Paso>p.n?D.green:D.textFaint,fontWeight:m1Paso===p.n?700:500}}>
                    <span style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:700,color:'#fff',
                      background:m1Paso===p.n?D.blue:m1Paso>p.n?D.green:D.textFaint}}>{m1Paso>p.n?'✓':p.n}</span>
                    {p.txt}
                  </div>
                ))}
              </div>

              {/* ── PASO 1 — input del guion ── */}
              {m1Paso === 1 && (
                <div style={crd}>
                  <div style={stepRow}><div style={stepNum}>M1</div><div style={stepLbl}>Variar Hook — Paso 1: Tu guion</div></div>
                  <div style={fldLbl}>Pega tu guion completo (hook + cuerpo)</div>
                  <textarea value={guionInput} onChange={e=>setGuionInput(e.target.value)} rows={9}
                    placeholder="Pega aquí tu guion publicitario completo (hook + cuerpo)..."
                    style={{...inp,minHeight:190,marginBottom:14}}/>
                  <div style={fldLbl}>Contexto adicional <span style={{color:D.textFaint,fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional)</span></div>
                  <div style={{fontSize:12,color:D.textDim,lineHeight:1.5,marginBottom:6}}>
                    Cuéntale al sistema qué producto vende, qué avatar real, qué intención tiene este anuncio. Esto mejora el análisis.
                  </div>
                  <textarea value={m1Contexto} onChange={e=>setM1Contexto(e.target.value)} rows={4}
                    placeholder="Ej: Es un mantel anti-manchas, dirigido a madres de familia, busca que la gente vaya a leer el advertorial..."
                    style={{...inp,marginBottom:14}}/>
                  <button onClick={analizarMetodo1}
                    disabled={!nombreValido||!guionInput.trim()||m1Cargando}
                    title={!nombreValido?'Escribe tu nombre primero':undefined}
                    style={{...btnMain,marginTop:0,opacity:(!nombreValido||!guionInput.trim()||m1Cargando)?.5:1,cursor:(nombreValido&&guionInput.trim()&&!m1Cargando)?'pointer':'not-allowed'}}>
                    {m1Cargando?'Analizando...':'🔍 Analizar guion'}
                  </button>
                </div>
              )}

              {/* ── PASO 2 — revisar / editar análisis ── */}
              {m1Paso === 2 && m1Analisis && (
                <>
                  <div style={crd}>
                    <div style={stepRow}><div style={stepNum}>M1</div><div style={stepLbl}>Paso 2: Revisar análisis</div></div>
                    <div style={{fontSize:13,fontWeight:600,color:D.blue,marginBottom:14}}>🎯 Análisis detectado — Revisa y corrige si es necesario</div>

                    <div style={fldLbl}>Avatar</div>
                    <textarea value={m1Analisis.avatar||''} onChange={e=>setM1Campo('avatar',e.target.value)} rows={3}
                      style={{...inp,marginBottom:12}}/>

                    <div style={fldLbl}>Producto</div>
                    <input type="text" value={m1Analisis.producto||''} onChange={e=>setM1Campo('producto',e.target.value)}
                      style={{...inp,height:38,padding:'9px 12px',marginBottom:12}}/>

                    <div style={fldLbl}>Formato</div>
                    <select value={(m1Analisis.formato||'').toLowerCase().includes('imagen')?'imagen':'video'}
                      onChange={e=>setM1Campo('formato',e.target.value)} style={{...sel,marginBottom:12}}>
                      <option value="video">Video</option>
                      <option value="imagen">Imagen</option>
                    </select>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                      <div>
                        <div style={fldLbl}>Nivel de consciencia</div>
                        <select value={String(m1Analisis.nivel||'')} onChange={e=>setM1Campo('nivel',e.target.value)} style={sel}>
                          <option value="">—</option>
                          <option value="1">1 - Inconsciente</option>
                          <option value="2">2 - Consciente del problema</option>
                          <option value="3">3 - Consciente de la solución</option>
                          <option value="4">4 - Consciente del producto</option>
                          <option value="5">5 - Totalmente consciente</option>
                        </select>
                      </div>
                      <div>
                        <div style={fldLbl}>Motivo</div>
                        <select value={m1Analisis.motivo||''} onChange={e=>setM1Campo('motivo',e.target.value)} style={sel}>
                          <option value="">—</option>
                          {['Emocional','Funcional','Educativo','Aspiracional','Racional'].map(m=>(
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={fldLbl}>Ángulo</div>
                    <select value={m1Analisis.angulo||''} onChange={e=>setM1Campo('angulo',e.target.value)} style={{...sel,marginBottom:12}}>
                      <option value="">—</option>
                      {Object.keys(DOCTRINA_ANGULOS).map(a=>(
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>

                    <div style={fldLbl}>Tono</div>
                    <input type="text" value={m1Analisis.tono||''} onChange={e=>setM1Campo('tono',e.target.value)}
                      style={{...inp,height:38,padding:'9px 12px',marginBottom:0}}/>
                  </div>

                  {/* Referencia read-only — colapsable */}
                  <div style={{marginTop:16}}>
                    <button
                      onClick={()=>setM1Detalles(!m1Detalles)}
                      style={{background:'transparent',border:'none',color:D.blue,cursor:'pointer',fontSize:13,padding:'4px 0',fontFamily:'inherit'}}>
                      {m1Detalles ? '▾' : '▸'} Ver detalles del análisis (razonamiento, hook detectado, cuerpo extraído)
                    </button>
                    {m1Detalles && (
                      <div style={{marginTop:8}}>
                        <div style={{...crd,background:D.accent}}>
                          {m1Analisis.razonamiento && (
                            <div style={{marginBottom:12}}>
                              <div style={fldLbl}>Razonamiento del sistema</div>
                              <div style={{fontSize:13,color:D.textMid,lineHeight:1.6}}>{m1Analisis.razonamiento}</div>
                            </div>
                          )}
                          <div style={{marginBottom:12}}>
                            <div style={fldLbl}>Hook original</div>
                            <div style={{fontSize:14,color:D.text,lineHeight:1.5,whiteSpace:'pre-wrap'}}>{m1HookOriginal||'—'}</div>
                          </div>
                          <div>
                            <div style={fldLbl}>Cuerpo</div>
                            <div style={{fontSize:13,color:D.textMid,lineHeight:1.6,whiteSpace:'pre-wrap',maxHeight:220,overflowY:'auto'}}>{m1Cuerpo||'—'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setM1Paso(1)} disabled={m1Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:9,background:'transparent',color:D.textMid,cursor:m1Cargando?'not-allowed':'pointer',fontFamily:'inherit',opacity:m1Cargando?.5:1}}>
                      ↩️ Volver y reanalizar
                    </button>
                    <button onClick={generarHooksMetodo1} disabled={!nombreValido||m1Cargando}
                      title={!nombreValido?'Escribe tu nombre primero':undefined}
                      style={{flex:2,padding:12,fontSize:13,fontWeight:600,border:'none',borderRadius:9,background:`linear-gradient(135deg,#1270a0,${D.blue})`,color:'#fff',cursor:(nombreValido&&!m1Cargando)?'pointer':'not-allowed',fontFamily:'inherit',opacity:(!nombreValido||m1Cargando)?.5:1}}>
                      {m1Cargando?'Generando...':'🎬 Confirmar y generar 3 hooks'}
                    </button>
                  </div>
                </>
              )}

              {/* ── PASO 3 — hooks generados ── */}
              {m1Paso === 3 && (
                <>
                  {m1Hooks.map((h,i)=>{
                    const cumple = (h.advertenciaMeta||'').toLowerCase().includes('cumple polít')
                    return (
                      <div key={i} style={crd}>
                        <div style={{fontSize:11,fontWeight:700,color:D.blue,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Hook {i+1}</div>
                        <div style={{fontSize:18,fontWeight:700,color:D.text,lineHeight:1.4,marginBottom:12}}>{h.texto}</div>
                        <div style={{fontSize:13,color:D.textMid,lineHeight:1.6,marginBottom:10}}>
                          <b style={{color:D.text}}>💡 Idea visual:</b> {h.ideaVisual}
                        </div>
                        <div style={fldLbl}>📜 Guion completo</div>
                        <textarea readOnly value={h.guionCompleto||''} rows={9}
                          style={{...inp,minHeight:180,marginBottom:10,background:D.accent}}/>
                        {!cumple && h.advertenciaMeta && (
                          <div style={{fontSize:12,color:'#dc2626',fontWeight:600,lineHeight:1.5,marginBottom:8}}>⚠️ {h.advertenciaMeta}</div>
                        )}
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          <button onClick={()=>copiarAlPortapapeles(h.guionCompleto||'','m1_gc_'+i)}
                            style={{fontSize:12,fontWeight:600,padding:'8px 14px',borderRadius:8,border:`1px solid ${D.blue}`,background:copiadoKey==='m1_gc_'+i?D.green:D.blueDark,color:copiadoKey==='m1_gc_'+i?'#fff':D.blue,cursor:'pointer',fontFamily:'inherit'}}>
                            {copiadoKey==='m1_gc_'+i?'✓ Copiado':'📋 Copiar guion completo'}
                          </button>
                          <button onClick={()=>copiarAlPortapapeles(h.texto||'','m1_h_'+i)}
                            style={{fontSize:12,padding:'8px 14px',borderRadius:8,border:`1px solid ${D.cardBorder}`,background:'transparent',color:copiadoKey==='m1_h_'+i?D.green:D.textMid,cursor:'pointer',fontFamily:'inherit'}}>
                            {copiadoKey==='m1_h_'+i?'✓ Copiado':'Copiar solo hook'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setM1Paso(2)} disabled={m1Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:9,background:'transparent',color:D.textMid,cursor:m1Cargando?'not-allowed':'pointer',fontFamily:'inherit',opacity:m1Cargando?.5:1}}>
                      ↩️ Volver al análisis
                    </button>
                    <button onClick={generarHooksMetodo1} disabled={!nombreValido||m1Cargando}
                      title={!nombreValido?'Escribe tu nombre primero':undefined}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.blue}`,borderRadius:9,background:D.blue,color:'#fff',cursor:(nombreValido&&!m1Cargando)?'pointer':'not-allowed',fontFamily:'inherit',fontWeight:600,opacity:(!nombreValido||m1Cargando)?.5:1}}>
                      {m1Cargando?'Regenerando...':'🔄 Regenerar 3 hooks'}
                    </button>
                    <button onClick={resetMetodo1} disabled={m1Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.blueDim}`,borderRadius:9,background:D.blueDark,color:D.blue,cursor:m1Cargando?'not-allowed':'pointer',fontFamily:'inherit',fontWeight:600,opacity:m1Cargando?.5:1}}>
                      🔄 Nuevo guion
                    </button>
                  </div>
                </>
              )}

              {m1Cargando && (
                <div style={{...crd,display:'flex',alignItems:'center',gap:12,marginTop:10}}>
                  <div style={{width:18,height:18,border:`2px solid ${D.blueDim}`,borderTopColor:D.blue,borderRadius:'50%',animation:'m1spin .8s linear infinite',flexShrink:0}}/>
                  <div style={{fontSize:13,color:D.textMid}}>
                    {m1Paso===1?'Haciendo ingeniería inversa del guion...':'Generando 3 hooks alternativos con ideas visuales...'}
                  </div>
                </div>
              )}
            </>
          )}

          {modo === 'metodo2' && (
            <>
              {/* Indicador de pasos */}
              <div style={{display:'flex',gap:6,marginBottom:10,justifyContent:'center'}}>
                {[
                  {n:1,txt:'Tus guiones'},
                  {n:2,txt:'Revisar fusión'},
                  {n:3,txt:'Guion fusionado'}
                ].map(p=>(
                  <div key={p.n} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,
                    color:m2Paso===p.n?D.blue:m2Paso>p.n?D.green:D.textFaint,fontWeight:m2Paso===p.n?700:500}}>
                    <span style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:700,color:'#fff',
                      background:m2Paso===p.n?D.blue:m2Paso>p.n?D.green:D.textFaint}}>{m2Paso>p.n?'✓':p.n}</span>
                    {p.txt}
                  </div>
                ))}
              </div>

              {/* ── PASO 1 — input de los 2 guiones ── */}
              {m2Paso === 1 && (
                <div style={crd}>
                  <div style={stepRow}><div style={stepNum}>M2</div><div style={stepLbl}>Fusión Hook + Cuerpo — Paso 1: Tus guiones</div></div>
                  <div style={fldLbl}>Texto con el HOOK ganador</div>
                  <div style={{fontSize:12,color:D.textDim,lineHeight:1.5,marginBottom:6}}>Te tomamos solo el hook, ignoramos el resto.</div>
                  <textarea value={m2TextoHook} onChange={e=>setM2TextoHook(e.target.value)} rows={6}
                    placeholder="Pega aquí el texto que contiene el hook ganador..."
                    style={{...inp,minHeight:120,marginBottom:14}}/>
                  <div style={fldLbl}>Texto con el CUERPO ganador</div>
                  <div style={{fontSize:12,color:D.textDim,lineHeight:1.5,marginBottom:6}}>Te tomamos solo el cuerpo, descartamos su propio hook.</div>
                  <textarea value={m2TextoCuerpo} onChange={e=>setM2TextoCuerpo(e.target.value)} rows={8}
                    placeholder="Pega aquí el texto que contiene el cuerpo ganador..."
                    style={{...inp,minHeight:160,marginBottom:14}}/>
                  <div style={fldLbl}>Contexto adicional <span style={{color:D.textFaint,fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional)</span></div>
                  <textarea value={m2Contexto} onChange={e=>setM2Contexto(e.target.value)} rows={3}
                    placeholder="Qué producto vendes, qué avatar real..."
                    style={{...inp,marginBottom:14}}/>
                  <button onClick={analizarMetodo2}
                    disabled={!nombreValido||!m2TextoHook.trim()||!m2TextoCuerpo.trim()||m2Cargando}
                    title={!nombreValido?'Escribe tu nombre primero':undefined}
                    style={{...btnMain,marginTop:0,opacity:(!nombreValido||!m2TextoHook.trim()||!m2TextoCuerpo.trim()||m2Cargando)?.5:1,cursor:(nombreValido&&m2TextoHook.trim()&&m2TextoCuerpo.trim()&&!m2Cargando)?'pointer':'not-allowed'}}>
                    {m2Cargando?'Analizando...':'🔍 Analizar y extraer límites'}
                  </button>
                </div>
              )}

              {/* ── PASO 2 — revisar extracción + compatibilidad ── */}
              {m2Paso === 2 && (
                <>
                  <div style={crd}>
                    <div style={stepRow}><div style={stepNum}>M2</div><div style={stepLbl}>Paso 2: Revisar fusión</div></div>
                    <div style={{fontSize:13,fontWeight:600,color:D.blue,marginBottom:14}}>🎯 Hook y cuerpo extraídos — Revisa y corrige</div>
                    <div style={fldLbl}>Hook extraído</div>
                    <textarea value={m2HookExtraido} onChange={e=>setM2HookExtraido(e.target.value)} rows={2}
                      style={{...inp,marginBottom:12}}/>
                    <div style={fldLbl}>Cuerpo extraído</div>
                    <textarea value={m2CuerpoExtraido} onChange={e=>setM2CuerpoExtraido(e.target.value)} rows={9}
                      style={{...inp,minHeight:180,marginBottom:m2HookDescartado?12:0}}/>
                    {m2HookDescartado && (
                      <div>
                        <div style={fldLbl}>Hook descartado del segundo texto</div>
                        <div style={{fontSize:13,color:D.textDim,lineHeight:1.5,fontStyle:'italic',background:D.accent,border:`1px solid ${D.cardBorder}`,borderRadius:8,padding:'8px 12px'}}>{m2HookDescartado}</div>
                      </div>
                    )}
                  </div>

                  {/* Compatibilidad */}
                  {m2Compatibilidad && (() => {
                    const nv = (m2Compatibilidad.nivel||'media').toLowerCase()
                    const cc = nv==='alta'?D.green : nv==='baja'?'#dc2626' : '#f59e0b'
                    return (
                      <div style={{...crd,borderLeft:`4px solid ${cc}`}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                          <span style={{fontSize:12,fontWeight:700,color:D.textMid,textTransform:'uppercase',letterSpacing:'.06em'}}>Compatibilidad</span>
                          <span style={{fontSize:11,fontWeight:700,color:'#fff',background:cc,padding:'2px 10px',borderRadius:10,textTransform:'uppercase'}}>{nv}</span>
                        </div>
                        {m2Compatibilidad.razones && (
                          <div style={{fontSize:13,color:D.textMid,lineHeight:1.6,marginBottom:(m2Compatibilidad.advertencias&&m2Compatibilidad.advertencias.length)?8:0}}>{m2Compatibilidad.razones}</div>
                        )}
                        {Array.isArray(m2Compatibilidad.advertencias) && m2Compatibilidad.advertencias.length>0 && (
                          <div style={{display:'flex',flexDirection:'column',gap:4}}>
                            {m2Compatibilidad.advertencias.map((a,i)=>(
                              <div key={i} style={{fontSize:12,color:'#c2620e',lineHeight:1.5}}>⚠️ {a}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Collapse análisis detallado */}
                  <div style={{marginBottom:10}}>
                    <button onClick={()=>setM2Detalles(!m2Detalles)}
                      style={{background:'transparent',border:'none',color:D.blue,cursor:'pointer',fontSize:13,padding:'4px 0',fontFamily:'inherit'}}>
                      {m2Detalles?'▾':'▸'} Ver análisis estratégico detallado
                    </button>
                    {m2Detalles && (
                      <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:10}}>
                        {[{t:'Análisis del hook',a:m2AnalisisHook},{t:'Análisis del cuerpo',a:m2AnalisisCuerpo}].map((blk,i)=>(
                          <div key={i} style={{...crd,background:D.accent,marginBottom:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:D.blue,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>{blk.t}</div>
                            {blk.a ? (
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
                                <DLine label="Avatar" value={blk.a.avatar||'—'}/>
                                <DLine label="Producto" value={blk.a.producto||'—'}/>
                                <DLine label="Nivel" value={blk.a.nivel||'—'}/>
                                <DLine label="Motivo" value={blk.a.motivo||'—'}/>
                                <DLine label="Ángulo" value={blk.a.angulo||'—'}/>
                                <DLine label="Tono" value={blk.a.tono||'—'}/>
                              </div>
                            ) : <div style={{fontSize:12,color:D.textFaint,fontStyle:'italic'}}>Sin datos.</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setM2Paso(1)} disabled={m2Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:9,background:'transparent',color:D.textMid,cursor:m2Cargando?'not-allowed':'pointer',fontFamily:'inherit',opacity:m2Cargando?.5:1}}>
                      ↩️ Volver y reanalizar
                    </button>
                    <button onClick={fusionarMetodo2} disabled={!nombreValido||m2Cargando||!m2HookExtraido.trim()||!m2CuerpoExtraido.trim()}
                      title={!nombreValido?'Escribe tu nombre primero':undefined}
                      style={{flex:2,padding:12,fontSize:13,fontWeight:600,border:'none',borderRadius:9,background:`linear-gradient(135deg,#1270a0,${D.blue})`,color:'#fff',cursor:(nombreValido&&!m2Cargando)?'pointer':'not-allowed',fontFamily:'inherit',opacity:(!nombreValido||m2Cargando||!m2HookExtraido.trim()||!m2CuerpoExtraido.trim())?.5:1}}>
                      {m2Cargando?'Fusionando...':'🔗 Confirmar y fusionar'}
                    </button>
                  </div>
                </>
              )}

              {/* ── PASO 3 — guion fusionado ── */}
              {m2Paso === 3 && (
                <>
                  <div style={crd}>
                    <div style={{fontSize:13,fontWeight:700,color:D.green,marginBottom:12}}>✅ Guion fusionado</div>
                    <textarea readOnly value={m2GuionFusionado} rows={12}
                      style={{...inp,minHeight:240,marginBottom:10,background:D.accent}}/>
                    <div style={{fontSize:12,color:D.textDim,lineHeight:1.6,marginBottom:m2Notas?3:10}}>
                      <b style={{color:D.textMid}}>Transición agregada:</b> {m2TransicionAgregada||'Ninguna'}
                    </div>
                    {m2Notas && (
                      <div style={{fontSize:12,color:D.textDim,lineHeight:1.6,marginBottom:10}}>
                        <b style={{color:D.textMid}}>Notas:</b> {m2Notas}
                      </div>
                    )}
                    <button onClick={()=>copiarAlPortapapeles(m2GuionFusionado,'m2_fus')}
                      style={{fontSize:12,fontWeight:600,padding:'8px 14px',borderRadius:8,border:`1px solid ${D.blue}`,background:copiadoKey==='m2_fus'?D.green:D.blueDark,color:copiadoKey==='m2_fus'?'#fff':D.blue,cursor:'pointer',fontFamily:'inherit'}}>
                      {copiadoKey==='m2_fus'?'✓ Copiado':'📋 Copiar guion fusionado'}
                    </button>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setM2Paso(2)} disabled={m2Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:9,background:'transparent',color:D.textMid,cursor:m2Cargando?'not-allowed':'pointer',fontFamily:'inherit',opacity:m2Cargando?.5:1}}>
                      ↩️ Volver a revisar
                    </button>
                    <button onClick={fusionarMetodo2} disabled={!nombreValido||m2Cargando}
                      title={!nombreValido?'Escribe tu nombre primero':undefined}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.blue}`,borderRadius:9,background:D.blue,color:'#fff',cursor:(nombreValido&&!m2Cargando)?'pointer':'not-allowed',fontFamily:'inherit',fontWeight:600,opacity:(!nombreValido||m2Cargando)?.5:1}}>
                      {m2Cargando?'Refusionando...':'🔄 Refusionar'}
                    </button>
                    <button onClick={resetMetodo2} disabled={m2Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.blueDim}`,borderRadius:9,background:D.blueDark,color:D.blue,cursor:m2Cargando?'not-allowed':'pointer',fontFamily:'inherit',fontWeight:600,opacity:m2Cargando?.5:1}}>
                      🔄 Nuevo proceso
                    </button>
                  </div>
                </>
              )}

              {m2Cargando && (
                <div style={{...crd,display:'flex',alignItems:'center',gap:12,marginTop:10}}>
                  <div style={{width:18,height:18,border:`2px solid ${D.blueDim}`,borderTopColor:D.blue,borderRadius:'50%',animation:'m1spin .8s linear infinite',flexShrink:0}}/>
                  <div style={{fontSize:13,color:D.textMid}}>
                    {m2Paso===1?'Extrayendo hook y cuerpo, evaluando compatibilidad...':'Fusionando hook + cuerpo...'}
                  </div>
                </div>
              )}
            </>
          )}

          {modo === 'metodo3' && (
            <>
              {/* Indicador de pasos */}
              <div style={{display:'flex',gap:6,marginBottom:10,justifyContent:'center'}}>
                {[
                  {n:1,txt:'Tu guion ganador'},
                  {n:2,txt:'Revisar estructura'},
                  {n:3,txt:'2 versiones nuevas'}
                ].map(p=>(
                  <div key={p.n} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,
                    color:m3Paso===p.n?D.blue:m3Paso>p.n?D.green:D.textFaint,fontWeight:m3Paso===p.n?700:500}}>
                    <span style={{width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:700,color:'#fff',
                      background:m3Paso===p.n?D.blue:m3Paso>p.n?D.green:D.textFaint}}>{m3Paso>p.n?'✓':p.n}</span>
                    {p.txt}
                  </div>
                ))}
              </div>

              {/* ── PASO 1 — input del guion ganador ── */}
              {m3Paso === 1 && (
                <div style={crd}>
                  <div style={stepRow}><div style={stepNum}>M3</div><div style={stepLbl}>Reestructurar — Paso 1: Tu guion ganador</div></div>
                  <div style={fldLbl}>Pega el guion ganador que quieres reestructurar</div>
                  <div style={{fontSize:12,color:D.textDim,lineHeight:1.5,marginBottom:6}}>El sistema mantendrá su misma estructura narrativa pero con palabras 100% diferentes.</div>
                  <textarea value={m3GuionInput} onChange={e=>setM3GuionInput(e.target.value)} rows={9}
                    placeholder="Pega aquí el guion ganador validado..."
                    style={{...inp,minHeight:190,marginBottom:14}}/>
                  <div style={fldLbl}>Contexto adicional <span style={{color:D.textFaint,fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional)</span></div>
                  <textarea value={m3Contexto} onChange={e=>setM3Contexto(e.target.value)} rows={3}
                    placeholder="Qué producto vendes, qué avatar real, qué intención..."
                    style={{...inp,marginBottom:14}}/>
                  <button onClick={analizarMetodo3}
                    disabled={!nombreValido||!m3GuionInput.trim()||m3Cargando}
                    title={!nombreValido?'Escribe tu nombre primero':undefined}
                    style={{...btnMain,marginTop:0,opacity:(!nombreValido||!m3GuionInput.trim()||m3Cargando)?.5:1,cursor:(nombreValido&&m3GuionInput.trim()&&!m3Cargando)?'pointer':'not-allowed'}}>
                    {m3Cargando?'Analizando...':'🔍 Analizar estructura y palabras clave'}
                  </button>
                </div>
              )}

              {/* ── PASO 2 — revisar estructura + análisis ── */}
              {m3Paso === 2 && m3Analisis && (
                <>
                  <div style={crd}>
                    <div style={stepRow}><div style={stepNum}>M3</div><div style={stepLbl}>Paso 2: Revisar estructura</div></div>
                    <div style={{fontSize:13,fontWeight:600,color:D.blue,marginBottom:14}}>🎯 Estructura y análisis detectados — Revisa y corrige</div>

                    <div style={fldLbl}>Avatar</div>
                    <textarea value={m3Analisis.avatar||''} onChange={e=>setM3Campo('avatar',e.target.value)} rows={3}
                      style={{...inp,marginBottom:12}}/>

                    <div style={fldLbl}>Producto</div>
                    <input type="text" value={m3Analisis.producto||''} onChange={e=>setM3Campo('producto',e.target.value)}
                      style={{...inp,height:38,padding:'9px 12px',marginBottom:12}}/>

                    <div style={fldLbl}>Formato</div>
                    <select value={(m3Analisis.formato||'').toLowerCase().includes('imagen')?'imagen':'video'}
                      onChange={e=>setM3Campo('formato',e.target.value)} style={{...sel,marginBottom:12}}>
                      <option value="video">Video</option>
                      <option value="imagen">Imagen</option>
                    </select>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                      <div>
                        <div style={fldLbl}>Nivel de consciencia</div>
                        <select value={String(m3Analisis.nivel||'')} onChange={e=>setM3Campo('nivel',e.target.value)} style={sel}>
                          <option value="">—</option>
                          <option value="1">1 - Inconsciente</option>
                          <option value="2">2 - Consciente del problema</option>
                          <option value="3">3 - Consciente de la solución</option>
                          <option value="4">4 - Consciente del producto</option>
                          <option value="5">5 - Totalmente consciente</option>
                        </select>
                      </div>
                      <div>
                        <div style={fldLbl}>Motivo</div>
                        <select value={m3Analisis.motivo||''} onChange={e=>setM3Campo('motivo',e.target.value)} style={sel}>
                          <option value="">—</option>
                          {['Emocional','Funcional','Educativo','Aspiracional','Racional'].map(m=>(
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={fldLbl}>Ángulo</div>
                    <select value={m3Analisis.angulo||''} onChange={e=>setM3Campo('angulo',e.target.value)} style={{...sel,marginBottom:12}}>
                      <option value="">—</option>
                      {Object.keys(DOCTRINA_ANGULOS).map(a=>(
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>

                    <div style={fldLbl}>Tono</div>
                    <input type="text" value={m3Analisis.tono||''} onChange={e=>setM3Campo('tono',e.target.value)}
                      style={{...inp,height:38,padding:'9px 12px',marginBottom:0}}/>
                  </div>

                  {/* Palabras clave a evitar */}
                  <div style={crd}>
                    <div style={{fontSize:12,fontWeight:700,color:D.blue,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Palabras clave a evitar</div>
                    <div style={{fontSize:12,color:D.textDim,lineHeight:1.5,marginBottom:6}}>Separadas por coma. Las versiones nuevas no las usarán (usarán sinónimos).</div>
                    <textarea value={m3PalabrasClaveTexto} onChange={e=>setM3PalabrasClaveTexto(e.target.value)} rows={4}
                      placeholder="palabra1, palabra2, frase distintiva..."
                      style={{...inp,marginBottom:0}}/>
                  </div>

                  {/* FIX 4 — Estructura narrativa interna + razonamiento, plegados (avanzado) */}
                  <div style={{marginBottom:10}}>
                    <button onClick={()=>setM3VerEstructura(!m3VerEstructura)}
                      style={{background:'transparent',border:'none',color:D.blue,cursor:'pointer',fontSize:13,padding:'4px 0',fontFamily:'inherit'}}>
                      {m3VerEstructura?'▾':'▸'} Ver estructura narrativa interna (avanzado)
                    </button>
                    {m3VerEstructura && (
                      <>
                        <div style={{marginTop:8,...crd}}>
                          <div style={{fontSize:12,fontWeight:700,color:D.blue,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Estructura narrativa</div>
                          <div style={{display:'flex',flexDirection:'column',gap:10}}>
                            {m3Estructura.map((s,i)=>(
                              <div key={i} style={{border:`1px solid ${D.cardBorder}`,borderRadius:10,padding:12,background:D.accent}}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6,gap:8}}>
                                  <span style={{fontSize:11,fontWeight:700,color:D.blue}}>Paso {i+1}</span>
                                  <div style={{display:'flex',gap:4}}>
                                    <button onClick={()=>m3MoverPaso(i,-1)} disabled={i===0}
                                      style={{fontSize:11,padding:'2px 8px',border:`1px solid ${D.cardBorder}`,borderRadius:5,background:'#fff',color:D.textMid,cursor:i===0?'not-allowed':'pointer',fontFamily:'inherit',opacity:i===0?.4:1}}>↑ Subir</button>
                                    <button onClick={()=>m3MoverPaso(i,1)} disabled={i===m3Estructura.length-1}
                                      style={{fontSize:11,padding:'2px 8px',border:`1px solid ${D.cardBorder}`,borderRadius:5,background:'#fff',color:D.textMid,cursor:i===m3Estructura.length-1?'not-allowed':'pointer',fontFamily:'inherit',opacity:i===m3Estructura.length-1?.4:1}}>↓ Bajar</button>
                                    <button onClick={()=>m3EliminarPaso(i)}
                                      style={{fontSize:11,padding:'2px 8px',border:`1px solid #fecaca`,borderRadius:5,background:'#fff',color:'#dc2626',cursor:'pointer',fontFamily:'inherit'}}>❌ Eliminar</button>
                                  </div>
                                </div>
                                <div style={fldLbl}>Función</div>
                                <textarea value={s.funcion||''} onChange={e=>setM3PasoFuncion(i,e.target.value)} rows={2}
                                  style={{...inp,marginBottom:s.ejemplo?8:0,background:'#fff'}}/>
                                {s.ejemplo && (
                                  <div style={{fontSize:12,color:D.textDim,lineHeight:1.5,fontStyle:'italic'}}>
                                    Ejemplo del original: "{s.ejemplo}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <button onClick={m3AgregarPaso}
                            style={{marginTop:10,fontSize:12,padding:'7px 14px',border:`1px dashed ${D.blue}`,borderRadius:8,background:'transparent',color:D.blue,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                            + Agregar paso
                          </button>
                        </div>
                        {m3Analisis.razonamiento && (
                          <div style={{marginTop:8,...crd,background:D.accent}}>
                            <div style={{fontSize:12,fontWeight:700,color:D.blue,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>Razonamiento del análisis</div>
                            <div style={{fontSize:13,color:D.textMid,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{m3Analisis.razonamiento}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Collapse guion original */}
                  <div style={{marginBottom:10}}>
                    <button onClick={()=>setM3VerOriginal(!m3VerOriginal)}
                      style={{background:'transparent',border:'none',color:D.blue,cursor:'pointer',fontSize:13,padding:'4px 0',fontFamily:'inherit'}}>
                      {m3VerOriginal?'▾':'▸'} Ver guion original
                    </button>
                    {m3VerOriginal && (
                      <div style={{marginTop:8,...crd,background:D.accent}}>
                        <div style={{fontSize:13,color:D.textMid,lineHeight:1.6,whiteSpace:'pre-wrap',maxHeight:280,overflowY:'auto'}}>{m3GuionInput||'—'}</div>
                      </div>
                    )}
                  </div>

                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setM3Paso(1)} disabled={m3Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:9,background:'transparent',color:D.textMid,cursor:m3Cargando?'not-allowed':'pointer',fontFamily:'inherit',opacity:m3Cargando?.5:1}}>
                      ↩️ Volver y reanalizar
                    </button>
                    <button onClick={regenerarMetodo3} disabled={!nombreValido||m3Cargando||m3Estructura.length===0}
                      title={!nombreValido?'Escribe tu nombre primero':undefined}
                      style={{flex:2,padding:12,fontSize:13,fontWeight:600,border:'none',borderRadius:9,background:`linear-gradient(135deg,#1270a0,${D.blue})`,color:'#fff',cursor:(nombreValido&&!m3Cargando&&m3Estructura.length>0)?'pointer':'not-allowed',fontFamily:'inherit',opacity:(!nombreValido||m3Cargando||m3Estructura.length===0)?.5:1}}>
                      {m3Cargando?'Generando...':'🔄 Confirmar y generar 2 versiones'}
                    </button>
                  </div>
                </>
              )}

              {/* ── PASO 3 — 2 versiones nuevas ── */}
              {m3Paso === 3 && (
                <>
                  <div style={{fontSize:13,fontWeight:700,color:D.green,marginBottom:10,textAlign:'center'}}>
                    ✅ 2 versiones nuevas con misma estructura, palabras diferentes
                  </div>
                  {m3Versiones.map((v,i)=>(
                    <div key={i} style={crd}>
                      <div style={{fontSize:11,fontWeight:700,color:D.blue,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Versión {v.numero||i+1}</div>
                      <div style={{fontSize:12,fontWeight:700,color:D.textDim,marginBottom:2}}>🪝 Hook</div>
                      <div style={{fontSize:17,fontWeight:700,color:D.text,lineHeight:1.4,marginBottom:10}}>{v.hook}</div>
                      <div style={{fontSize:13,color:D.textMid,lineHeight:1.6,marginBottom:10}}>
                        <b style={{color:D.text}}>💡 Idea visual:</b> {v.ideaVisual}
                      </div>
                      <div style={fldLbl}>📜 Guion completo</div>
                      <textarea readOnly value={v.guionCompleto||''} rows={9}
                        style={{...inp,minHeight:180,marginBottom:10,background:D.accent}}/>
                      <button onClick={()=>copiarAlPortapapeles(v.guionCompleto||'','m3_gc_'+i)}
                        style={{fontSize:12,fontWeight:600,padding:'8px 14px',borderRadius:8,border:`1px solid ${D.blue}`,background:copiadoKey==='m3_gc_'+i?D.green:D.blueDark,color:copiadoKey==='m3_gc_'+i?'#fff':D.blue,cursor:'pointer',fontFamily:'inherit'}}>
                        {copiadoKey==='m3_gc_'+i?'✓ Copiado':'📋 Copiar guion completo'}
                      </button>
                      <div style={{marginTop:10}}>
                        <button onClick={()=>setM3VerDetalleVersion(prev=>({...prev,[i]:!prev[i]}))}
                          style={{background:'transparent',border:'none',color:D.blue,cursor:'pointer',fontSize:13,padding:'4px 0',fontFamily:'inherit'}}>
                          {m3VerDetalleVersion[i]?'▾':'▸'} Ver detalles
                        </button>
                        {m3VerDetalleVersion[i] && (
                          <div style={{marginTop:6,fontSize:12,color:D.textMid,lineHeight:1.6}}>
                            {Array.isArray(v.palabrasOriginalEvitadas) && v.palabrasOriginalEvitadas.length>0 && (
                              <div style={{marginBottom:6}}>
                                <b style={{color:D.text}}>Palabras del original evitadas:</b> {v.palabrasOriginalEvitadas.join(', ')}
                              </div>
                            )}
                            {v.estructuraSeguida && (
                              <div><b style={{color:D.text}}>Estructura seguida:</b> {v.estructuraSeguida}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setM3Paso(2)} disabled={m3Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.cardBorder}`,borderRadius:9,background:'transparent',color:D.textMid,cursor:m3Cargando?'not-allowed':'pointer',fontFamily:'inherit',opacity:m3Cargando?.5:1}}>
                      ↩️ Volver a revisar
                    </button>
                    <button onClick={regenerarMetodo3} disabled={!nombreValido||m3Cargando}
                      title={!nombreValido?'Escribe tu nombre primero':undefined}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.blue}`,borderRadius:9,background:D.blue,color:'#fff',cursor:(nombreValido&&!m3Cargando)?'pointer':'not-allowed',fontFamily:'inherit',fontWeight:600,opacity:(!nombreValido||m3Cargando)?.5:1}}>
                      {m3Cargando?'Regenerando...':'🔄 Regenerar 2 versiones'}
                    </button>
                    <button onClick={resetMetodo3} disabled={m3Cargando}
                      style={{flex:1,padding:12,fontSize:12,border:`1px solid ${D.blueDim}`,borderRadius:9,background:D.blueDark,color:D.blue,cursor:m3Cargando?'not-allowed':'pointer',fontFamily:'inherit',fontWeight:600,opacity:m3Cargando?.5:1}}>
                      🔄 Nuevo guion
                    </button>
                  </div>
                </>
              )}

              {m3Cargando && (
                <div style={{...crd,display:'flex',alignItems:'center',gap:12,marginTop:10}}>
                  <div style={{width:18,height:18,border:`2px solid ${D.blueDim}`,borderTopColor:D.blue,borderRadius:'50%',animation:'m1spin .8s linear infinite',flexShrink:0}}/>
                  <div style={{fontSize:13,color:D.textMid}}>
                    {m3Paso===1?'Desmontando la estructura narrativa del guion...':'Generando 2 versiones nuevas con la misma estructura...'}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
      )}
    </>
  )
}
