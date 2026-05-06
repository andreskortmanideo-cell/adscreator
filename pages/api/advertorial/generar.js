async function callModel(messages, modelo, system) {
  const isGPT = modelo?.startsWith('gpt')
  if (isGPT) {
    const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: modelo, max_tokens: 12000, messages: msgs }),
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message)
    return d.choices[0].message.content
  } else {
    const body = { model: modelo, max_tokens: 12000, messages }
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

function buildContext({ nombre, contexto, avatar, lineamiento, mercado, documento, briefing }) {
  const inputProducto = []
  if (contexto?.trim()) inputProducto.push('[Información del cliente]:\n' + contexto.trim())
  if (documento?.trim()) inputProducto.push('[Documento adjunto]:\n' + documento.substring(0, 8000))
  const productoBlock = inputProducto.length > 0 ? inputProducto.join('\n\n') : 'Solo nombre disponible.'

  const lineamientoBlock = lineamiento?.trim()
    ? `\n━━━ LINEAMIENTO DEL CLIENTE — REGLA ABSOLUTA ━━━\n${lineamiento.trim()}\n`
    : ''

  return `PRODUCTO: ${nombre}

━━━ INFORMACIÓN DEL PRODUCTO ━━━
${productoBlock}

━━━ AVATAR OBJETIVO ━━━
${avatar?.trim() || 'Inferir del producto'}

━━━ MERCADO Y LOCALIZACIÓN ━━━
${mercado?.trim() || 'Colombia'}

INSTRUCCIONES DE LOCALIZACIÓN — ABSOLUTAMENTE OBLIGATORIO:
- El experto ejerce en ciudades de ${mercado?.trim() || 'Colombia'} — usa nombres reales de ciudades específicas de ese país (ej: para Guatemala: Ciudad de Guatemala, Quetzaltenango, Antigua, Mixco; para México: CDMX, Guadalajara, Monterrey, Puebla; para Colombia: Bogotá, Medellín, Cali, Barranquilla; para España: Madrid, Barcelona, Valencia; para Argentina: Buenos Aires, Córdoba, Rosario).
- Los testimonios DEBEN ser de personas en ciudades de ${mercado?.trim() || 'Colombia'} — NO mezcles ciudades de otros países.
- El vocabulario debe sentirse natural en ${mercado?.trim() || 'Colombia'}. Evita palabras de otros países hispanohablantes:
  · Si es Colombia: NO uses "lavabo" (di "lavamanos"), NO uses "alberca" (di "piscina"), NO uses "celular" en formal (usa "teléfono móvil" o "celular" según contexto).
  · Si es Guatemala: NO uses "vos" formal (usa "usted"), evita modismos colombianos como "parche", "chévere".
  · Si es México: NO uses "vale" español, usa "está bien"; NO uses "carro" colombiano, usa "coche" o "auto".
  · Si es España: usa "vosotros", "ordenador" (no computadora), "móvil" (no celular).
  · Si es Argentina: usa "vos" en lugar de "tú", "auto", "celu".
- USA precios en moneda local: ${mercado?.toLowerCase().includes('guatemala') ? 'Quetzales (Q)' : mercado?.toLowerCase().includes('mexico') || mercado?.toLowerCase().includes('méxico') ? 'Pesos mexicanos ($MXN)' : mercado?.toLowerCase().includes('españa') || mercado?.toLowerCase().includes('espana') ? 'Euros (€)' : mercado?.toLowerCase().includes('argentina') ? 'Pesos argentinos ($ARS)' : mercado?.toLowerCase().includes('peru') || mercado?.toLowerCase().includes('perú') ? 'Soles (S/)' : mercado?.toLowerCase().includes('chile') ? 'Pesos chilenos ($CLP)' : 'Pesos colombianos ($COP)'}.

━━━ GÉNERO DEL EXPERTO — DETECCIÓN AUTOMÁTICA ━━━
Analiza el producto "${nombre}" y el avatar para determinar el género del experto:
- Si el producto/problema es MAYORITARIAMENTE femenino (estética, salud femenina, menopausia, pérdida de cabello en mujeres, fertilidad, embarazo, drenaje facial, antiestrías, suelo pélvico): usa una DOCTORA (mujer).
- Si es MAYORITARIAMENTE masculino (próstata, calvicie masculina, testosterona, disfunción eréctil): usa un DOCTOR (hombre).
- Si es UNISEX o ambiguo (migraña, dolor articular, sueño, ansiedad, energía, suplementos generales): elige el género que dé MÁS credibilidad al producto, alterna entre generaciones para variar.
Justifica tu elección internamente y mantén consistencia: "Dra." con nombre femenino + verbos/adjetivos en femenino. "Dr." con nombre masculino + masculino.
${lineamientoBlock}
━━━ ESTRATEGIA ━━━
ENEMIGO: ${briefing.enemigo}
MECANISMO BASE: ${briefing.mecanismo}
TONO: ${briefing.tono}`
}

function buildEjeNarrativoBlock(eje) {
  if (!eje || typeof eje !== 'object') return ''
  const { villano, metaforaMecanismo, verdadOculta, momentoDescubrimiento, mecanismoSolucion } = eje
  if (!villano && !metaforaMecanismo && !verdadOculta && !momentoDescubrimiento && !mecanismoSolucion) return ''
  return `
REGLA G — EJE NARRATIVO COHERENTE (OBLIGATORIO)
Este advertorial tiene UN eje narrativo único, calculado al inicio. Úsalo en TODOS los bloques sin reformularlo, sin sustituirlo, sin contradecirlo:

VILLANO: ${villano || ''}
METÁFORA DEL MECANISMO DEL PROBLEMA: ${metaforaMecanismo || ''}
VERDAD OCULTA (CONTRASTE CREENCIA vs REALIDAD): ${verdadOculta || ''}
MOMENTO DE DESCUBRIMIENTO DEL EXPERTO: ${momentoDescubrimiento || ''}
MECANISMO DE SOLUCIÓN: ${mecanismoSolucion || ''}

Cada metáfora, transición, ejemplo, comparación o explicación que escribas debe alinear con este eje. La apertura debe sembrar el villano. La autoridad debe protagonizar el momento de descubrimiento. La causa raíz debe revelar la verdad oculta. El mecanismo debe ser exactamente el descrito. Los testimonios deben validar la solución de este villano específico, no de un problema genérico. El cierre debe contraponer "seguir con el villano" vs "atacar la causa raíz con este mecanismo".

NUNCA inventes un villano o metáfora paralela. Hay UNO solo en este advertorial.
`
}

function buildSystemBase(ejeNarrativo = null) {
  const ejeBlock = buildEjeNarrativoBlock(ejeNarrativo)
  return `Eres copywriter de publireportajes científicos. Estilo periodístico de revista médica.

REGLAS:
1. Párrafos cortos: máximo 3-4 oraciones.
2. Tono periodístico/médico/cercano. NO académico, NO publicitario.
3. Experto con nombre completo creíble + especialidad ESPECÍFICA al problema.
4. NO uses: "Carlos López", "María García", "Marcelo Gómez", "Laura Méndez", "Lorena Muñoz", "Valentina Echeverri", "Mariana Rueda", "Julián Herrera", "Andrés Felipe Duarte".
5. NO uses fórmula "X no es Y. Es Z pidiéndote ayuda".
6. Modela estructura del referente CON PALABRAS NUEVAS.

REGLAS DE ESPECIFICIDAD — CRÍTICAS PARA QUE NO SEA GENÉRICO:

A) DESCRIPCIONES VISUALES Y SENSORIALES OBLIGATORIAS
NO escribas: "el dolor intenso", "esa molestia constante", "el problema persistente"
SÍ escribe: detalles concretos de cómo se manifiesta, cuándo aparece, qué hace cambiar, qué hace el paciente para esconderlo o evitarlo.
Ejemplo bueno: "ese peso en la parte baja del rostro que borra el ángulo de la mandíbula. Esa papada que aparece en fotos aunque la persona en el espejo no se vea igual."
Ejemplo malo: "el dolor punzante que afecta su vida diaria"

B) HISTORIA DEL PACIENTE — LISTA DETALLADA Y CONCRETA
Cuando digas "había probado todo", LISTA mínimo 4-5 tratamientos ESPECÍFICOS Y DIFERENTES con nombres reales.
NO: "pastillas, terapias alternativas, dieta"
SÍ: nombres de medicamentos genéricos reales, técnicas con nombre propio, profesionales específicos consultados, métodos concretos.
Ejemplo: para migraña → "Sumatriptán. Topiramato preventivo. Acupuntura semanal con maestra china. Dieta libre de tiramina. Botox en sienes. Incluso una resonancia magnética de tres horas que no mostró nada."

C) ANALOGÍAS — INVENTA UNA NUEVA cada vez
PROHIBIDAS por gastadas: "apagar incendio con manguera", "tapar con curita", "barrer bajo la alfombra", "darle vuelta a la página", "atacar la sintomatología".
Inventa una analogía NUEVA específica al producto/problema. Pueden venir de:
- Cocina (sopa, fuego lento, sazón)
- Construcción (vigas, cimientos, plomería)
- Tecnología (cables, circuito, software)
- Naturaleza (río, árbol, presa)
- Música (orquesta desafinada, instrumento)
- Tránsito (semáforo, embotellamiento)
- Cuerpo humano (otro sistema)
La analogía debe ser MEMORABLE y específica al mecanismo del problema.

D) APODOS DE INGREDIENTES — COHERENCIA TEMÁTICA
Los 4-6 apodos deben formar un EQUIPO temático coherente con el mecanismo del producto.
NO mezcles temas (ej: "El protector invisible" + "El activador cerebral" + "El movilizador" — tres lógicas distintas).
SÍ cohesión: si el mecanismo es drenaje, los apodos giran en torno a flujo/canales/desagüe. Si es bloqueo nervioso, giran en torno a interruptor/freno/pausa/silencio.
Ejemplos de equipos coherentes:
- Sistema linfático: "El movilizador" / "El limpiador de filtros" / "El mantenedor de canales" / "El activador circulatorio"
- Sistema neurológico: "El interruptor" / "El silenciador" / "El estabilizador" / "El restaurador del umbral"
- Sistema dérmico: "El reconstructor" / "El sellador" / "El nutridor profundo" / "El activador celular"

E) DISTINCIÓN BIOLÓGICA CLARA Y MEMORABLE
En el bloque educativo, incluye una distinción biológica que cambie la forma de ver el problema.
Formato: "Aquí está la diferencia que cambia todo: [lo que creen] es [característica A]. [La verdad] es [característica B opuesta]. Si [síntoma observable], no estás mirando [creencia]. Estás mirando [verdad]."
Ejemplo del referente: "la grasa es un tejido sólido que el cuerpo almacena en células específicas. La inflamación linfática es fluida. Si tu papada fluctúa — si a veces parece más grande y a veces más pequeña — no estás mirando grasa. Estás mirando agua atrapada."
Esta distinción debe ser CONCRETA y verificable por el lector mismo.

F) DENSIDAD vs EXTENSIÓN — REGLA MAESTRA DE TAMAÑO
Un advertorial bueno es DENSO, no extenso. Cada bloque tiene un LÍMITE OBLIGATORIO de palabras que aparece junto a su instrucción. RESPÉTALOS al pie de la letra.

PRINCIPIOS DE DENSIDAD:
- Si dudas entre 2 oraciones que dicen lo mismo, deja la más concreta y elimina la otra.
- NO repitas información entre bloques.
- NO uses oraciones de relleno tipo "como veremos a continuación", "es importante mencionar que", "vale la pena destacar".
- NO uses adjetivos de adorno tipo "increíble", "fantástico", "asombroso".
- Cada oración debe aportar UN dato nuevo o avanzar la narrativa. Si no, sobra.
- Tamaño total del advertorial completo: alrededor de 2.500-3.000 palabras (no más).

REGLA ABSOLUTA: si te excedes del límite de un bloque, REESCRIBE más conciso. NO entregues bloques más largos creyendo que "es mejor". Lo conciso convierte mejor.
${ejeBlock}
Devuelve SOLO JSON válido.`
}

// PARTE 1: Bloques 1-6 (titular, bajada, ficha, apertura, historia, cita)
async function parte1(ctx, modelo, ejeNarrativo) {
  const system = `${buildSystemBase(ejeNarrativo)}

Genera la APERTURA del advertorial.

REGLA DE LONGITUD: Cada bloque tiene un límite de palabras OBLIGATORIO. NO te excedas. Si tu primera redacción excede, recorta antes de devolver. Texto denso, no inflado.

Devuelve SOLO JSON con estas claves:
{"titulares":["v1","v2","v3"],"bajada":"","fichaExperto":"","apertura":"","historiaPaciente":"","citaExperto":""}`

  const user = `${ctx}

━━━ INSTRUCCIONES ━━━

titulares (array de 3 estructuras DIFERENTES):
v1 (Reencuadre): "Eso que llamas [X] no es [creencia común]. Es [sistema corporal] [verbo específico]."
v2 (Pregunta): "¿Por qué [problema] aunque [acción correcta]? La respuesta no está en [lo obvio]."
v3 (Confesión): "Después de [N] años tratando [problema], descubrí lo que [autoridad] no explica."
LÍMITE: 12-22 palabras cada uno, 2da persona.

bajada (1 párrafo, 2-3 oraciones, periodístico, va DEBAJO del titular):
Inicio variado según el estilo:
- "La razón por la que [problema] no tiene nada que ver con [creencias]..."
- "Lo que [grupo profesional] no te explica sobre [problema] es que..."
- "Detrás de [problema] hay un proceso biológico que [pocos/nadie] te ha contado..."
- "[Problema] tiene una causa específica que la mayoría de los tratamientos ignoran..."
- "Si llevas [N] [tiempo] con [problema], probablemente nadie te ha hablado de..."

Termina dando esperanza implícita: "...y tiene solución" / "...y se puede revertir" / "...y la ciencia ya lo entendió". Adapta el cierre al producto.
LÍMITE: 30-50 palabras.

fichaExperto (3 líneas + estrellas, 70-100 palabras totales):
[Nombre completo creíble]
[Especialidad específica al problema] · [N] años de experiencia.
Especialista en [sub-área] · Más de [N.NNN] pacientes atendidos en [ciudad y otra].

⭐⭐⭐⭐⭐ +[N.NNN] reseñas verificadas ✅ Verificado

apertura (LÍMITE OBLIGATORIO: 150-180 palabras, estructura de 3-4 párrafos cortos y densos):
USA la estructura de apertura asignada arriba como GUÍA — adáptala al producto y avatar.

DEBE incluir, en algún orden creativo:
- Una observación específica del experto sobre el avatar (qué siente, qué hace, cómo se ve)
- Algo que el avatar piensa/dice/cree (puede ser pregunta, queja, frase típica)
- La distinción entre lo que el avatar cree que pasa y lo que realmente pasa
- Una contradicción biológica/situacional que desconcierta
- Una promesa de revelación: hay explicación

NO empieces SIEMPRE con "Hay una pregunta..." — varía según el estilo asignado.
La voz, ritmo y vocabulario deben sentirse del estilo narrativo elegido.
NO repitas información, sé denso. Cada oración aporta un dato nuevo.

historiaPaciente (LÍMITE OBLIGATORIO: 130-170 palabras, 3 párrafos cortos y densos):
Sub-encabezado libre que evoque el caso (ej: "El/La paciente que me cambió la forma de ver [problema]" o "El día que [algo] me hizo cuestionar todo" o "[Nombre], la que me obligó a buscar otra respuesta")

USA la estructura de historia asignada arriba — adáptala. Pero DEBE contener:
- Nombre completo creíble del paciente, edad, profesión específica con dato
- La razón real por la que vino (suele ser una incongruencia biológica)
- Lo que había probado antes sin éxito
- La pregunta clave que nadie le había hecho
- La revelación que cambió todo

Varía cómo lo cuentas según el estilo narrativo asignado: puede ser cinematográfico, confidencial, investigativo...

citaExperto (LÍMITE: 50-80 palabras):
"[Cita poderosa, 2-3 oraciones, conectando el caso con el principio biológico universal]"
— Dr./Dra. [Nombre] · [Especialidad]

REGLA DE SEVERIDAD (apertura + historiaPaciente — al menos en uno de los dos):
Incluye al menos UNA escena de severidad visible del problema: un momento donde el problema se hace público, donde el avatar se sintió expuesto, o donde la frustración llegó al límite. Detalle sensorial concreto, no abstracción.

GENERA AHORA, respetando los límites de palabras de cada bloque.`

  const result = await callModel([{ role: 'user', content: user }], modelo, system)
  return parseJSON(result, 'parte1')
}

// PARTE 2: Bloques 7-10 (educativo, comparativa, por qué fallan, mecanismo)
async function parte2(ctx, modelo, parte1Data, ejeNarrativo) {
  const expertoNombre = parte1Data.fichaExperto?.split('\n')[0] || 'Dr./Dra.'
  const pacienteNombre = (parte1Data.historiaPaciente || '').match(/[A-Z][a-z]+ [A-Z][a-z]+/)?.[0] || 'el paciente'

  const system = `${buildSystemBase(ejeNarrativo)}

Genera el DESARROLLO + MECANISMO. El experto es: ${expertoNombre}

Devuelve SOLO JSON con estas claves:
{"desarrolloEducativo":"","comparativaEstados":"","porQueOtrosFallan":"","nombresMecanismo":["n1","n2","n3"],"transicionMecanismo":""}`

  const user = `${ctx}

CONTEXTO PREVIO:
- Experto: ${expertoNombre}
- Paciente del caso: ${pacienteNombre}

━━━ INSTRUCCIONES ━━━

desarrolloEducativo (LÍMITE OBLIGATORIO: 130-180 palabras, 3 párrafos densos):
Sub-encabezado: "Lo que [referencia] no te explica pero [sistema corporal] sí"
Empieza con stat visual: "[N de 10] [grupo del avatar] que [síntoma] tienen origen [causa real] confirmado."
Luego: el sistema corporal funciona X. Cuando va bien Y. Cuando se rompe Z. Distinción clave entre [creencia popular] y [verdad biológica].

comparativaEstados (formato exacto, devuelve como STRING no como objeto):
"❌ [Estado problema]
- [Síntoma 1 específico]
- [Síntoma 2]
- [Síntoma 3]
- [Síntoma 4]
- [Síntoma 5]

✓ [Estado deseado]
- [Beneficio 1 específico]
- [Beneficio 2]
- [Beneficio 3]
- [Beneficio 4]
- [Beneficio 5]"

porQueOtrosFallan (LÍMITE OBLIGATORIO: 150-200 palabras: 2 párrafos cortos + cita + 1 párrafo de cierre):
Sub-encabezado libre que critique el tratamiento popular (varía según estilo)

USA la apertura "Por qué fallan" asignada arriba como punto de partida. Estructura:
- Reconocimiento o crítica inicial del tratamiento popular (según estilo)
- El límite real que la industria no explica
- Una analogía única y memorable (NO uses "lavadora desbordada" si el referente la usó — inventa una nueva relacionada al producto/avatar específico)
- Cita del experto contundente y específica al caso
- Cierre que apunta a lo que SÍ se necesita

Cada generación debe tener una analogía DIFERENTE. Sé creativo: pueden ser analogías con cocina, jardín, máquinas, deportes, naturaleza, lo que mejor encaje con el avatar.

nombresMecanismo (array de 3): formato OBLIGATORIO "[Sustantivo de acción] [Modificador] [Calificador]" + ™
Mínimo 3 palabras, máximo 6.
EJEMPLOS CORRECTOS:
- "Protocolo de Activación Linfática de Triple Vía (ALT™)"
- "Sistema de Regeneración Dérmica Multiactiva™"
- "Método de Bloqueo Neurogénico Sostenido™"
PROHIBIDOS (muy cortos): "AlivioPunto™", "FrenoNeuro™".

transicionMecanismo (LÍMITE OBLIGATORIO: 280-350 palabras TOTAL incluyendo las 3-4 fases del mecanismo):

Sub-encabezado: "La solución que actúa donde [tratamiento popular] no llega"

P1: "Después de años buscando una respuesta para pacientes como ${pacienteNombre} — [tipo de personas] — encontré una fórmula [tipo: botánica/tópica/oral/concentrada] que opera exactamente en el punto correcto: [punto biológico preciso]."

P2 (3 negaciones + 1 definición):
"No es un [tto erróneo 1]. No es un [tto erróneo 2]. No es un [tto erróneo 3]. Es un [definición precisa], formulado específicamente para [acción 1] y [acción 2]."

P3 (el principio):
"El principio es simple: No se trata de [lo que la gente cree]. Se trata de [verdadero objetivo]. [Tu sistema/mandíbula/X] ya está ahí. Solo hay [problema] encima."

[Nombre del Mecanismo™] (usa el primer nombre del array)

3-4 fases numeradas. CADA FASE con MÍNIMO 4 oraciones (formato OBLIGATORIO):
[N] - [Nombre fase] — [subtítulo de acción]
[Oración 1: ingrediente/activo ESPECÍFICO POR NOMBRE + qué hace biológicamente]
[Oración 2: efecto local que produce ese ingrediente]
[Oración 3: analogía visual memorable]
[Oración 4: qué pasa SIN esta fase / por qué es indispensable]

REGLA ABSOLUTA: cada fase MENCIONA ingredientes específicos por nombre (botánico o común). NO uses "ingredientes activos" abstracto.

EJEMPLO del nivel REQUERIDO (referente real):
"1 - Desbloqueo de ganglios — apertura de la vía de salida
El Trébol Rojo y la Raíz de Stillingia actúan directamente sobre los ganglios linfáticos del cuello, que funcionan como válvulas o 'tapones'. Al desinflamarlos y reactivar su función de filtro, se abre la única vía por la que el líquido facial puede evacuarse de forma natural. Sin este paso, cualquier otro tratamiento trabaja contra una puerta cerrada."

GENERA AHORA.`

  const result = await callModel([{ role: 'user', content: user }], modelo, system)
  return parseJSON(result, 'parte2')
}

// PARTE 3: Bloques 11-16 (producto, promociones, garantía, testimonios, faq, cierre)
async function parte3(ctx, modelo, parte1Data, parte2Data, ejeNarrativo) {
  const expertoNombre = parte1Data.fichaExperto?.split('\n')[0] || 'Dr./Dra.'
  const mecanismo = parte2Data.nombresMecanismo?.[0] || 'Mecanismo'

  const system = `${buildSystemBase(ejeNarrativo)}

Genera CIERRE del advertorial. Experto: ${expertoNombre}. Mecanismo: ${mecanismo}.

Devuelve SOLO JSON con estas claves:
{"producto":"","promociones":"","garantia":"","testimonios":"","faq":"","cierreCTA":"","cierreEncrucijada":"","regalo":{"nombre":"","descripcion":"","valorPercibido":""},"expectativasProximosPasos":[]}`

  const user = `${ctx}

CONTEXTO:
- Experto: ${expertoNombre}
- Mecanismo: ${mecanismo}

━━━ INSTRUCCIONES ━━━

producto (LÍMITE OBLIGATORIO: 140-180 palabras TOTAL — calibrado al referente):

ESTRUCTURA OBLIGATORIA. SEPARA SECCIONES CON EL TOKEN <<<BR>>> (siete caracteres exactos: tres < tres > entre la palabra BR). El backend convierte ese token en saltos reales. NO uses \\n. NO uses saltos reales. USA SOLO <<<BR>>>.

ESTRUCTURA EXACTA (4 secciones SIN ingredientes detallados, SIN "¿Por qué [formato]?", SIN cierre "Fórmula limpia"):

[Nombre del producto]<<<BR>>>[Subtítulo: "[Tipo de fórmula] · Sistema [Mecanismo]™"]<<<BR>>><<<BR>>>[Párrafo 1 — máximo 2 oraciones cortas: posicionamiento contra la categoría. Distingue al producto de las soluciones genéricas.]<<<BR>>><<<BR>>>[Párrafo 2 — máximo 3 oraciones cortas: dónde NO actúa, dónde SÍ actúa, qué entrega. Frases cortas tipo "No promete magia. Promete proceso." funcionan bien.]<<<BR>>><<<BR>>>¿Por qué vale la inversión?<<<BR>>><<<BR>>>[1 párrafo de 2-3 oraciones comparando contra alternativas reales (consulta médica, medicamento típico, tratamiento de gama alta) en cifras concretas en pesos colombianos. Cierra con la ventaja única del producto.]

REGLAS ABSOLUTAS:
1. NO incluyas la lista detallada de ingredientes (eso va en otro lado o se omite).
2. NO escribas sección "¿Por qué [formato]?".
3. NO escribas cierre "Fórmula limpia: sin X, sin Y".
4. NO uses encabezado "FÓRMULA [adjetivo] DE ACCIÓN [adjetivo]".
5. TOTAL: 140-180 palabras (sin contar tokens <<<BR>>>). Si te excedes, reescribe más conciso.
6. USA <<<BR>>> donde está marcado arriba.

promociones:
Promociones
Últimas unidades disponibles

1 [Unidad] de [Producto] — PROMOCIÓN
$[precio_alto]
$[precio_promo]

2 [Unidades] — OFERTA DEL DÍA ⏱
$[precio_alto x2]
$[precio_promo + descuento]

3 [Unidades] — MAYOR AHORRO ⭐
$[precio_alto x3]
$[precio_promo mayor]

⚠️ Stock limitado: [Producto] se produce en lotes pequeños.

¿Cómo [usarlo]?
- [Paso 1]
- [Paso 2]
- [Paso 3]
- Uso [frecuencia]

RESULTADOS PROGRESIVOS
Envío a todo el país. Pago contra entrega disponible.

garantia (LÍMITE OBLIGATORIO: 50-80 palabras):
Garantía de [N] días sin riesgo
Si en [N] días de uso constante no notas una diferencia real en [resultado], te devolvemos el dinero completo. Sin complicaciones. [N] días porque ese es el tiempo que el [protocolo] necesita.
*Aplican términos y condiciones

testimonios (LÍMITE OBLIGATORIO: 4 testimonios, 60-85 palabras cada uno = 240-340 total):
Cada testimonio sigue una ESTRUCTURA EMOCIONAL PROGRESIVA DE 5 FASES (las 5 son obligatorias, en orden, sin saltarse ninguna):
1) CONTEXTO PREVIO: qué vivía y cuánto tiempo (ej: "llevaba 2 años con migrañas casi diarias").
2) QUÉ PROBÓ ANTES: 1-2 alternativas que fallaron, con nombre concreto (no genérico "probé de todo").
3) DESCUBRIMIENTO: cómo encontró el producto (recomendación, lectura, anuncio, derivación de un profesional).
4) RESULTADO CONCRETO: con tiempo específico ("a los 8 días", "tras 3 semanas") y dato medible.
5) SUEÑO CUMPLIDO (OBLIGATORIA — sin esta fase 5 el testimonio queda inválido): lo que ahora puede hacer/sentir/atreverse que antes no — escena concreta, idealmente social ("volví a usar shorts en familia", "puedo cargar a mi nieto sin susto", "dormí toda la noche por primera vez en meses"). NO la omitas. NO la reemplaces por "estoy muy contenta". Tiene que ser una escena, no un adjetivo.

Formato:
★★★★★
"[Las 5 fases narradas naturalmente en 5-7 oraciones, sin numerarlas en el texto]"

[Nombre completo], [edad] años — [Ciudad]
[Mes Día, Año]
✓ Compra verificada

(1 testimonio ★★★★☆ con paciencia/duda inicial — credibilidad)

faq (LÍMITE OBLIGATORIO: 4 preguntas + respuestas, 80-110 palabras cada respuesta = 350-450 total):
"Preguntas y respuestas"

[Nombre] [Inicial Apellido]. Hace [N] [días/semanas]
[Pregunta realista del avatar]

Dr./Dra. ${expertoNombre} · [Especialidad]
[Respuesta 3-5 oraciones, valida duda + dato concreto.]

cierreCTA (LÍMITE OBLIGATORIO: 50-80 palabras):
"[Estructura corporal] ya existe. Solo hay [problema] encima."

Cada día sin [acción correctora] es un día más de [consecuencia]. El sistema no se [activa solo] — necesita un [activador específico].

→ OBTENER DESCUENTO AHORA

cierreEncrucijada (string, 1-2 frases, decisión binaria):
Frase única de decisión binaria. Formato literal: "El único riesgo es seguir [resumen del villano]. La única salida es [resumen del mecanismo]. Tú decides: [seguir igual] o [probarlo hoy]". Específico al producto, no genérico — usa el villano y el mecanismo de este advertorial.

regalo (objeto OBLIGATORIO):
{
  "nombre": "string — nombre del bonus, idealmente con marca propia (ej: 'Guía: Los 5 errores que sabotean tu recuperación', 'Programa Express de 7 días para Activar el Drenaje Linfático')",
  "descripcion": "string — 1-2 frases de qué incluye y cómo complementa al producto",
  "valorPercibido": "string — valor numérico ancla + indicación de que hoy es gratis (ej: 'Valor $19 USD. Hoy GRATIS con tu pedido.' o 'Antes $39.000 COP. Hoy incluido sin costo.')"
}
Específico al avatar y al eje narrativo. NO genérico, NO "ebook gratis con consejos de salud".

expectativasProximosPasos (array OBLIGATORIO de 3-4 strings):
3-4 pasos concretos que vive el avatar tras pedirlo:
- paso inmediato (qué hace ahora — ej: "Confirmas tu pedido en el formulario en 2 minutos")
- paso 2 (recepción/llegada — ej: "En 2-5 días hábiles tu producto llega a tu puerta con pago contra entrega")
- paso 3 (primera semana de uso — ej: "En la primera semana sigues el protocolo simple de aplicación nocturna")
- paso 4 OPCIONAL (resultado esperado en semana 2-3 — ej: "Hacia el día 15 ya notas el primer cambio visible")
Cada paso 1 frase corta, accionable, visualizable. No promete resultados absolutos — solo lo razonable. NO inventes pasos administrativos genéricos.

GENERA AHORA.`

  const result = await callModel([{ role: 'user', content: user }], modelo, system)
  return parseJSON(result, 'parte3')
}

const ESTILOS_NARRATIVOS = [
  { nombre: 'investigativo', descripcion: 'Tono de periodismo de investigación. El experto descubrió algo que la industria oculta. Vocabulario directo, frases cortas, indignación contenida.' },
  { nombre: 'confidencial', descripcion: 'Tono íntimo y cercano, como una conversación entre amigas. El experto comparte algo que normalmente no diría en público. Uso de "te", "vos", revelación personal.' },
  { nombre: 'cientifico-divulgativo', descripcion: 'Tono de divulgador científico (estilo BBC/National Geographic). Datos asombrosos, comparaciones con la naturaleza, preguntas retóricas que abren la mente.' },
  { nombre: 'reflexivo-experiencial', descripcion: 'Tono de profesional con muchos años que reflexiona. Empieza con una observación filosófica, anécdotas de varios pacientes, mirada panorámica.' },
  { nombre: 'directo-confrontacional', descripcion: 'Tono que confronta los mitos de frente. Empieza diciendo "Te han mentido sobre X". Frases cortas, directas, sin rodeos.' },
  { nombre: 'narrativo-cinematografico', descripcion: 'Tono que pinta escenas. Empieza con una imagen visual concreta (una paciente frente al espejo, un momento específico). Como un guion.' },
]

const APERTURAS_VARIANTES = [
  'A) Pregunta repetida: "Hay una pregunta que me hacen constantemente en consulta..."',
  'B) Patrón observado: "Llevo [N] años haciendo lo mismo y hay un patrón que se repite..."',
  'C) Confesión directa: "Voy a contarte algo que rara vez digo públicamente..."',
  'D) Escena visual: "Imagina esto: [paciente específico] frente al espejo a las 7am, [acción concreta]..."',
  'E) Dato impactante: "[Stat o cifra] de cada [N] [grupo] vive con [problema] sin saber que..."',
  'F) Frase provocadora: "Si has llegado hasta aquí, probablemente ya sabes que [verdad incómoda]..."',
  'G) Memoria personal: "Recuerdo el día exacto en que dejé de creer en [creencia popular]..."',
]

const HISTORIAS_VARIANTES = [
  'A) Tradicional: "[Nombre] tenía [edad] años. [Profesión + dato]. Llegó por [razón]..."',
  'B) Memoria viva: "Recuerdo a [Nombre] como si hubiera entrado ayer al consultorio..."',
  'C) Día específico: "Era un [día/mes] cuando [Nombre], de [edad] años, se sentó frente a mí..."',
  'D) En medias res: "Cuando [Nombre] dijo aquella frase que me marcó, supe que..."',
  'E) Por su contradicción: "[Nombre] no encajaba en ningún diagnóstico convencional..."',
]

const POR_QUE_FALLAN_VARIANTES = [
  'A) "No los descarto. [Tratamientos] tienen un efecto real..."',
  'B) "Voy a ser honesta con algo que pocos profesionales reconocen..."',
  'C) "El problema con [tratamiento popular] no es que sea malo. Es que es incompleto..."',
  'D) "Durante [N] años yo misma recetaba [tratamiento popular]. Hasta que entendí..."',
  'E) "Hay algo que la industria de [campo] no quiere que sepas..."',
]

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function callModelMini(modelo, system, userPrompt) {
  const isGPT = modelo?.startsWith('gpt')
  if (isGPT) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: modelo,
        max_tokens: 200,
        temperature: 0.6,
        messages: [{ role: 'system', content: system }, { role: 'user', content: userPrompt }]
      }),
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error.message)
    return d.choices[0].message.content
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 200,
      temperature: 0.6,
      system,
      messages: [{ role: 'user', content: userPrompt }]
    }),
  })
  const d = await r.json()
  if (d.error) throw new Error(d.error.message)
  return d.content[0].text
}

async function seleccionarVariacionNarrativa(nombre, avatar, contexto, ejeNarrativo, modelo) {
  const NL = ESTILOS_NARRATIVOS.length
  const NA = APERTURAS_VARIANTES.length
  const NH = HISTORIAS_VARIANTES.length
  const NF = POR_QUE_FALLAN_VARIANTES.length

  const truncate = (s, n) => (s || '').toString().slice(0, n)
  const eje = ejeNarrativo || {}

  const system = 'Eres un selector de variantes narrativas para un advertorial. Recibes producto, avatar, categoría, eje narrativo y 4 listas indexadas. Devuelves 4 índices (uno por lista) que mejor se ajusten al producto y eje. Tu objetivo es que la voz narrativa se sienta pensada para ESTE producto, no genérica.'

  const listEstilos = ESTILOS_NARRATIVOS.map((e, i) => `${i}. ${e.nombre} — ${truncate(e.descripcion, 80)}`).join('\n')
  const listAperturas = APERTURAS_VARIANTES.map((s, i) => `${i}. ${truncate(s, 80)}`).join('\n')
  const listHistorias = HISTORIAS_VARIANTES.map((s, i) => `${i}. ${truncate(s, 80)}`).join('\n')
  const listPorQueFallan = POR_QUE_FALLAN_VARIANTES.map((s, i) => `${i}. ${truncate(s, 80)}`).join('\n')

  const userPrompt = `PRODUCTO: ${nombre || ''}
AVATAR: ${avatar || ''}
DOLOR/CONTEXTO: ${truncate(contexto, 600)}

EJE NARRATIVO:
- Villano: ${eje.villano || ''}
- Metáfora del mecanismo: ${eje.metaforaMecanismo || ''}
- Verdad oculta: ${eje.verdadOculta || ''}
- Momento de descubrimiento: ${eje.momentoDescubrimiento || ''}
- Mecanismo de solución: ${eje.mecanismoSolucion || ''}

LISTA ESTILOS (índices 0..${NL - 1}):
${listEstilos}

LISTA APERTURAS (índices 0..${NA - 1}):
${listAperturas}

LISTA HISTORIAS (índices 0..${NH - 1}):
${listHistorias}

LISTA PORQUEFALLAN (índices 0..${NF - 1}):
${listPorQueFallan}

INSTRUCCIÓN: Devuelve SOLO un JSON válido con esta forma exacta: {"estilo": N, "apertura": N, "historia": N, "porQueFallan": N, "razon": "1 frase explicando por qué esta combo encaja con el producto y eje"}. Los índices son enteros dentro del rango válido de cada lista. NO devuelvas markdown, NO comentes fuera del JSON.`

  const tryParse = (text) => {
    let cleaned = (text || '').replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    try { return JSON.parse(cleaned.substring(start, end + 1)) } catch { return null }
  }

  const validate = (parsed) => {
    if (!parsed || typeof parsed !== 'object') return null
    const inRange = (v, n) => Number.isInteger(v) && v >= 0 && v < n
    return {
      estilo: inRange(parsed.estilo, NL) ? parsed.estilo : null,
      apertura: inRange(parsed.apertura, NA) ? parsed.apertura : null,
      historia: inRange(parsed.historia, NH) ? parsed.historia : null,
      porQueFallan: inRange(parsed.porQueFallan, NF) ? parsed.porQueFallan : null,
      razon: typeof parsed.razon === 'string' ? parsed.razon : '',
    }
  }

  const fillRandom = (sel) => ({
    estilo: sel.estilo == null ? Math.floor(Math.random() * NL) : sel.estilo,
    apertura: sel.apertura == null ? Math.floor(Math.random() * NA) : sel.apertura,
    historia: sel.historia == null ? Math.floor(Math.random() * NH) : sel.historia,
    porQueFallan: sel.porQueFallan == null ? Math.floor(Math.random() * NF) : sel.porQueFallan,
    razon: sel.razon || '',
  })

  const randomIndices = () => ({
    estilo: Math.floor(Math.random() * NL),
    apertura: Math.floor(Math.random() * NA),
    historia: Math.floor(Math.random() * NH),
    porQueFallan: Math.floor(Math.random() * NF),
  })

  const buildResult = (idx, fuente, razon) => ({
    estilo: ESTILOS_NARRATIVOS[idx.estilo],
    apertura: APERTURAS_VARIANTES[idx.apertura],
    historia: HISTORIAS_VARIANTES[idx.historia],
    porQueFallan: POR_QUE_FALLAN_VARIANTES[idx.porQueFallan],
    indices: { estilo: idx.estilo, apertura: idx.apertura, historia: idx.historia, porQueFallan: idx.porQueFallan },
    razonSeleccion: razon || '',
    fuenteSeleccion: fuente,
  })

  const algunValido = (v) => v && (v.estilo != null || v.apertura != null || v.historia != null || v.porQueFallan != null)

  // Intento 1: pre-llamada a gpt-4.1-mini
  try {
    const text = await callModelMini('gpt-4.1-mini', system, userPrompt)
    const validated = validate(tryParse(text))
    if (algunValido(validated)) {
      const filled = fillRandom(validated)
      return buildResult(filled, 'llm-pre', filled.razon)
    }
    console.error('[seleccionarVariacionNarrativa] gpt-4.1-mini devolvió JSON inválido o sin índices válidos')
  } catch (e) {
    console.error('[seleccionarVariacionNarrativa] gpt-4.1-mini falló:', e?.message || e)
  }

  // Intento 2: fallback con el provider del modelo del usuario (solo si NO es gpt-4.1-mini, evita repetir mismo intento)
  const userProviderDistinto = modelo && !modelo.startsWith('gpt-4.1-mini')
  if (userProviderDistinto) {
    try {
      const text = await callModelMini(modelo, system, userPrompt)
      const validated = validate(tryParse(text))
      if (algunValido(validated)) {
        const filled = fillRandom(validated)
        return buildResult(filled, 'llm-fallback', filled.razon)
      }
      console.error(`[seleccionarVariacionNarrativa] fallback con ${modelo} devolvió JSON inválido`)
    } catch (e) {
      console.error(`[seleccionarVariacionNarrativa] fallback con ${modelo} falló:`, e?.message || e)
    }
  }

  // Intento 3: random puro (legacy)
  console.error('[seleccionarVariacionNarrativa] cayendo a pickRandom')
  return buildResult(randomIndices(), 'random', '')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { nombre, contexto, avatar, lineamiento, mercado, documento, briefing, modelo } = req.body
    const ctx = buildContext({ nombre, contexto, avatar, lineamiento, mercado, documento, briefing })
    const ejeNarrativo = briefing?.ejeNarrativo || null

    let estiloNarrativo, aperturaElegida, historiaElegida, porQueFallanElegida
    let variacionSeleccionada, variacionFuente

    if (ejeNarrativo) {
      const seleccion = await seleccionarVariacionNarrativa(nombre, avatar, contexto, ejeNarrativo, modelo)
      estiloNarrativo = seleccion.estilo
      aperturaElegida = seleccion.apertura
      historiaElegida = seleccion.historia
      porQueFallanElegida = seleccion.porQueFallan
      variacionSeleccionada = seleccion.indices
      variacionFuente = seleccion.fuenteSeleccion
    } else {
      // Compat legacy: sin eje narrativo, picks aleatorios directos
      estiloNarrativo = pickRandom(ESTILOS_NARRATIVOS)
      aperturaElegida = pickRandom(APERTURAS_VARIANTES)
      historiaElegida = pickRandom(HISTORIAS_VARIANTES)
      porQueFallanElegida = pickRandom(POR_QUE_FALLAN_VARIANTES)
      variacionSeleccionada = {
        estilo: ESTILOS_NARRATIVOS.indexOf(estiloNarrativo),
        apertura: APERTURAS_VARIANTES.indexOf(aperturaElegida),
        historia: HISTORIAS_VARIANTES.indexOf(historiaElegida),
        porQueFallan: POR_QUE_FALLAN_VARIANTES.indexOf(porQueFallanElegida),
      }
      variacionFuente = 'random'
    }

    const variaciones = `
━━━ ESTILO NARRATIVO PARA ESTA GENERACIÓN ━━━
Estilo: ${estiloNarrativo.nombre}
${estiloNarrativo.descripcion}

ESTRUCTURAS A USAR (no las copies textualmente, son guías de estilo):
- Apertura del bloque "apertura": ${aperturaElegida}
- Historia del paciente: ${historiaElegida}
- Por qué otros fallan: ${porQueFallanElegida}

REGLA: el TONO completo del advertorial debe seguir el estilo "${estiloNarrativo.nombre}". Cada bloque mantiene ese estilo aunque varíe el tema.`

    const p1 = await parte1(ctx + variaciones, modelo, ejeNarrativo)
    const p2 = await parte2(ctx + variaciones, modelo, p1, ejeNarrativo)
    const p3 = await parte3(ctx + variaciones, modelo, p1, p2, ejeNarrativo)

    const advertorialRaw = { ...p1, ...p2, ...p3 }

    // Embeber nuevos campos (Fix #3) en bloques visibles existentes — frontend no se toca
    if (advertorialRaw.cierreEncrucijada && typeof advertorialRaw.cierreEncrucijada === 'string') {
      const base = (advertorialRaw.cierreCTA || '').trim()
      advertorialRaw.cierreCTA = base
        ? `${base}\n\n${advertorialRaw.cierreEncrucijada.trim()}`
        : advertorialRaw.cierreEncrucijada.trim()
    }
    if (advertorialRaw.regalo && typeof advertorialRaw.regalo === 'object') {
      const r = advertorialRaw.regalo
      const regaloTxt = ['🎁 REGALO INCLUIDO', r.nombre, r.descripcion, r.valorPercibido]
        .filter(s => typeof s === 'string' && s.trim())
        .join('\n')
      if (regaloTxt) {
        const basePromo = (advertorialRaw.promociones || '').trim()
        advertorialRaw.promociones = basePromo ? `${basePromo}\n\n${regaloTxt}` : regaloTxt
      }
    }
    if (Array.isArray(advertorialRaw.expectativasProximosPasos) && advertorialRaw.expectativasProximosPasos.length > 0) {
      const pasos = advertorialRaw.expectativasProximosPasos
        .filter(s => typeof s === 'string' && s.trim())
        .map((s, i) => `${i + 1}. ${s.trim()}`)
        .join('\n')
      if (pasos) {
        const stepsBlock = `QUÉ PASA CUANDO PIDAS HOY\n${pasos}`
        const basePromo = (advertorialRaw.promociones || '').trim()
        advertorialRaw.promociones = basePromo ? `${basePromo}\n\n${stepsBlock}` : stepsBlock
      }
    }

    // Convertir tokens <<<BR>>> a saltos de línea reales en todos los campos string
    const convertBR = (val) => {
      if (typeof val === 'string') return val.replace(/<<<BR>>>/g, '\n')
      if (Array.isArray(val)) return val.map(convertBR)
      if (val && typeof val === 'object') {
        const out = {}
        for (const k in val) out[k] = convertBR(val[k])
        return out
      }
      return val
    }
    const advertorial = convertBR(advertorialRaw)

    return res.status(200).json({ success: true, advertorial, variacionSeleccionada, variacionFuente })
  } catch (error) {
    console.error('Error generar:', error)
    return res.status(500).json({ error: error.message })
  }
}
