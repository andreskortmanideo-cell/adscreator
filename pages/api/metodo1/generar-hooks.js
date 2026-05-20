import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'
import { HOOKS_JEFE } from '../../../data/hooks-jefe'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { anuncioId, analisisConfirmado, hookOriginal, cuerpo, modelo, autor } = req.body || {}
    const analisis = analisisConfirmado || {}
    const cuerpoTxt = (cuerpo || '').toString().trim()
    const hookOrig = (hookOriginal || '').toString().trim()
    if (!cuerpoTxt) {
      return res.status(400).json({ error: 'cuerpo requerido' })
    }
    const modeloSel = (modelo || 'claude-haiku-4-5').toString()
    const motivo = (analisis.motivo || '').toString()
    const angulo = (analisis.angulo || '').toString()
    const nivel = analisis.nivel != null ? String(analisis.nivel) : ''
    const esVideo = (analisis.formato || '').toString().toLowerCase().includes('video')

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    // ── Referencias de hooks del jefe (data/hooks-jefe.js) ───────
    // HOOKS_JEFE son plantillas string; si en el futuro tuvieran metadata
    // {motivo, angulo} el filtro las selecciona, si no, todas pasan.
    const motivoLc = motivo.toLowerCase()
    const anguloLc = angulo.toLowerCase()
    const hooksFiltrados = HOOKS_JEFE.filter(h => {
      const matchMotivo = (h.motivo && h.motivo.toLowerCase().includes(motivoLc)) || !h.motivo
      const matchAngulo = (h.angulo && h.angulo.toLowerCase().includes(anguloLc)) || !h.angulo
      return matchMotivo && matchAngulo
    })
    const textoDeHook = h => typeof h === 'string' ? h : (h.texto || h.plantilla || h.hook || '')
    // Muestra aleatoria para variar las referencias entre llamadas
    const muestraInicial = (hooksFiltrados.length > 0 ? hooksFiltrados : HOOKS_JEFE)
      .slice()
      .sort(() => 0.5 - Math.random())
    // FIX: solo hooks cortos (≤9 palabras) como referencia — los largos
    // del jefe arrastraban al LLM a generar hooks demasiado largos.
    const muestraCorta = muestraInicial
      .filter(h => textoDeHook(h).trim().split(/\s+/).length <= 9)
      .slice(0, 15)
    const muestra = muestraCorta.length > 0 ? muestraCorta : muestraInicial.slice(0, 15)
    const refsHooks = muestra.map(h => '- ' + textoDeHook(h)).join('\n')

    // ── LLAMADA ÚNICA — 3 hooks + idea visual simple ─────────────
    const prompt = `Eres experto en publicidad de Meta Ads. Te doy un análisis ESTRATÉGICO YA CONFIRMADO por el usuario y un cuerpo de guion. Tu tarea es generar 3 HOOKS ALTERNATIVOS + IDEA VISUAL SIMPLE para cada uno.

ANÁLISIS CONFIRMADO (úsalo como autoridad, NO lo cuestiones):
${JSON.stringify(analisis)}

REFERENCIAS DE HOOKS DEL JEFE (úsalos como inspiración, NO copies literal, ADAPTA al producto y avatar específico):
${refsHooks}

Estos son hooks curados que funcionan en publicidad. Tu hook generado debe sentirse en la misma línea estilística (no genérico, no anuncio tradicional, con gancho real). NO los uses literalmente; toma su tono y energía.

CUERPO DEL GUION:
${cuerpoTxt}

HOOK ORIGINAL (referencia, no copies):
${hookOrig}

REQUISITOS DE LOS HOOKS:

REGLA INVIOLABLE DE LONGITUD DEL HOOK:
- IDEAL: 5-7 palabras.
- MÁXIMO ABSOLUTO: 9 palabras. NO MÁS.
- Una sola línea.
- Frase completa y autocontenida (no termina en preposición/conjunción/artículo).
- SIN puntos suspensivos al final.
- Aplica para video Y para imagen por igual.

EJEMPLOS BUENOS (5-9 palabras):
✅ "Mi mesa sobrevivió cinco años de niños" (7 palabras)
✅ "Cómo limpio manchas en 30 segundos" (6 palabras)
✅ "Mantel blanco después de cinco navidades" (6 palabras)
✅ "Mis amigas no creen que sea el mismo mantel" (9 palabras, en el límite)
✅ "El mantel que aguanta todo" (5 palabras)

EJEMPLOS MALOS (NO USAR, son demasiado largos):
❌ "Mis hijos derraman jugo, yo paso un paño y desaparece. Mis amigas creen que cambié de mesa." (17 palabras, MUY largo)
❌ "¿Cómo hago que la mesa se vea nueva después de que los niños la destrocen?" (15 palabras, MUY largo)
❌ "No me canso de limpiar la mesa con esto" (9 palabras y termina mal, NO autónoma)

REGLA DE VERIFICACIÓN ANTES DE RESPONDER:
1. Cuenta las palabras de tu hook. Si pasa de 9 → REESCRÍBELO MÁS CORTO.
2. ¿Es una sola línea sin puntos suspensivos? Si no → CORRIGE.
3. ¿Termina en palabra fuerte (sustantivo, verbo, adjetivo)? Si no → REESCRIBE.

PRIORIDAD: si la plantilla del jefe que tomaste como inspiración es larga, ADAPTA acortando, NUNCA copies plantillas largas literalmente.

OTROS REQUISITOS:
- Mantén MISMO motivo "${motivo}", ÁNGULO "${angulo}", NIVEL "${nivel}".
- Si nivel es 1 o 2: NO menciones producto, marca, mecanismo. Foco en dolor/curiosidad.
- Si nivel es 3, 4 o 5: puedes mencionar el producto/solución.
- Cada hook con DIFERENTE entrada estratégica (problema, curiosidad, dato, prueba social).
- Que fluya con el cuerpo dado.

REQUISITOS DE LA IDEA VISUAL — REGLA DE ORO: DEBE DETENER EL SCROLL EN 0.5 SEGUNDOS.

Contexto: el usuario está scrolleando TikTok/Reels/Facebook. Cada video tiene 0.5 segundos para enganchar antes de que pase al siguiente. Una escena "normal" o "tranquila" NO funciona. La idea visual debe:

1. SORPRENDER o crear CONFLICTO inmediato en el primer segundo.
2. Mostrar el PROBLEMA en su momento más dramático, no después de resuelto.
3. Generar curiosidad ("qué pasó", "cómo termina"), no resolución.
4. Ser MEMORABLE, no cotidiana.

CRITERIOS DE "SCROLL-STOPPING":
- ✅ Pattern interrupt: algo inesperado, fuera de lo normal.
- ✅ Drama visual: una mancha gigante, un derrame en cámara lenta, una reacción extrema (cara de horror, frustración real, sorpresa).
- ✅ Contraste extremo: antes vs después dramático.
- ✅ Momento de tensión: algo a punto de pasar / acabando de pasar.
- ✅ POV intrigante: "POV: tú al despertar y ver X", "POV: tu mantel después de la cena de Navidad".
- ✅ Relatable + exagerado: situaciones reales pero en su versión más dramática.

LO QUE NUNCA FUNCIONA:
- ❌ Personas sonriendo limpiando tranquilas.
- ❌ Escenas resueltas, felices, sin conflicto.
- ❌ Familia comiendo en armonía sin drama.
- ❌ Persona aplicando producto satisfecha.
- ❌ Cualquier cosa que se vea como anuncio tradicional de TV.

REGLA: debe verse como contenido NATIVO de TikTok, no como anuncio.

EJEMPLOS BUENOS (para mantel anti-manchas):
✅ "Niño volcando un vaso entero de jugo de uva morado sobre el mantel blanco recién puesto en plena cena"
✅ "POV: abres la puerta del comedor después de que los niños 'almorzaron solos'. El mantel destrozado."
✅ "Mancha gigante de salsa boloñesa expandiéndose en el mantel mientras la persona se queda paralizada con la cara de no creerlo"
✅ "Tu mantel después de la primera comida vs después de 6 meses con manchas de café, vino y comida"
✅ "Una mano apretando un vaso de vino tinto sobre la mesa, el vaso resbala y cae en cámara lenta"

EJEMPLOS MALOS (NO usar, son demasiado tranquilos):
❌ "Una madre limpiando una mancha con su mantel"
❌ "Familia comiendo tranquila con mantel impecable"
❌ "Persona sonriendo mientras pone el mantel"
❌ "Mujer aplicando el producto satisfecha"

REGLAS QUE SIGUEN APLICANDO:
- Sin jerga técnica audiovisual (no close-up, no plano, no movimiento de cámara).
- Escena rodable con celular, estilo UGC.
- Respetar políticas de Meta (no violencia gráfica, no menores en sit. inapropiada, no claims médicos extremos, no contenido engañoso).
- "Drama" significa emoción real, NO violencia real.

La idea visual debe describir la ESCENA, en 1-2 frases naturales, enfocada en el MOMENTO DE MAYOR IMPACTO.

POLÍTICAS DE META (RESPETAR):
- NO violencia gráfica, sangre, lesiones.
- NO desnudos, sexual.
- NO claims médicos específicos.
- NO menores de manera inapropiada.
- NO promesas extremas.
- NO dinero ostentoso, armas, drogas.

REGLA CRÍTICA DE LENGUAJE — ESPAÑOL COLOMBIANO COTIDIANO:

- Usa español colombiano neutro/coloquial, como se habla en Bogotá/Medellín/Cali.
- NO uses regionalismos de otros países hispanohablantes.
- El producto se vende en Colombia.

PALABRAS PROHIBIDAS (de otros países):
❌ "flipar", "flipé", "molar", "tío/tía" (como vocativo), "guay", "vale" como afirmación, "joder" (España)
❌ "chingar", "pinche", "naco", "chido", "padre" (como bueno) (México)
❌ "boludo", "che", "quilombo", "pibe", "laburo" (Argentina)
❌ "huevón" (como insulto cariñoso, en Colombia se entiende pero no se usa así)
❌ Anglicismos innecesarios: "cool", "fancy", "must have"

PALABRAS Y EXPRESIONES OK (colombianas/neutras):
✅ "bacano", "chévere", "qué nota"
✅ "qué tal", "qué pasada", "no se cree"
✅ "increíble", "impresionante", "tremendo"
✅ "una berraquera", "un parche"
✅ "no más", "ya no más"

IMPORTANTE: el español debe sentirse natural y cotidiano para un colombiano leyendo esto en su feed, NO acartonado ni regional de otro país.

OUTPUT JSON ESTRICTO:
{
  "hooks": [
    {
      "texto": "el nuevo hook",
      "ideaVisual": "escena concreta y simple en 1-2 frases naturales",
      "guionCompleto": "hook nuevo + cuerpo unidos en una sola pieza lista para copiar",
      "advertenciaMeta": "si hay riesgo, lo notas. Si no, 'Cumple políticas'"
    }
  ]
}

Devuelve EXACTAMENTE 3 objetos dentro de "hooks".`

    const r = await llamarModelo(modeloSel, prompt, 3000)
    registrarLlamada('metodo1-generacion', r.inputTokens, r.outputTokens)

    const mapHook = h => ({
      texto: (h.texto || '').toString(),
      ideaVisual: (h.ideaVisual || '').toString(),
      guionCompleto: (h.guionCompleto || ((h.texto || '') + '\n\n' + cuerpoTxt)).toString(),
      advertenciaMeta: (h.advertenciaMeta || 'Cumple políticas').toString()
    })

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudieron interpretar los hooks generados: ' + e.message })
    }
    const hooks = Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 3).map(mapHook) : []
    if (hooks.length === 0) {
      return res.status(502).json({ error: 'El modelo no devolvió hooks alternativos' })
    }

    // ── FIX 3 — Validador de longitud (defensa de último recurso) ─
    const palabrasMalas = ['de','del','a','la','el','los','las','en','con','un','una','y','o','pero','que','para','por','sobre','sin','si','no','su','sus','mi','mis','tu','tus']
    const validarHook = (texto) => {
      if (!texto) return false
      const limpio = texto.trim().replace(/\.{3}$/, '').replace(/[.!?¿¡,;:]+$/, '').trim()
      const palabras = limpio.split(/\s+/)
      if (palabras.length > 9) return false            // demasiado largo
      const ultima = (palabras[palabras.length - 1] || '').toLowerCase()
      if (palabrasMalas.includes(ultima)) return false // termina mal
      return true
    }

    let hooksFinal = hooks.filter(h => validarHook(h.texto))

    // Si quedaron menos de 3 hooks válidos → 1 reintento más estricto
    if (hooksFinal.length < 3) {
      try {
        const promptReintento = prompt + '\n\n═══ CORRECCIÓN OBLIGATORIA ═══\nTU INTENTO ANTERIOR FALLÓ: generaste hooks de más de 9 palabras. Hooks de más de 9 palabras NO se aceptan. Genera 3 hooks de MÁXIMO 9 palabras (ideal 5-7), una sola línea, sin puntos suspensivos, frase completa que termine en palabra fuerte.'
        const r2 = await llamarModelo(modeloSel, promptReintento, 3000)
        registrarLlamada('metodo1-generacion (reintento)', r2.inputTokens, r2.outputTokens)
        const parsed2 = parseJsonTolerante(r2.texto)
        const hooks2 = Array.isArray(parsed2.hooks) ? parsed2.hooks.slice(0, 3).map(mapHook) : []
        const hooks2Validos = hooks2.filter(h => validarHook(h.texto))
        if (hooks2Validos.length > hooksFinal.length) hooksFinal = hooks2Validos
      } catch (e) {
        console.error('Reintento Método 1 (longitud) falló:', e)
      }
    }

    // Si tras el reintento aún quedan < 3 se devuelven los válidos que
    // haya; si el validador descartó TODO, se cae a los originales.
    const hooksDevolver = hooksFinal.length > 0 ? hooksFinal : hooks

    // ── Auto-save: suma versión de generación al anuncio ─────────
    let idAnuncio = anuncioId ? Number(anuncioId) : null
    try {
      if (!idAnuncio) {
        // Defensivo: si el análisis no creó anuncio, lo creamos ahora.
        idAnuncio = crearAnuncio({
          autor: (autor || '').toString().trim() || 'Anónimo',
          producto: (analisis.producto || ('Variar Hook — ' + hookOrig)).toString().slice(0, 200),
          avatar: (analisis.avatar || '').toString().slice(0, 300),
          formato: (analisis.formato || '').toString(),
          duracion: (analisis.duracion || '').toString(),
          nivel,
          motivo,
          angulo,
          modelo: modeloSel,
          metodoPrincipal: 'metodo1',
          briefingJson: { modo: 'metodo1' }
        })
      }
      agregarVersion(idAnuncio, {
        tipo: 'metodo1-generacion',
        modelo: modeloSel,
        costoUsd: costoOperacion.totales.usd,
        costoCop: costoOperacion.totales.cop,
        inputTokens: costoOperacion.totales.inputTokens,
        outputTokens: costoOperacion.totales.outputTokens,
        contenido: {
          modo: 'metodo1',
          m1Paso: 3,
          m1Analisis: analisis,
          m1HookOriginal: hookOrig,
          m1Cuerpo: cuerpoTxt,
          m1Hooks: hooksDevolver
        }
      })
    } catch (e) {
      console.error('Auto-save Método 1 (generación) falló:', e)
    }

    return res.status(200).json({ hooks: hooksDevolver, costoOperacion, anuncioId: idAnuncio })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
