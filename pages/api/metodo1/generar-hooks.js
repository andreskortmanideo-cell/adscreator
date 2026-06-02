import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'
import { HOOKS_JEFE } from '../../../data/hooks-jefe'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { anuncioId, analisisConfirmado, hookOriginal, cuerpo, modelo, autor, correccionUsuario } = req.body || {}
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

    // ── Pool de plantillas del jefe (data/hooks-jefe.js) ───────
    // HOOKS_JEFE son plantillas string con placeholders ___ y #
    // El LLM DEBE elegir 3 plantillas distintas y rellenarlas
    const textoDeHook = h => typeof h === 'string' ? h : (h.texto || h.plantilla || h.hook || '')
    // Filtrar plantillas que el LLM pueda usar para hooks cortos (5-9 palabras una vez rellenas)
    // Las plantillas ≤7 palabras suelen quedar en rango con placeholders rellenos
    const plantillasUsables = HOOKS_JEFE
      .filter(h => {
        const t = textoDeHook(h).trim()
        const palabras = t.split(/\s+/).length
        return palabras >= 3 && palabras <= 9
      })
      .slice() // copia para no mutar el original

    // Filtrar plantillas listicle suaves que producen hooks tibios
    const arranquesTibios = [
      /^cómo\s/i, /^como\s/i,
      /^maneras\s/i,
      /^formas\s/i,
      /^# (consejos|maneras|formas|trucos|ideas|cosas)/i,
      /^# pasos para/i,
      /^# razones por las que/i,
      /^combate/i,
      /^descubre/i,
      /^conoce/i
    ]
    const plantillasSinTibias = plantillasUsables.filter(h => {
      const t = textoDeHook(h).trim().toLowerCase()
      return !arranquesTibios.some(rgx => rgx.test(t))
    })

    // Tomar muestra aleatoria de 50 SIN tibias (si hay suficientes)
    const baseMuestra = plantillasSinTibias.length >= 30 ? plantillasSinTibias : plantillasUsables
    const muestra = baseMuestra
      .sort(() => 0.5 - Math.random())
      .slice(0, 50)

    const plantillasNumeradas = muestra.map((h, i) => `${i + 1}. ${textoDeHook(h)}`).join('\n')

    // ── LLAMADA ÚNICA — 3 hooks + idea visual simple ─────────────
    let prompt = `Eres experto en publicidad de Meta Ads. Te doy un análisis ESTRATÉGICO YA CONFIRMADO por el usuario y un cuerpo de guion. Tu tarea es generar 3 HOOKS ALTERNATIVOS + IDEA VISUAL SIMPLE para cada uno.

ANÁLISIS CONFIRMADO (úsalo como autoridad, NO lo cuestiones):
${JSON.stringify(analisis)}

═══════════════════════════════════════════════════
PLANTILLAS DEL JEFE — OBLIGATORIO USAR

A continuación tienes 50 plantillas curadas por el jefe. Estas plantillas tienen DOS tipos de placeholders:

- "___" = se reemplaza con palabras coherentes con el producto, avatar o contexto del anuncio
- "#" = se reemplaza con un número específico (3, 5, 7 son los más comunes)

REGLA INVIOLABLE: NO INVENTES HOOKS DESDE CERO. Debes ELEGIR 3 plantillas DISTINTAS de la lista y RELLENAR los placeholders adaptando al producto, avatar y análisis confirmado.

PLANTILLAS DISPONIBLES (elige 3 DIFERENTES):
${plantillasNumeradas}

═══════════════════════════════════════════════════
TONO DEL HOOK — REGLA CRÍTICA DE PROVOCACIÓN

Los hooks tibios NO funcionan en Meta Ads. El usuario está scrolleando rápido y solo se detiene ante un hook que GENERE TENSIÓN, CURIOSIDAD o IDENTIFICACIÓN INSTANTÁNEA.

ARRANQUES PROHIBIDOS (suenan a anuncio antiguo o blog):
❌ "Cómo evitar..." / "Cómo X para siempre"
❌ "Tres formas de..." / "5 maneras de..."
❌ "Combate la..." / "Elimina la..."
❌ "Descubre cómo..." / "Conoce el truco..."
❌ "Aprende a..." / "Consigue el..."

ARRANQUES DESEADOS (crudos, provocadores, en primera persona):
✅ Dolor en primera persona: "No aguantaba más...", "Pasaba años...", "Ya no podía..."
✅ Provocación directa al espectador: "No raspes otro...", "Deja de frotar...", "Para de gastar..."
✅ Confesión cruda: "Estaba a punto de cambiar de oficio...", "Casi tiro la toalla..."
✅ Cifra dura con contraste: "Tres horas a veinte minutos...", "Diez días sin..."
✅ Curiosidad con tensión: "Lo que nadie te dijo sobre...", "Por qué seguías..."
✅ Pregunta provocadora con número: "¿Cuántas horas pierdes al día...?"

TEST FINAL ANTES DE ENTREGAR EL HOOK:
Léelo en voz alta. Pregúntate:
- ¿Sueno como una persona REAL contando su experiencia? ✅
- ¿Sueno como un comercial de TV de los 90? ❌ REESCRIBE
- ¿Una tía cualquiera podría leerlo en su feed y pensar "este me habla a mí"? ✅
- ¿Suena a artículo de blog o de revista? ❌ REESCRIBE

EJEMPLOS DE PARES (mismo significado, distinto tono):

❌ TIBIO: "Cómo evitar rozaduras incómodas para siempre"
✅ CRUDO: "Diez días sin rozaduras cambiaron mi vida"

❌ TIBIO: "Tres formas de terminar con la incomodidad"
✅ CRUDO: "No aguantaba más ese picor diario"

❌ TIBIO: "Combate la grasa incrustada con alta presión"
✅ CRUDO: "Deja de frotar dos horas para limpiar en cinco"

❌ TIBIO: "Descubre cómo limpiar tu motor rápido"
✅ CRUDO: "Mi espalda no aguantaba otra hora raspando"

═══════════════════════════════════════════════════

INSTRUCCIONES:
1. ANALIZA el cuerpo del anuncio, el producto y el avatar
2. ELIGE 3 plantillas que mejor encajen con el dolor/beneficio/transformación del producto
3. RELLENA los placeholders ___ con palabras del producto/avatar
4. RELLENA los placeholders # con un número apropiado (3, 5, 7 típicamente)
5. Las 3 plantillas elegidas DEBEN SER DISTINTAS entre sí (no repetir número de plantilla)
6. NO copies el hook original (es referencia, no para repetir)
7. REGLA DE COHERENCIA HOOK-CUERPO (CRÍTICA):
   El hook NO puede contradecir lo que afirma el cuerpo del anuncio.
   - Si el cuerpo confirma que el producto funciona → el hook NO puede sugerir que falla
   - Si el cuerpo cuenta resultado positivo → el hook NO puede ser negativo del producto
   - Si el cuerpo afirma X → el hook puede provocar curiosidad sobre X, pero NO negarlo

EJEMPLOS:
❌ INCORRECTO (contradicción):
   Hook: "Por qué los hombres dejan la depiladora sin usar"
   Cuerpo: "Hombres como yo ya lo usan en secreto"
   (Hook dice que dejan, cuerpo dice que usan → contradicción)

✅ CORRECTO (curiosidad sin contradicción):
   Hook: "Por qué cambiarías de método para siempre"
   Cuerpo: "Hombres como yo ya lo usan en secreto"
   (Hook genera curiosidad, cuerpo refuerza la respuesta)

ANTES DE FINALIZAR CADA HOOK, pregúntate: "¿Este hook contradice algo del cuerpo?" — si la respuesta es sí, ELIGE OTRA PLANTILLA o reformula.

8. REGLA DE RELLENO DE PLACEHOLDERS (CRÍTICA):

Cuando rellenes los placeholders ___ de las plantillas, usa SIEMPRE palabras CONCRETAS del producto, del dolor o del avatar. NUNCA uses pronombres vagos.

PROHIBIDO RELLENAR ___ CON:
❌ "esto" / "eso" / "aquello"
❌ "algo" / "una cosa" / "lo que"
❌ "el problema" (sin especificar cuál)
❌ Adjetivos genéricos: "bueno", "increíble", "asombroso"

OBLIGATORIO RELLENAR ___ CON:
✅ Términos del campo del producto: "depilación", "rozaduras", "picor", "irritación", "piel", "limpieza", "grasa", "motor", etc. (extraídos del cuerpo del anuncio)
✅ Palabras del dolor del avatar: "esa incomodidad diaria", "ese ardor", "esa frustración"
✅ Resultados concretos: "diez días", "veinte minutos", "cinco minutos"
✅ El producto o categoría: "esta depiladora", "esta crema", "esta pulverizadora"

═══════════════════════════════════════════════════
TEST DE GENERICIDAD OBLIGATORIO ANTES DE ENTREGAR CADA HOOK:

El hook DEBE contener al menos UNA palabra extraída del cuerpo del anuncio que vas a procesar (no del cuerpo de los ejemplos, del que TÚ tienes ahora arriba).

Lee el cuerpo del anuncio, identifica las palabras clave del producto/dolor/avatar específicas de ESTE caso, y úsalas.

EJEMPLOS DEL PATRÓN (para que entiendas la regla, NO para copiar palabras):

EJEMPLO 1 — Producto: pulverizadora para mecánicos
Cuerpo menciona: "grasa, motor, taller, manguera, tres horas"
✅ "Pasé de tres horas a veinte minutos en el taller" (contiene "tres horas", "taller")
❌ "Esto me cambió la rutina" (no contiene NADA del cuerpo)

EJEMPLO 2 — Producto: depiladora masculina
Cuerpo menciona: "rozaduras, picor, piel, diez días, confianza"
✅ "Diez días sin rozaduras cambiaron todo" (contiene "diez días", "rozaduras")
❌ "Te prometo alivio como nunca" (no contiene NADA específico)

EJEMPLO 3 — Producto: mantel impermeable
Cuerpo menciona: "vino, manchas, niños, cinco años, plástico"
✅ "Cinco años sobreviviendo derrames de niños" (contiene "cinco años", "niños")
❌ "Por fin algo que funciona" (genérico, podría ser cualquier producto)

REGLA UNIVERSAL: si tu hook se puede usar tal cual con OTRO producto distinto, es genérico. Si solo tiene sentido con el producto del cuerpo actual, está bien.
═══════════════════════════════════════════════════

EJEMPLO DE BUEN RELLENO:
Plantilla: "___ hasta descubrir ___"
❌ MAL: "Esto me estaba matando hasta descubrir esto"
✅ BIEN: "El picor diario me mataba hasta encontrar esta crema"

Plantilla: "# secretos que ___ no quieren que sepas"
❌ MAL: "5 secretos que los hombres no quieren que sepas"
✅ BIEN: "5 secretos de depilación que los expertos no dicen"

ANTES DE ENTREGAR CADA HOOK, verifica:
1. ¿Contiene al menos UNA palabra del campo del producto? (depilación, piel, rozaduras, etc.)
2. ¿Podría leerse SOLO y reconocer de qué producto habla?
3. ¿Evita pronombres vagos como "esto"/"eso"?

Si la respuesta a alguna es NO, REGENERA con palabras concretas.

EJEMPLO DEL FORMATO DE RESPUESTA:
Plantilla #15: "# señales de que estás ___"
HOOK FINAL: "5 señales de que necesitas otra herramienta"
(reemplazaste # por 5, y ___ por "necesitas otra herramienta" adaptado al producto)
═══════════════════════════════════════════════════

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

ÚLTIMO CHECK ANTES DE RESPONDER:
1. Ningún hook empieza con "Cómo", "Tres formas", "Descubre", "Combate", "Conoce", "Aprende a"
2. Cada hook suena a persona real, no a anuncio tradicional
3. Cada hook tiene tensión/curiosidad/dolor crudo en sus primeras 3 palabras

Si algún hook falla estas verificaciones, REESCRIBE con otra plantilla y otro arranque.

OUTPUT JSON ESTRICTO:
{
  "hooks": [
    {
      "plantillaUsada": "<número de plantilla del pool>",
      "plantillaOriginal": "<texto exacto de la plantilla elegida>",
      "texto": "<hook final con placeholders rellenos, 5-9 palabras>",
      "ideaVisual": "escena concreta y simple en 1-2 frases naturales",
      "guionCompleto": "hook nuevo + cuerpo unidos en una sola pieza lista para copiar",
      "advertenciaMeta": "si hay riesgo, lo notas. Si no, 'Cumple políticas'"
    }
  ]
}

Devuelve EXACTAMENTE 3 objetos dentro de "hooks". Las 3 plantillas DEBEN ser distintas (no repetir número de plantilla).`

    // ── PARTE 6 — corrección opcional del usuario (regenerar con ajuste) ──
    if (correccionUsuario && correccionUsuario.toString().trim()) {
      prompt += '\n\nCORRECCIÓN DEL USUARIO (aplica este ajuste a los 3 hooks): ' + correccionUsuario.toString().trim()
    }

    const r = await llamarModelo(modeloSel, prompt, 3000)
    registrarLlamada('metodo1-generacion', r.inputTokens, r.outputTokens)

    const mapHook = h => ({
      plantillaUsada: (h.plantillaUsada != null ? h.plantillaUsada : '').toString(),
      plantillaOriginal: (h.plantillaOriginal || '').toString(),
      texto: (h.texto || '').toString(),
      ideaVisual: (h.ideaVisual || '').toString(),
      guionCompleto: (h.guionCompleto || ((h.texto || '') + '\n\n' + cuerpoTxt)).toString(),
      advertenciaMeta: (h.advertenciaMeta || 'Cumple políticas').toString()
    })

    function extraerPalabrasClave(cuerpo, analisis) {
      // Palabras del cuerpo (sustantivos significativos, ≥4 caracteres)
      const palabrasComunes = new Set([
        'pero', 'para', 'como', 'cuando', 'donde', 'porque', 'desde', 'hasta',
        'cada', 'todo', 'todos', 'todas', 'esto', 'eso', 'esta', 'este', 'estos',
        'estas', 'algo', 'nada', 'mucho', 'muchos', 'muchas', 'poco', 'pocos',
        'que', 'con', 'sin', 'por', 'una', 'uno', 'unos', 'unas', 'ese',
        'mas', 'menos', 'tambien', 'aqui', 'alli', 'ahi', 'siempre', 'nunca',
        'antes', 'ahora', 'despues', 'mientras', 'tener', 'haber', 'estar',
        'hacer', 'poder', 'querer', 'saber', 'decir', 'venir', 'salir',
        'dejar', 'pasar', 'sentir', 'mira', 'observa', 'fijate'
      ])
      const palabras = (cuerpo || '').toLowerCase()
        .replace(/[.,!?¿¡:;()"']/g, ' ')
        .split(/\s+/)
        .filter(p => p.length >= 4 && !palabrasComunes.has(p))
      // Agregar palabras del análisis (producto, avatar, etc.)
      const extras = []
      if (analisis?.producto) extras.push(...analisis.producto.toLowerCase().split(/\s+/).filter(p => p.length >= 4))
      if (analisis?.avatar) extras.push(...analisis.avatar.toLowerCase().split(/\s+/).filter(p => p.length >= 4))
      return new Set([...palabras, ...extras])
    }

    function detectarGenericidad(hookTexto, cuerpoTxt, analisis) {
      if (!hookTexto) return { generico: true, razon: 'vacio' }
      const t = hookTexto.toLowerCase()
      // Extraer palabras del hook (≥4 caracteres)
      const palabrasHook = t.replace(/[.,!?¿¡:;()"']/g, ' ').split(/\s+/).filter(p => p.length >= 4)
      const palabrasClave = extraerPalabrasClave(cuerpoTxt, analisis)
      // Buscar coincidencias (al menos 1 palabra clave del cuerpo debe estar en el hook)
      const coincidencias = palabrasHook.filter(p => {
        // Coincidencia exacta o si la palabra del hook contiene la clave (ej: "depilarte" contiene "depil")
        for (const clave of palabrasClave) {
          if (p.includes(clave.substring(0, 5)) || clave.includes(p.substring(0, 5))) return true
        }
        return false
      })
      if (coincidencias.length === 0) {
        return { generico: true, razon: 'no contiene ninguna palabra clave del producto/dolor' }
      }
      return { generico: false, coincidencias }
    }

    function detectarTibieza(hookTexto) {
      if (!hookTexto) return { tibio: false }
      const t = hookTexto.toLowerCase()

      // Adjetivos publicitarios prohibidos
      const adjetivosTibios = [
        'asombroso', 'asombrosa', 'asombrosos', 'asombrosas',
        'increíble', 'increible', 'increíbles', 'increibles',
        'tremendo', 'tremenda', 'tremendos', 'tremendas',
        'maravilloso', 'maravillosa',
        'fantástico', 'fantastica', 'fantastico',
        'espectacular', 'espectaculares',
        'fabuloso', 'fabulosa',
        'extraordinario', 'extraordinaria',
        'sorprendente', 'sorprendentes',
        'revolucionario', 'revolucionaria'
      ]

      // Arranques publicitarios prohibidos (refuerzo de Parte A original)
      const arranquesProhibidos = [
        /^la asombrosa /i, /^la increíble /i, /^la increible /i,
        /^observa cómo /i, /^observa como /i,
        /^mira cómo /i, /^mira como /i,
        /^descubre /i, /^conoce /i,
        /^aprende /i, /^encuentra /i,
        /^combate /i, /^elimina /i
      ]

      // 1. Detectar adjetivo tibio
      for (const adj of adjetivosTibios) {
        const regex = new RegExp(`\\b${adj}\\b`, 'i')
        if (regex.test(t)) {
          return { tibio: true, razon: `adjetivo publicitario tibio: "${adj}"` }
        }
      }

      // 2. Detectar arranque publicitario
      for (const rgx of arranquesProhibidos) {
        if (rgx.test(hookTexto.trim())) {
          return { tibio: true, razon: `arranque publicitario: "${hookTexto.trim().split(' ').slice(0,3).join(' ')}..."` }
        }
      }

      return { tibio: false }
    }

    // Detectar contradicción simple por palabras opuestas
    function detectarContradiccion(hookTexto, cuerpoTexto) {
      if (!hookTexto || !cuerpoTexto) return false
      const h = hookTexto.toLowerCase()
      const c = cuerpoTexto.toLowerCase()
      const pares = [
        ['no funciona', 'funciona'],
        ['dejan de usar', 'lo usan'],
        ['no sirve', 'sirve'],
        ['no recomendado', 'recomendado'],
        ['fracaso', 'éxito']
      ]
      for (const [negativo, positivo] of pares) {
        if (h.includes(negativo) && c.includes(positivo)) return true
      }
      return false
    }

    function validarHooksDelJefe(hooks, hookOriginal, cuerpoTxt, analisis) {
      const advertencias = []
      const plantillasUsadas = new Set()
      hooks.forEach((h, i) => {
        if (!h.plantillaUsada) {
          advertencias.push(`Hook ${i+1}: no reporta plantilla usada`)
        }
        if (plantillasUsadas.has(h.plantillaUsada)) {
          advertencias.push(`Hook ${i+1}: plantilla ${h.plantillaUsada} REPETIDA`)
        }
        plantillasUsadas.add(h.plantillaUsada)
        const palabras = (h.texto || '').split(/\s+/).length
        if (palabras > 9) {
          advertencias.push(`Hook ${i+1}: ${palabras} palabras (>9)`)
        }
        if (detectarContradiccion(h.texto, cuerpoTxt)) {
          advertencias.push(`Hook ${i+1}: CONTRADICCIÓN con cuerpo detectada`)
        }
        const gen = detectarGenericidad(h.texto, cuerpoTxt, analisis)
        if (gen.generico) {
          advertencias.push(`Hook ${i+1}: GENÉRICO (${gen.razon})`)
        }
        const tib = detectarTibieza(h.texto)
        if (tib.tibio) {
          advertencias.push(`Hook ${i+1}: TIBIO (${tib.razon})`)
        }
      })
      return advertencias
    }

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

    const advertencias = validarHooksDelJefe(hooksDevolver, hookOrig, cuerpoTxt, analisis)
    if (advertencias.length > 0) {
      console.log('[M1 PLANTILLAS]', advertencias)
    }

    // Si hay 1 o más hooks tibios, reintentar UNA vez con prompt reforzado
    const hooksTibios = advertencias.filter(a => a.includes('TIBIO'))
    if (hooksTibios.length > 0 && hooksTibios.length < 3) {
      console.log('[M1 REINTENTO TIBIEZA]', hooksTibios)
      try {
        const promptReintentoTibieza = prompt +
          '\n\n═══ CORRECCIÓN OBLIGATORIA ═══\n' +
          'TU INTENTO ANTERIOR USÓ ADJETIVOS PUBLICITARIOS PROHIBIDOS COMO "asombrosa", "increíble", "tremenda" o ARRANQUES PROHIBIDOS COMO "La asombrosa...", "Observa cómo...", "Mira cómo...".\n' +
          'ESTOS ADJETIVOS Y ARRANQUES NO SE ACEPTAN. SUENAN A COMERCIAL DE TV DE LOS 90.\n' +
          'Regenera los 3 hooks usando arranques CRUDOS Y PROVOCADORES:\n' +
          '- Dolor en primera persona ("No aguantaba...", "Pasaba años...")\n' +
          '- Provocación al espectador ("Deja de...", "No raspes otro...")\n' +
          '- Cifra dura con contraste ("Tres horas a veinte minutos...")\n' +
          '- Pregunta directa con tensión ("¿Cuántas horas pierdes...?")\n' +
          'NO uses adjetivos vagos ni arranques de "Observa", "Mira", "Descubre", "La asombrosa".'

        const r2 = await llamarModelo(modeloSel, promptReintentoTibieza, 3000)
        registrarLlamada('metodo1-generacion (reintento tibieza)', r2.inputTokens, r2.outputTokens)
        const parsed2 = parseJsonTolerante(r2.texto)
        const hooks2 = Array.isArray(parsed2.hooks) ? parsed2.hooks.slice(0, 3).map(mapHook) : []

        // Validar que el reintento no tenga tibieza
        const hooks2SinTibieza = hooks2.filter(h => !detectarTibieza(h.texto).tibio && validarHook(h.texto))

        // Si el reintento mejora la cantidad de hooks sin tibieza, usarlo
        const hooksActualesSinTibieza = hooksDevolver.filter(h => !detectarTibieza(h.texto).tibio)
        if (hooks2SinTibieza.length > hooksActualesSinTibieza.length) {
          console.log('[M1 REINTENTO TIBIEZA] Reintento mejoró:', hooksActualesSinTibieza.length, '→', hooks2SinTibieza.length)
          // Reemplazar hooksDevolver con el reintento
          hooksDevolver.length = 0
          hooksDevolver.push(...hooks2.slice(0, 3))
        }
      } catch (e) {
        console.error('Reintento M1 (tibieza) falló:', e)
      }
    }

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
