import { CRITERIOS_MOTIVOS, CRITERIOS_ANGULOS, CRITERIOS_NIVELES } from '../../lib/criterios-analisis'

const { HOOKS_COMPLETOS, TODOS_LOS_HOOKS } = require('../../data/hooks-data')
const { HOOKS_JEFE } = require('../../data/hooks-jefe')
const { DOCTRINA_TIPOS_IMAGEN } = require('../../data/doctrina-tipos-imagen')

// ── Doctrina determinística compartida — el modo Crear genera aplicando los
// mismos criterios que el auditor, evitando inconsistencias en el output. ──
const BLOQUE_CRITERIOS_DETERMINISTICOS = `
═════════════════════════════════════════════
DOCTRINA OBLIGATORIA — APLICA ESTOS CRITERIOS AL GENERAR

${CRITERIOS_NIVELES}

${CRITERIOS_MOTIVOS}

${CRITERIOS_ANGULOS}
═════════════════════════════════════════════`

function bloqueReglasEstructuralesAngulo(anguloVenta) {
  return `
═════════════════════════════════════════════
REGLAS ESTRUCTURALES OBLIGATORIAS POR ÁNGULO:

El ángulo elegido es: ${anguloVenta || '(no especificado)'}

ESTRUCTURA SEGÚN ÁNGULO:

Problema/Dolor → ABRE con el dolor concreto del avatar. Ej: "Si llegas con la espalda destrozada cada noche..."

Beneficio/Resultado → ABRE con el resultado YA logrado QUE INCLUYE o IMPLICA el producto en las PRIMERAS 1-2 FRASES.
  EJEMPLOS CORRECTOS (producto en palabra 1-10):
  ✅ "Esta pulverizadora limpió mi motor en 5 minutos."
  ✅ "Limpio en 5 minutos con esta pulverizadora de alta presión."
  ✅ "En 5 minutos esta herramienta hace lo que antes me tomaba 1 hora."
  EJEMPLOS INCORRECTOS (producto aparece después de palabra 20):
  ❌ "Limpio en 5 minutos lo que antes me tomaba una hora. Mi taller estaba lleno de grasa, polvo... [continúa contando el problema sin mencionar producto] ... Descubrí esta pulverizadora." (producto en palabra 41)
  REGLA NUMÉRICA OBLIGATORIA: si el nivel es 3, 4 o 5, el producto (nombre o categoría) debe aparecer en las PRIMERAS 15 palabras del guion. LUEGO se cuenta el problema anterior y el cómo. NUNCA abrir con problema.

Curiosidad → ABRE con pregunta intrigante o dato. Ej: "¿Sabías que el 80% de los mecánicos siguen lavando a mano?"

Urgencia/Escasez → ABRE con tiempo/stock limitado. Ej: "Solo quedan 24 horas."

Autoridad/Prueba Social → ABRE con cifra o testimonio. Ej: "3000 mecánicos ya lo usan."

Novedad → ABRE con la novedad. Ej: "Acaba de llegar a Colombia."

Comparación/Contraste → ABRE con la comparación. Ej: "Limpiar a mano vs con esto: 3 horas vs 20 minutos."

Enemigo en Común → ABRE con el villano. Ej: "La industria te hizo creer que necesitas químicos caros."

Historia → ABRE con la narrativa. Ej: "Hace 3 meses estaba a punto de cerrar el taller."

Transformación → ABRE con el contraste. Ej: "Pasé de trabajar 12 horas a 6 ganando lo mismo."

FOMO → ABRE mostrando que otros ya cambiaron. Ej: "Mientras dudas, otros ya están ahorrando 2 horas diarias."

Simplicidad → ABRE remarcando la facilidad. Ej: "3 pasos. Eso es todo."

Ironía/Provocación → ABRE rompiendo la creencia común. Ej: "Limpiar más fuerte está dañando tus motores."

Precio/Valor → ABRE enmarcando la inversión. Ej: "Por menos de lo que gastas en almuerzos en una semana."

Exclusividad → ABRE filtrando al público. Ej: "Esto no es para todos."

Aspiracional → ABRE con la identidad deseada. Ej: "Conviértete en el mecánico que recomiendan."

REGLA DE TONO DE APERTURA:
- NUNCA abras un guion con "Cómo + verbo" (ej. "Cómo limpias", "Cómo logras"). Eso es tono de tutorial/imperativo, no de descubrimiento personal.
- NUNCA abras con verbo en imperativo dirigido al espectador (ej. "Mira", "Descubre", "Prueba"). Excepto si es Nivel 4-5.
- En Nivel 3, la voz debe ser EN PRIMERA PERSONA del que descubrió, no de instructor.

EJEMPLOS DE APERTURA:
❌ "Cómo limpias superficies difíciles en 5 segundos" (imperativo)
❌ "Descubre la forma de limpiar más rápido" (imperativo)
✅ "Limpio superficies difíciles en 5 segundos" (primera persona)
✅ "En 5 segundos limpio lo que antes me tomaba media hora" (primera persona con resultado)

REGLA INVIOLABLE: la primera frase del guion DEBE alinearse con la estructura del ángulo elegido. Si elegiste Beneficio/Resultado, NUNCA abras con problema.
═════════════════════════════════════════════`
}

function bloqueReglasCTANivel(nivelConsciencia) {
  return `
═════════════════════════════════════════════
REGLAS DE CTA SEGÚN NIVEL DE CONSCIENCIA:

El nivel elegido es: ${nivelConsciencia || '(no especificado)'}

CTA SEGÚN NIVEL:

Nivel 1 (Inconsciente) → CTA tipo aprendizaje: "Aprende qué está pasando", "Mira por qué". NO mencionar producto. NO invitar a probar.

Nivel 2 (Consciente del problema) → CTA tipo entendimiento: "Entiende qué hay detrás", "Conoce la causa". NO mencionar producto.

Nivel 3 (Consciente de la solución) → CTA de DESCUBRIMIENTO PERSONAL + leve nota de valor. NO invita directamente al espectador a probar. Es más un comentario propio del avatar sobre lo que encontró.

EJEMPLOS DE TONO Nivel 3 (referencia de estilo, NO copiar literal):
- "Vale la pena conocerlo"
- "Esto fue lo que me funcionó a mí"
- "Por fin algo que sí cumple"
- "Lo que finalmente cambió todo para mí"
- "Esto sí funcionó como esperaba"
INCORRECTO en Nivel 3 (esto YA es Nivel 4):
❌ "Si te pasa lo mismo, échale un vistazo"
❌ "Te lo recomiendo si tienes este problema"
❌ "Pruébalo y mira la diferencia"
REGLA Nivel 3: el cierre debe sentirse como un COMENTARIO PROPIO del avatar, no como recomendación al espectador.

Nivel 4 (Consciente del producto) → CTA INVITA al espectador a CONSIDERARLO o PROBARLO. Más directo. Le habla al espectador.

EJEMPLOS DE TONO Nivel 4 (referencia de estilo, NO copiar literal):
- "Si te pasa lo mismo, échale un vistazo"
- "Pruébalo y mira la diferencia"
- "Te lo recomiendo si has tenido este problema"
- "Vale la pena que lo pruebes tú también"
- "Compáralo con lo que estás usando"

Nivel 5 (Totalmente consciente) → CTA de COMPRA DIRECTA con urgencia, oferta o escasez.

EJEMPLOS DE TONO Nivel 5 (referencia de estilo, NO copiar literal):
- "Aprovecha la oferta antes de que se acabe"
- "Asegura el tuyo hoy"
- "Últimas unidades disponibles"
- "Solo por hoy con envío gratis"
- "Pídelo ahora y recibe en 48 horas"

INSTRUCCIÓN DE VARIACIÓN OBLIGATORIA (aplica a Niveles 3, 4 y 5):
- Los ejemplos arriba son REFERENCIAS DE ESTILO Y TONO, NO plantillas para copiar.
- Genera SIEMPRE frases ORIGINALES adaptadas al producto, avatar y contexto del guion.
- NUNCA repitas literalmente las frases de los ejemplos.
- Si generas múltiples versiones (V1, V2), cada una debe tener un CTA DIFERENTE pero respetando el TONO del nivel correspondiente.
- El CTA debe sentirse natural y conectado con la narrativa del guion, no como una frase pegada al final.

REGLA INVIOLABLE: cada nivel respeta SU escala. Nunca uses una frase de Nivel 4 para un Nivel 3 ni viceversa. Si dudas, pregúntate:
- Nivel 3: ¿es un comentario propio del avatar sobre lo que encontró? → SÍ es nivel 3
- Nivel 4: ¿le habla al espectador para que considere probarlo? → SÍ es nivel 4
- Nivel 5: ¿hay urgencia, oferta o llamada a comprar ahora? → SÍ es nivel 5
═════════════════════════════════════════════`
}

// ── Regla numérica inviolable: producto dentro de las primeras 15 palabras ──
// Aplica a niveles 3-5. La valida también el validador post-generación.
function bloqueReglaProducto15(anguloVenta) {
  return `
═════════════════════════════════════════════
REGLA NUMÉRICA OBLIGATORIA DEL PRODUCTO (CRÍTICA — INVIOLABLE):
- Si el nivel es 3, 4 o 5, el nombre del producto (o una referencia clara como "esta pulverizadora", "este aparato", "este sistema") DEBE aparecer dentro de las PRIMERAS 15 PALABRAS del guion narrado.
- NO importa el ángulo elegido (${anguloVenta || 'el ángulo actual'}): TODOS los ángulos se acomodan a esta regla.
- Si el ángulo es Problema/Dolor, NO dediques más de 10 palabras al dolor antes de mencionar el producto.
- Si el ángulo es Beneficio/Resultado, el producto debe estar en la apertura junto al resultado.
- Si el ángulo es Curiosidad, la pregunta intrigante debe incluir o llegar al producto en 15 palabras.

EJEMPLOS POR ÁNGULO (todos cumplen producto ≤ 15 palabras):

Problema/Dolor + Nivel 3:
✅ "¿Cansado de fregar motores a mano? Esta pulverizadora cambió mi taller." (producto palabra 9)
✅ "Fregar motores destrozaba mi espalda. Esta pulverizadora lo arregló." (producto palabra 7)
❌ "¿Cansado de fregar? Yo pasaba horas raspando grasa, espalda destrozada, sin solución. Hasta que conseguí esta pulverizadora..." (producto palabra 17+, INACEPTABLE)

Beneficio/Resultado + Nivel 3:
✅ "Limpio en 5 minutos con esta pulverizadora de alta presión." (producto palabra 6)
✅ "Esta pulverizadora hace en 5 min lo que antes me tomaba 1 hora." (producto palabra 2)

Curiosidad + Nivel 3:
✅ "¿Sabías que esta pulverizadora limpia motores en 30 segundos?" (producto palabra 5)

Historia + Nivel 3:
✅ "Hace 3 meses conocí esta pulverizadora y mi taller cambió." (producto palabra 6)

Si tu guion no cumple esta regla, REESCRÍBELO antes de devolver la respuesta. Un guion que falle esta regla será rechazado y regenerado automáticamente.
═════════════════════════════════════════════`
}

const BLOQUE_AUTOVERIFICACION = `
ANTES DE DEVOLVER EL JSON, AUTOVERIFICA:
1. ¿La primera frase abre con resultado SIN imperativo "cómo"?
2. ¿El producto (nombre o categoría) aparece en las primeras 15 palabras? (si nivel ≥ 3)
3. ¿El último párrafo contiene una CTA explícita de descubrimiento? (Nivel 3)
4. ¿El motivo se refleja en el tono?

Si alguna respuesta es NO, REESCRIBE el guion. NO devuelvas un guion que falle estas verificaciones.`

const PRECIOS_MODELO = {
  'gpt-4.1-mini': { input: 0.40, output: 1.60 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
  'claude-haiku-4-5': { input: 1.00, output: 5.00 },
  'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 }
}
const TASA_USD_COP = 4000

function calcularCosto(modelo, inputTokens, outputTokens) {
  const p = PRECIOS_MODELO[modelo] || { input: 0, output: 0 }
  const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output
  const cop = usd * TASA_USD_COP
  return { usd, cop }
}

const ANGULOS_VENTA = {
  'Problema/Dolor': {
    que_hace: 'Activa el problema concreto que vive el avatar antes de cualquier solución',
    estructura: '1) Identifica el dolor específico con detalle sensorial. 2) Profundiza en cómo afecta el día a día del avatar. 3) Valida que no es culpa suya, hay una causa. 4) Apunta a que existe respuesta (sin decir cuál si es nivel 1-2)',
    tono: 'Empático, directo, sin rodeos',
    ejemplo: '¿Cansado de no poder dormir bien?'
  },
  'Beneficio/Resultado': {
    que_hace: 'Empieza mostrando el resultado final ya logrado, lo que el avatar tendrá',
    estructura: '1) Pinta la imagen del resultado deseado de forma vívida. 2) Conecta ese resultado con la realidad actual del avatar. 3) Explica brevemente cómo se llega ahí. 4) Cierre con invitación a hacerlo realidad',
    tono: 'Positivo, optimista, concreto',
    ejemplo: 'Pierde 5 kilos en 30 días sin dejar de comer lo que amas'
  },
  'Curiosidad': {
    que_hace: 'Genera intriga con un dato, pregunta o secreto que despierta necesidad de saber más',
    estructura: '1) Pregunta provocadora o dato sorprendente al inicio. 2) Mantén el misterio durante el desarrollo. 3) Ofrece pistas pero no resuelve completamente. 4) CTA hacia el enlace para descubrir más',
    tono: 'Misterioso, intrigante, casi conspirativo',
    ejemplo: 'El secreto que los dentistas no quieren que sepas'
  },
  'Urgencia/Escasez': {
    que_hace: 'El motor del guión es el tiempo o disponibilidad limitada',
    estructura: '1) Establece la oferta o disponibilidad. 2) Marca claramente el límite de tiempo o cantidad. 3) Visualiza la consecuencia de no actuar. 4) CTA inmediato y específico',
    tono: 'Urgente, directo, con tensión',
    ejemplo: 'Solo quedan 3 unidades. Oferta termina hoy'
  },
  'Autoridad/Prueba Social': {
    que_hace: 'Apoya el mensaje en evidencia externa, números, expertos o testimonios',
    estructura: '1) Establece la credencial o cifra impactante. 2) Conecta esa credencial con el avatar. 3) Refuerza con caso concreto o testimonio. 4) Invita al avatar a sumarse a quienes ya confían',
    tono: 'Confiado, respaldado, institucional pero cercano',
    ejemplo: 'Más de 10,000 clientes satisfechos en Colombia'
  },
  'Novedad': {
    que_hace: 'Posiciona el producto como algo recién llegado, descubrimiento o primero en su categoría',
    estructura: '1) Anuncia la novedad con énfasis. 2) Explica qué la hace diferente a lo que existía. 3) Muestra el contraste con la vieja forma. 4) Invita a ser de los primeros en probarlo',
    tono: 'Fresco, exclusivo, vanguardista',
    ejemplo: 'La primera app en Latinoamérica que hace X'
  },
  'Comparación/Contraste': {
    que_hace: 'Confronta el producto con la alternativa tradicional para mostrar por qué es superior',
    estructura: '1) Presenta lo que hace todo el mundo. 2) Muestra los problemas de esa alternativa. 3) Contrasta con la propuesta del producto. 4) Cierra con la elección obvia',
    tono: 'Argumentativo, racional, con contraste claro',
    ejemplo: 'Deja de gastar en pastillas que no funcionan. Esto sí tiene respaldo científico'
  },
  'Enemigo en Común': {
    que_hace: 'Identifica un villano externo contra el que el producto pelea junto al avatar',
    estructura: '1) Nombra al enemigo común con claridad. 2) Expone cómo te afecta a ti y al avatar. 3) Posiciona al producto como aliado contra ese enemigo. 4) Invita a unirse a la resistencia',
    tono: 'Combativo, cómplice, nosotros contra ellos',
    ejemplo: 'Las grandes farmacéuticas no quieren que sepas que esto existe'
  },
  'Historia': {
    que_hace: 'Cuenta una historia real (propia o de un cliente) que naturalmente lleva al producto',
    estructura: '1) Situación inicial del personaje. 2) Conflicto o momento de quiebre. 3) Descubrimiento donde aparece el producto. 4) Resolución y vida después',
    tono: 'Narrativo, humano, en primera persona',
    ejemplo: 'Hace 2 años no podía caminar sin dolor. Hoy entreno todos los días'
  },
  'Transformación': {
    que_hace: 'Muestra el antes y el después del avatar de forma clara y contrastada',
    estructura: '1) Pinta vívidamente el antes. 2) Marca el momento de cambio. 3) Pinta vívidamente el después. 4) Atribuye la transformación al producto',
    tono: 'Inspirador, con contraste fuerte, esperanzador',
    ejemplo: 'De no saber nada de inglés a trabajar en una empresa internacional en 8 meses'
  },
  'FOMO': {
    que_hace: 'Hace sentir al avatar que otros ya están avanzando sin él',
    estructura: '1) Describe lo que ya está pasando ahora mismo. 2) Posiciona al avatar como el que aún no actúa. 3) Visualiza la brecha que se crea. 4) Invita a no quedarse atrás',
    tono: 'Urgente, social, casi competitivo',
    ejemplo: 'Mientras lees esto, tu competencia ya está usando IA para vender más'
  },
  'Simplicidad': {
    que_hace: 'Le dice al avatar que lo que parecía difícil, con este producto es fácil',
    estructura: '1) Reconoce la dificultad percibida. 2) Desmonta el mito de complejidad. 3) Muestra los pocos pasos necesarios. 4) Invita a probar lo fácil que es',
    tono: 'Tranquilizador, claro, sin tecnicismos',
    ejemplo: 'No necesitas experiencia. En 3 pasos tienes tu negocio funcionando'
  },
  'Ironía/Provocación': {
    que_hace: 'Va contra la creencia común para generar reacción y romper el patrón',
    estructura: '1) Lanza la provocación o creencia opuesta. 2) Explica por qué la mayoría se equivoca. 3) Revela la lógica detrás del contrasentido. 4) Cierre que invita a pensar diferente',
    tono: 'Irreverente, sarcástico, anti-cliché',
    ejemplo: 'Dejar de hacer dieta fue lo que me hizo bajar de peso'
  },
  'Precio/Valor': {
    que_hace: 'Justifica económicamente el precio convirtiéndolo en inversión, no gasto',
    estructura: '1) Establece el precio o costo. 2) Lo compara con un gasto cotidiano del avatar. 3) Cuantifica el retorno o beneficio a largo plazo. 4) Resalta la ganancia real',
    tono: 'Lógico, calculador, justificado',
    ejemplo: 'Menos de lo que gastas en café al mes para dormir sin dolor el resto de tu vida'
  },
  'Exclusividad': {
    que_hace: 'Hace sentir al avatar que el producto no es para todos, sino para él específicamente',
    estructura: '1) Define quién SÍ es el cliente ideal. 2) Define quién NO es. 3) Refuerza la pertenencia al grupo selecto. 4) Invita a entrar al círculo',
    tono: 'Selectivo, premium, casi excluyente',
    ejemplo: 'Esto no es para todos. Solo para quienes van en serio con su salud'
  },
  'Aspiracional': {
    que_hace: 'Conecta el producto con la imagen, identidad o vida que el avatar quiere tener',
    estructura: '1) Muestra la vida o persona ideal. 2) Conecta esa imagen con valores del avatar. 3) Posiciona al producto como puente hacia esa identidad. 4) Invita a convertirse en esa versión',
    tono: 'Inspirador, deseable, identitario',
    ejemplo: 'Vive como la gente que sí tiene libertad financiera'
  }
}

const PROMPTS_POR_TIPO = {
  Emocional: `Quiero que actúes como un experto senior en marketing digital especializado en Meta Ads y respuesta directa.
Ayúdame a construir un guión para un video publicitario, basado en storytelling emocional tipo testimonio, diseñado para generar alta conversión.
El enfoque principal es provocar una emoción de validación y alivio: "No soy la única que ha pasado por esto... y sí hay una forma de manejarlo."
Transición emocional obligatoria: Frustración → Identificación → Alivio → Orgullo
OBJETIVO: Generar conexión emocional profunda. Validar una frustración real. Hacer que el espectador se sienta comprendido. Introducir el producto como descubrimiento natural. Terminar con sensación de control y orgullo. Impulsar la acción sin parecer venta agresiva.
ESTRUCTURA OBLIGATORIA:
1. Hook (0-3s) → Frase directa o situación incómoda/frustrante que detenga el scroll
2. Contexto real (problema vivido) → Qué estaba pasando en su día a día
3. Pensamiento interno (validación emocional) → Lo que sentía pero no decía
4. Momento de quiebre / insight → Algo cambia, descubre una alternativa
5. Introducción del producto (natural) → Como hallazgo o recomendación, no como venta
6. Transformación emocional → Menos frustración, más calma, más control
7. Cierre con orgullo + CTA suave
CLAVES: Sonar real. Lenguaje simple, humano, cercano. El producto NO es el héroe, es el facilitador.
ESTILO: Tipo selfie / UGC / testimonial. Cercano, íntimo, casi como confesión.
EMOCIÓN DOMINANTE: arco de Frustración hacia Orgullo.
PALABRAS CLAVE QUE DEBES INCORPORAR: yo sentía, no era la única, por fin, alivio, me entiende
PIEZA IDEAL: Storytelling / Testimonios
EVITA: Sonar como anuncio. Frases cliché. Promesas exageradas. CTA agresivos. Mencionar tiendas o plataformas de venta.`,

  Funcional: `Quiero que actúes como un experto senior en marketing digital especializado en Meta Ads y respuesta directa.
Ayúdame a construir un guión para un video publicitario, enfocado en resultado visible, estilo Before & After / UGC directo, diseñado para generar alta conversión.
El objetivo: la persona vea el cambio y sienta "Esto funciona... y yo también puedo hacerlo."
Emoción dominante: Duda → Evidencia → Confianza → Control
ESTRUCTURA OBLIGATORIA:
1. Hook (0-3s) → Mostrar resultado o contraste (before/after o problema evidente)
2. Situación inicial (Before) → Qué pasaba antes / problema visible
3. Proceso simple → Cómo usa el producto (rápido, claro)
4. Resultado visible (After) → Cambio concreto, fácil de percibir
5. Refuerzo de credibilidad → Tiempo, facilidad, experiencia real
6. Sensación de control → "Ahora sé cómo manejar esto"
7. Cierre con CTA natural
CLAVES: Mostrar > decir. Before creíble. After evidente pero realista. Ritmo dinámico.
ESTILO: UGC directo, tipo selfie o demostración real.
EMOCIÓN DOMINANTE: Confianza / Control.
PALABRAS CLAVE QUE DEBES INCORPORAR: mira cómo, el resultado es, en X días, la diferencia se nota
PIEZA IDEAL: Before & After / UGC directo
EVITA: Promesas irreales. Explicaciones técnicas. Sonar como comercial. Mencionar tiendas o plataformas de venta.`,

  Educativo: `Quiero que actúes como un experto senior en marketing digital especializado en Meta Ads y respuesta directa.
Ayúdame a construir un guión para un video publicitario que genere emoción educativa e impulse la conversión.
El objetivo: la persona sienta que aprendió algo importante y que el producto sea consecuencia lógica de ese aprendizaje.
ESTRUCTURA OBLIGATORIA:
1. Hook potente (que detenga el scroll)
2. Insight educativo / revelación o verdad poco conocida
3. Explicación clara del problema real
4. Cambio de percepción
5. Introducción del producto como herramienta lógica
6. Cierre persuasivo y natural con CTA verbal
TONO: Humano, directo y creíble. Sensación de autoridad y claridad.
EMOCIÓN DOMINANTE: Curiosidad / Claridad.
PALABRAS CLAVE QUE DEBES INCORPORAR: sabías que, la razón es, esto pasa porque, lo que muchos no saben
PIEZA IDEAL: Tutoriales / tips / comparativas
EVITA: Sonar como comercial. Frases genéricas. Promesas exageradas. Mencionar tiendas o plataformas de venta.`,

  Racional: `Quiero que actúes como un experto senior en marketing digital especializado en Meta Ads y respuesta directa.
Ayúdame a construir un guión para un video publicitario con enfoque racional basado en simplificación y método.
El objetivo: la persona entienda el problema y sienta "Ahora lo entiendo... esto es más simple de lo que creía."
Emoción dominante: Confusión → Claridad → Orden → Tranquilidad
ESTRUCTURA OBLIGATORIA:
1. Hook racional (0-3s) → Romper una creencia o simplificar algo complejo
2. Identificación del problema → Qué está haciendo mal la mayoría
3. Explicación simple → Por qué ocurre realmente
4. Método claro (2-3 pasos concretos)
5. Introducción del producto como herramienta del método
6. Resultado mental/emocional → Sensación de orden y control
7. Cierre con CTA natural
ESTILO: Tipo guía corta / mini tutorial. Tono seguro, claro y tranquilo.
EMOCIÓN DOMINANTE: Orden / Tranquilidad.
PALABRAS CLAVE QUE DEBES INCORPORAR: el método, los pasos son, sin complicaciones, claro y simple
PIEZA IDEAL: Explicativos / guías cortas
EVITA: Explicaciones largas. Lenguaje técnico. Sonar como conferencia. CTA agresivos. Mencionar tiendas o plataformas de venta.`,

  Aspiracional: `Eres un copywriter senior especializado en marketing de respuesta directa con visión de transformación de identidad.

Tu tarea: escribir un guión publicitario ASPIRACIONAL.

EMOCIÓN DOMINANTE: Deseo y admiración. El avatar debe sentir "yo quiero ser esa persona".

ENFOQUE: Imagen, identidad y transformación de vida. NO se trata del producto, se trata de en quién se convierte el avatar usándolo.

ESTRUCTURA NARRATIVA OBLIGATORIA:
1. Vida actual del avatar con la insatisfacción sutil de no ser quien quiere ser
2. Vida deseada, la persona en la que quiere convertirse
3. Producto como puente entre esas dos vidas
4. Cierre invitando a convertirse en esa versión

PALABRAS CLAVE QUE DEBES INCORPORAR: vive como, sé esa persona, tu mejor versión, por fin tener, convertirte en

PIEZA IDEAL: Lifestyle, video aspiracional, transformación de identidad

EVITA: Hablar de características técnicas, precios, beneficios funcionales. Esto NO es Funcional ni Racional, es identidad pura.`
}

const FORMATOS_IMAGEN = {
  Funcional: {
    descripcion: 'Producto en acción real. El diseñador sabe exactamente qué escena capturar.',
    parametros: `FORMATO FUNCIONAL — la descripción debe ser una escena concreta y cinematográfica:
Para cada idea describe:
1. LA ESCENA EXACTA: qué persona, en qué momento del día, haciendo qué actividad específica con el producto
2. EL PLANO: close-up de manos usando el producto, plano medio mostrando cuerpo+producto, o detalle del producto en acción
3. EL MOMENTO CLAVE: el instante más impactante — el antes de usar vs el mientras usa, la reacción de satisfacción, el detalle que muestra que funciona
4. AMBIENTE Y LUZ: interior/exterior, iluminación natural o artificial, colores dominantes de la escena
5. LO QUE HACE QUE PARE EL SCROLL: el elemento visual más disruptivo de esa imagen específica
NO describas el producto en abstracto — describe la escena como si fuera una fotografía ya tomada`
  },
  Collage: {
    descripcion: 'Varias piezas combinadas que juntas cuentan la historia completa del producto.',
    parametros: `FORMATO COLLAGE — describe exactamente qué imagen va en cada zona:
Para cada idea define:
1. CUÁNTAS PIEZAS: 3 o 4 zonas (especifica la distribución: 2 arriba + 1 abajo, o 1 grande + 2 pequeñas, etc.)
2. QUÉ VA EN CADA ZONA: imagen específica y concreta para cada cuadrante (ej: zona 1 = mano ajustando el velcro en primer plano, zona 2 = persona caminando con confianza, zona 3 = producto solo sobre fondo limpio)
3. EL HILO CONDUCTOR: qué elemento visual une todas las piezas (color de fondo, línea, el producto apareciendo en cada una)
4. LA PIEZA HÉROE: cuál de las zonas debe dominar visualmente y por qué
5. TIPOGRAFÍA: dónde va el hook y en qué zona se superpone`
  },
  'Antes y Después': {
    descripcion: 'El contraste visual más impactante para este producto específico.',
    parametros: `FORMATO ANTES Y DESPUÉS — el contraste debe ser obvio y emocional:
Para cada idea especifica:
1. LA ESCENA ANTES: describe exactamente la imagen del problema — qué se ve, qué expresa la persona, qué detalle muestra el dolor (ej: marcas rojas en la cintura, pantalón bajado, gesto de incomodidad al agacharse)
2. LA ESCENA DESPUÉS: el mismo contexto pero resuelto — misma persona o ángulo, misma actividad, pero ahora con el resultado (ej: moviéndose con libertad, sin marcas, sonrisa natural)
3. LA DIVISIÓN: cómo separar las dos mitades (línea con logo del producto, flecha, contraste de color)
4. COLORES: ANTES en tonos fríos/apagados, DESPUÉS en tonos cálidos/vibrantes
5. EL DETALLE MÁS IMPACTANTE: el close-up específico que hace obvia la diferencia`
  },
  Infográfico: {
    descripcion: 'Información organizada que educa y convence visualmente.',
    parametros: `FORMATO INFOGRÁFICO — estructura clara y jerarquía visual definida:
Para cada idea especifica:
1. EL DATO O VERDAD CENTRAL: el insight más poderoso para este producto que va en grande arriba
2. LOS 3-4 PUNTOS: qué información específica va en cada bloque (no genérico — usa datos reales del producto)
3. ICONOS: qué icono simple representa cada punto (describe el icono, no digas "icono de check")
4. JERARQUÍA TIPOGRÁFICA: qué texto va grande, mediano y pequeño
5. FONDO Y COLOR: color dominante, color de acento, estilo general (minimalista, oscuro premium, blanco limpio)
6. ELEMENTO VISUAL: si hay imagen del producto, dónde va y qué tamaño`
  },
  Beneficios: {
    descripcion: 'Los beneficios más convincentes para este producto y este público.',
    parametros: `FORMATO BENEFICIOS — elige los beneficios más relevantes para este producto específico:
Para cada idea especifica:
1. LOS 3-5 BENEFICIOS EXACTOS: no genéricos, específicos de este producto (ej: "se ajusta sin quitar el pantalón", no "fácil de usar")
2. CÓMO SE PRESENTAN: lista vertical con iconos, tarjetas en grid, lista con checkmarks grandes
3. EL PRODUCTO: cómo aparece — foto real en uso al lado, producto solo en esquina, o integrado entre los beneficios
4. JERARQUÍA: qué beneficio va primero (el más poderoso para este público) y por qué
5. ESTILO VISUAL: fondo, tipografía, color de iconos y accents`
  },
  'Respuesta a Comentario': {
    descripcion: 'Captura de comentario orgánico de un usuario hablando del beneficio — sin respuesta de marca.',
    parametros: `FORMATO COMENTARIO ORGÁNICO — es la captura de UN solo comentario de usuario, no una conversación:
Para cada idea especifica:
1. LA PLATAFORMA: TikTok, Instagram o Facebook — elige la más creíble para este producto y público (describe la interfaz exacta)
2. EL COMENTARIO: texto EXACTO de máximo 30-35 palabras. Tono 100% orgánico, coloquial, con 1-2 emojis naturales, como lo escribiría una persona real en redes. Corto, directo, creíble. NO hay respuesta de la marca.
3. EL USERNAME: nombre de usuario creíble y humano (no "UsuarioFlexpro91" — algo como "andres.mr" o "carlosg_co")
4. DETALLES DE REALISMO: foto de perfil genérica pero creíble, número de likes naturales (entre 12 y 340), hora o fecha del comentario
5. CONTEXTO VISUAL: fondo de la captura — ¿se ve parte de la publicación original arriba? ¿fondo sólido? ¿imagen del producto borrosa detrás?
IMPORTANTE: Este formato es la EXCEPCIÓN a la regla de 6 bullets — en "Texto en imagen" pon UN SOLO bullet con el texto exacto del comentario completo (máximo 30-35 palabras, con emojis). NO pongas bullets de beneficios — el comentario ES el texto en imagen. Ejemplo:
• "Llevo un mes usándola en el trabajo y ya no se me baja el pantalón ni una sola vez 🙌 super recomendada para los que trabajamos moviéndonos todo el día"`
  },
  Testimonial: {
    descripcion: 'Testimonio que se ve real, humano y creíble — no corporativo.',
    parametros: `FORMATO TESTIMONIAL — autenticidad ante todo:
Para cada idea especifica:
1. LA PERSONA: descripción física concreta y natural (no "mujer sonriente" — sé específico: edad aproximada, contexto, lo que la hace creíble para este producto)
2. LA CITA EXACTA: escribe el texto del testimonio — máximo 2 líneas, resultado concreto con detalle real (ej: "Llevo 3 semanas usándola en el trabajo y ya no tengo que estar ajustando el pantalón cada rato" es mejor que "Me encantó el producto")
3. NOMBRE Y PERFIL: nombre completo ficticio creíble + ciudad o profesión si suma credibilidad
4. ESTRELLAS Y DETALLE: ⭐⭐⭐⭐⭐ visible, fecha o "compra verificada" si aplica
5. COMPOSICIÓN: cómo está dispuesta la foto de la persona, la cita y el producto en la imagen
6. ESTILO: cálido y natural, iluminación suave, no pose de catálogo`
  }
}

const PROMPT_IMAGEN_BASE = (formatoImg) => {
  const fmt = FORMATOS_IMAGEN[formatoImg] || FORMATOS_IMAGEN['Funcional']
  return `Quiero que actúes como un experto senior en marketing digital especializado en Meta Ads y respuesta directa con más de 5 años creando creativos de alta conversión.

Tu misión es crear 2 IDEAS DE IMAGEN en formato ${formatoImg.toUpperCase()} para un anuncio estático de alta conversión en tráfico frío. Las 2 ideas deben seguir el mismo formato pero con enfoques, ángulos y mensajes completamente diferentes.

${fmt.parametros}

Para cada idea usa EXACTAMENTE esta estructura — las 3 secciones son OBLIGATORIAS, nunca omitas ninguna:

IDEA DE IMAGEN [número]

Hook: [Frase COMPLETA y autosuficiente, entre 5 y 9 palabras. NUNCA cortes la frase ni dejes preposiciones colgando ("de", "la", "para", "con", etc al final). Si la idea no cabe en 9 palabras, reformula. Directo, contundente, que detenga el scroll. Ya adaptado al producto.]

Descripción de la imagen:
• Composición: [máx 10 palabras concretas]
• Elemento clave: [máx 10 palabras — el detalle que detiene scroll]
• Ambiente y luz: [máx 8 palabras — color dominante + tipo de luz]
• Plano: [máx 6 palabras — close-up / plano medio / general]

Texto en imagen:
• [bullet 5-7 palabras]
• [bullet 5-7 palabras]
• [bullet 5-7 palabras]
• [bullet 5-7 palabras]
• [bullet 5-7 palabras]
• [bullet 5-7 palabras]

---

REGLAS ABSOLUTAS DE FORMATO (no negociables):
1. CADA IDEA DEBE TENER LAS 3 SECCIONES EN ORDEN: "Hook:", "Descripción de la imagen:", "Texto en imagen:". Si omites cualquiera de las 3, el output es INVÁLIDO.
2. "Descripción de la imagen" tiene EXACTAMENTE 4 viñetas con los labels en este orden: Composición, Elemento clave, Ambiente y luz, Plano. NUNCA escribas párrafos, oraciones largas ni texto corrido.
3. "Texto en imagen" tiene EXACTAMENTE 6 viñetas, cada una de 5-7 palabras. Ni más ni menos.
4. NO incluyas explicaciones, justificaciones, "hilo conductor", "pieza héroe", "tipografía" o teoría de diseño. Solo las 4 viñetas pedidas en Descripción.
5. NO termines con preguntas al usuario tipo "¿quieres que desarrolle copy?", "¿te ayudo con algo más?". El output termina después de la última idea con ---.
6. Cada viñeta debe respetar su límite de palabras. Si excedes, recórtala.
7. NO uses la palabra "Zona 1, Zona 2" en la descripción salvo que el formato sea Collage. Para los demás formatos describe la escena directamente.
8. Los labels Hook:, Descripción de la imagen:, Texto en imagen: deben aparecer EXACTAMENTE así escritos (con los dos puntos al final). No los cambies a "Texto:", "Imagen:", etc.`
}

// ── FIX #10 — helpers anti-fuga marca/producto en niveles 1-2 ──
function debeSanitizar(nivel) {
  const n = parseInt(nivel, 10)
  return n === 1 || n === 2
}

function redactarBloquesNivel12(userMsg) {
  if (!userMsg) return userMsg
  let out = String(userMsg)
  // Eliminar línea PRODUCTO: ... (hasta el siguiente salto)
  out = out.replace(/^PRODUCTO:\s*[^\n]*\n?/gm, '')
  // Eliminar línea URL: ... (hasta el siguiente salto)
  out = out.replace(/^URL:\s*[^\n]*\n?/gm, '')
  // Eliminar el bloque entero CONTEXTO_ADVERTORIAL_FUENTE
  out = out.replace(/═══\s*CONTEXTO_ADVERTORIAL_FUENTE\s*═══[\s\S]*?(?:═══════════════════════════════|$)/g, '')
  // Insertar marcador de información omitida
  out = out.trimEnd() + '\n\n[INFORMACIÓN DEL PRODUCTO OMITIDA — el nivel actual prohíbe mencionar producto, marca, mecanismo o ingredientes. Solo trabaja con AVATAR, ÁNGULO, MOTIVO y NIVEL.]\n'
  return out
}

const BLOQUE_REFUERZO_NIVEL12 = `

PROHIBICIÓN ABSOLUTA EN ESTE NIVEL DE CONSCIENCIA (CRÍTICO):

QUÉ NO PUEDES HACER:
- NO uses narrativas de logro: "Compré esto...", "Descubrí que...", "Resulta que...", "Cuando entendí...", "Ahora ya no...", "En X días noté...", "La diferencia se nota", "El resultado es", "Cambió todo", "Mi vida cambió".
- NO menciones que existe solución, método, mecanismo, producto o fórmula. NI vagamente. NI con eufemismos tipo "esto", "algo", "lo que descubrí", "lo que están haciendo", "lo que ya cambió todo".
- NO uses CTA del estilo "encuentra la solución", "descubre cómo lo resolvieron", "lo que ya están haciendo". Eso insinúa que hay respuesta esperando.
- NO uses estas palabras: solución, método, producto, fórmula, secreto, descubrimiento, resultado, alivio (si va en contexto de "encontré alivio"), cambió, transformó.
- NO digas "no eres el único" combinado con "miles ya lo resolvieron". El "ya lo resolvieron" insinúa solución.
- NO uses verbos de logro en pasado: compré, descubrí, encontré, probé, conseguí.

QUÉ SÍ PUEDES HACER:
- Describir el dolor o problema concreto del avatar con detalle vivido.
- Validar la frustración: "si te pasa esto, no eres el único en sentirlo".
- Generar curiosidad sobre el problema: "¿sabías que tu cuerpo te avisa de X?", "hay una razón concreta detrás de esto".
- Educar sobre el problema en sí (qué pasa, por qué pasa) SIN decir cómo se resuelve.

CTA PERMITIDO (lleva a ENTENDER el problema, NO a la solución):
✅ "Mira en el enlace por qué te pasa esto"
✅ "Aprende qué está pasando realmente"
✅ "Entra al enlace y entiende qué hay detrás de esto"
❌ NO: "Mira cómo otros ya lo resolvieron"
❌ NO: "Descubre la solución"
❌ NO: "Lo que ya está cambiando vidas"

EJEMPLOS DE GUIONES NIVEL 1-2 BIEN CONSTRUIDOS:
✅ "Si llegas al final del día con la cintura marcada y bolsillos pesados, no es coincidencia. Hay una razón concreta detrás de eso. Te lo explico en el enlace."
✅ "Tu pantalón cayéndose cada vez que te agachas no es 'parte del oficio'. Es una señal. Mira por qué te pasa."
✅ "¿Sabías que el dolor en las rodillas al subir escaleras tiene una causa concreta? Aprende qué pasa en tu cuerpo."

EJEMPLOS DE GUIONES NIVEL 1-2 MAL CONSTRUIDOS (NO HAGAS ESTO):
❌ "Compré esto para mi cintura y ahora ya no se afloja" → menciona "esto" (insinúa producto)
❌ "Descubrí que había una razón científica y todo cambió" → "todo cambió" insinúa solución
❌ "Mira cómo otros ya cambiaron y resolvieron" → insinúa que existe solución y otros la encontraron
❌ "Cuando entendí qué pasaba, mi vida cambió" → insinúa transformación con producto
❌ "El resultado es que termino el turno sin ese cansancio" → "el resultado" implica que hay algo que da resultado

CHEQUEO OBLIGATORIO ANTES DE ENVIAR:
1. Lee tu guión completo. ¿Insinúa que existe una solución? Si sí, REESCRÍBELO.
2. ¿Hay verbos de logro en pasado (compré, descubrí, encontré, probé)? Si sí, ELIMÍNALOS.
3. ¿El CTA invita a CONOCER el problema o a CONOCER la solución? Si invita a la solución, REESCRÍBELO.
4. ¿Una persona que no sabe que existe ningún producto podría leer esto sin sentirse vendida? Si no, REESCRÍBELO.
`

// ── FIX #8 — ejes fijos para 2 llamadas paralelas en imagen ──
const EJES_IMAGEN = [
  {
    id: 1,
    nombre: 'Emocional / Problema',
    instruccion: 'Esta idea debe ANCLARSE en la emoción o problema concreto del avatar ANTES de mostrar la solución. Headline empático/empuja-dolor. Foco visual en el dolor, frustración o vergüenza del avatar. La solución (producto) aparece secundaria o sugerida, no protagónica.'
  },
  {
    id: 2,
    nombre: 'Demostrativo / Evidencia',
    instruccion: 'Esta idea debe centrarse en PRUEBA o EVIDENCIA: transformación visible, antes/después, datos concretos, números, comparación con la alternativa, demostración del producto en uso. Headline factual/demostrativo. Foco visual en el resultado o el contraste.'
  }
]

// ── Reglas del motivo aplicadas DIFERENTE a imagen (1 frame) vs video (secuencia con tiempo) ──
const REGLA_IMAGEN_POR_MOTIVO = {
  'Emocional': 'EMOCIÓN VIVIDA POR EL AVATAR AL USAR EL PRODUCTO. Captura el momento de alivio/orgullo/validación. NO frustración aislada sin solución a la vista.',
  'Funcional': 'PRODUCTO EN USO RESOLVIENDO. Producto funcionando, ajustado, en acción. NO muestres el problema sin producto. NO muestres el producto fallando. NO situación previa.',
  'Educativo': 'AHA-MOMENT visual. Descubrimiento, dato curioso visible, comparación que ilumina. Avatar comprendiendo o producto explicando con elementos visuales (íconos, comparativas).',
  'Aspiracional': 'AVATAR VIVIENDO LA VIDA DESEADA con el producto. Identidad transformada, lifestyle aspiracional. NO la versión actual sin transformar.',
  'Racional': 'PRODUCTO Y SU MÉTODO COMO SISTEMA CLARO. Orden, simplicidad visible, organización metódica. NO caos ni confusión.'
}

const REGLA_VIDEO_POR_MOTIVO = {
  'Emocional': 'Estructura narrativa: frustración personal del avatar (≤20% del tiempo) → identificación → momento de alivio con el producto → orgullo final. El producto debe aparecer en la segunda mitad del guión, NO solo en los últimos 2 segundos.',
  'Funcional': 'Estructura narrativa: problema concreto (≤15% del tiempo) → demostración del producto en uso (≥40%) → resultado/evidencia visible (≥45%). El producto FUNCIONANDO debe ocupar la mayor parte del tiempo, NO el problema.',
  'Educativo': 'Estructura: pregunta o dato curioso al inicio → explicación clara con el producto como herramienta de demostración → aplicación práctica final. La explicación debe ser concreta y visualizable.',
  'Aspiracional': 'Estructura: vida actual del avatar (≤15%) → contraste con vida deseada → producto como puente hacia esa vida → invitación a convertirse. La vida deseada debe ocupar más tiempo que la actual.',
  'Racional': 'Estructura: confusión común inicial (≤15%) → método organizado paso a paso (≥60%) → tranquilidad mental final. Producto presentado como sistema simple, no como producto que se usa.'
}

// ── Reglas del HOOK por ángulo (mismas para imagen y video, los 16 ángulos aplican a ambos) ──
const HOOK_POR_ANGULO = {
  'Problema/Dolor': {
    instruccion: 'El HOOK debe nombrar el dolor concreto del avatar.',
    buenos: ['"Si llegas a la noche con la espalda destrozada"', '"El dolor que cargas todos los días"'],
    malos: ['Hooks genéricos que no nombran el dolor']
  },
  'Beneficio/Resultado': {
    instruccion: 'El HOOK debe mostrar el resultado final ya logrado.',
    buenos: ['"Dormí 8 horas seguidas por primera vez"', '"Acabados de chef sin salir de casa"'],
    malos: ['Hooks que describen el problema antes que el resultado']
  },
  'Curiosidad': {
    instruccion: 'El HOOK debe generar intriga con dato/pregunta/secreto.',
    buenos: ['"El error que el 90% comete sin saber"', '"Lo que ningún experto te cuenta"'],
    malos: ['Hooks que dan la respuesta directamente']
  },
  'Urgencia/Escasez': {
    instruccion: 'El HOOK debe transmitir urgencia de tiempo o disponibilidad limitada.',
    buenos: ['"Solo 12 unidades antes del próximo lote"', '"Esta semana o esperas hasta marzo"'],
    malos: ['Hooks sin sentido de tiempo limitado']
  },
  'Autoridad/Prueba Social': {
    instruccion: 'El HOOK debe apoyarse en cifras o expertos.',
    buenos: ['"Más de 12.000 personas ya lo usan"', '"Recomendado por 9 de cada 10 doctores"'],
    malos: ['Hooks sin números ni respaldo']
  },
  'Novedad': {
    instruccion: 'El HOOK debe posicionar como descubrimiento reciente.',
    buenos: ['"Lo nuevo que cambió todo este año"', '"El primer X que llega al país"'],
    malos: ['Hooks que suenan antiguos o conocidos']
  },
  'Comparación/Contraste': {
    instruccion: 'El HOOK debe contrastar la alternativa vieja con la nueva.',
    buenos: ['"X tradicional vs X con método"', '"De $200 a $20 sin perder calidad"'],
    malos: ['Hooks que solo elogian sin contrastar']
  },
  'Enemigo en Común': {
    instruccion: 'El HOOK debe nombrar al villano externo.',
    buenos: ['"La industria del azúcar te hizo creer..."', '"Lo que las empresas no quieren que sepas"'],
    malos: ['Hooks sin enemigo identificado']
  },
  'Historia': {
    instruccion: 'El HOOK debe arrancar narrativa real con personaje.',
    buenos: ['"Hace 8 meses no podía levantarme..."', '"Mi tía Marta probó esto y..."'],
    malos: ['Hooks genéricos sin protagonista']
  },
  'Transformación': {
    instruccion: 'El HOOK debe contrastar antes/después.',
    buenos: ['"De 92kg a 74kg sin pasar hambre"', '"Pasé de 0 ventas a 30 al mes"'],
    malos: ['Hooks que solo mencionan el después sin antes']
  },
  'FOMO': {
    instruccion: 'CRÍTICO: el HOOK debe comunicar URGENCIA SOCIAL. Estructuras: "Mientras tú dudas...", "X cantidad ya cambiaron", "Lo que la mayoría YA está usando", "Te quedas fuera si no..."',
    buenos: ['"Mientras tú dudas, ellas ya recuperaron su energía"', '"347 mamás ya hicieron el cambio"', '"La cocina que el resto del barrio ya tiene"'],
    malos: ['Hooks genéricos como "Vas a necesitar esto" — eso NO es FOMO, es solo necesidad']
  },
  'Simplicidad': {
    instruccion: 'El HOOK debe destacar lo fácil del enfoque.',
    buenos: ['"Sin contar calorías ni pesar comida"', '"3 pasos y listo"'],
    malos: ['Hooks que muestran complejidad']
  },
  'Ironía/Provocación': {
    instruccion: 'El HOOK debe ir contra una creencia común.',
    buenos: ['"Hacer más cardio te está engordando"', '"Beber agua te puede deshidratar"'],
    malos: ['Hooks que confirman lo obvio']
  },
  'Precio/Valor': {
    instruccion: 'El HOOK debe enmarcar el precio como inversión.',
    buenos: ['"Cuesta lo mismo que dos almuerzos al mes"', '"Por menos de un café diario"'],
    malos: ['Hooks sin contexto de valor']
  },
  'Exclusividad': {
    instruccion: 'El HOOK debe filtrar a quién va dirigido.',
    buenos: ['"Esto NO es para quien busca atajos"', '"Solo para quien quiere método"'],
    malos: ['Hooks genéricos abiertos a todos']
  },
  'Aspiracional': {
    instruccion: 'El HOOK debe conectar con la identidad/vida deseada.',
    buenos: ['"Conviértete en la versión que siempre supiste que podías ser"', '"Vive como tu yo de los próximos 10 años"'],
    malos: ['Hooks centrados en el problema, no en la aspiración']
  }
}

// ── Validador post-respuesta del hook ──
function hookTerminaMal(hook, esImagen = false) {
  if (!hook) return true
  const limpio = hook.trim().replace(/[.!?¿¡,;:]+$/, '').trim()
  const palabras = limpio.split(/\s+/).filter(Boolean)
  const ultimo = palabras[palabras.length - 1]?.toLowerCase() || ''
  const palabrasMalas = new Set([
    'y','o','u','e','de','del','al','la','el','los','las','un','una','unos','unas',
    'para','con','por','en','sin','a','hacia','desde','hasta','ante','bajo','contra',
    'entre','según','sobre','tras','mientras','cuando','que','si','no',
    'mi','tu','su','mis','tus','sus','este','esta','estos','estas','ese','esa','esos','esas',
    'es','son','está','están','sea','solo','sólo','muy','más','menos','también','tampoco',
    'le','les','lo','los','la','las','me','te','se','nos','os'
  ])
  if (palabrasMalas.has(ultimo)) return true
  if (esImagen && palabras.length > 7) return true
  return false
}

function extraerHookDeRespuesta(text) {
  if (!text) return ''
  const m = String(text).match(/Hook\s*:\s*([\s\S]*?)(?=\n\s*(?:Descripci[oó]n|Imagen|Bullets|Texto)\s*:|\n\s*---|$)/i)
  return m ? m[1].trim().replace(/\n+/g, ' ') : ''
}

// ── FIX #7 — bloque de relleno para hooks preseleccionados de HOOKS_JEFE ──
const RELLENO_BLOCK = (hookText) => `

HOOK ELEGIDO PARA ESTA VERSIÓN: ${hookText}

REGLAS DE RELLENO DEL HOOK (OBLIGATORIAS):
- Si el hook contiene ___ : reemplaza cada ___ con 1-3 palabras coherentes con el producto/avatar/ángulo. Usa palabras concretas y específicas, no genéricas.
- Si el hook contiene # : reemplaza con un número específico (preferentemente entre 3 y 7).
- Mantén la estructura original del hook intacta. NO cambies el orden de las palabras ni reescribas el hook.
- El hook DEBE quedar AL INICIO del guión, integrado naturalmente como apertura. La narración del guión continúa desde ahí.
- Si el hook resulta forzado para este contexto, prefiere mantenerlo y adaptar la narración alrededor en lugar de modificarlo.`

// ── FIX #7 — bloque para variaciones/correcciones que preservan el hook existente ──
const RELLENO_BLOCK_PRESERVAR = `

REGLAS DE PRESERVACIÓN DEL HOOK (OBLIGATORIAS):
- Mantén el hook ORIGINAL del guión intacto al inicio. NO lo cambies, NO lo reescribas.
- NO cambies el orden de las palabras del hook ni sustituyas sinónimos.
- Si el hook contiene placeholders ___ o # ya rellenados, mantenlos exactamente como están.
- La narración continúa desde el hook. La variación o corrección afecta el cuerpo del mensaje, no el hook.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { messages, modo, apiProvider, modelo, formato } = req.body
  const provider = apiProvider || 'openai'
  const modeloGPT = (modelo && modelo.startsWith('gpt')) ? modelo : 'gpt-4o-mini'
  const modeloClaude = (modelo && modelo.startsWith('claude')) ? modelo : 'claude-sonnet-4-6'
  const modeloUsado = provider === 'claude' ? modeloClaude : modeloGPT

  let costoOperacion = {
    modelo: modeloUsado,
    llamadas: [],
    totales: { inputTokens: 0, outputTokens: 0, usd: 0, cop: 0 }
  }
  function registrarLlamada(tipo, modeloLlamada, inputTokens, outputTokens) {
    const inT = inputTokens || 0
    const outT = outputTokens || 0
    const c = calcularCosto(modeloLlamada, inT, outT)
    costoOperacion.llamadas.push({ tipo, modelo: modeloLlamada, inputTokens: inT, outputTokens: outT, usd: c.usd, cop: c.cop })
    costoOperacion.totales.inputTokens += inT
    costoOperacion.totales.outputTokens += outT
    costoOperacion.totales.usd += c.usd
    costoOperacion.totales.cop += c.cop
  }

  try {
    const body = JSON.parse(JSON.stringify(messages))
    const isAnalisis = modo === 'analizar'
    const isGenerar = modo === 'generar'
    const isVariaciones = modo === 'variaciones'
    let promptEjecutado = ''
    let imagePrompts3 = null  // FIX #8 — set por la rama imagen para señalizar 2 llamadas paralelas
    let hooksIndicesUsados = []  // anti-repetición: índices de HOOKS_JEFE escogidos en este request, devueltos al frontend

    if (isAnalisis) {
      // ── Logs de diagnóstico temporal — bug imágenes en modo Crear ──
      console.log('[GENERATE-ANALISIS] === INICIO ===')
      console.log('[GENERATE-ANALISIS] Provider:', apiProvider, 'Modelo:', modelo)
      console.log('[GENERATE-ANALISIS] body[0].content tipo:', Array.isArray(body[0].content) ? 'array' : typeof body[0].content)
      if (Array.isArray(body[0].content)) {
        console.log('[GENERATE-ANALISIS] Cantidad de partes:', body[0].content.length)
        body[0].content.forEach((parte, i) => {
          console.log('[GENERATE-ANALISIS] Parte ' + i + ' tipo:', parte.type, parte.type === 'image_url' ? 'URL len: ' + (parte.image_url?.url?.length || 0) : 'texto len: ' + (parte.text?.length || 0))
        })
      }
      // El frontend manda body[0].content como string (solo texto) o como
      // array multimodal [{type:'text'},{type:'image_url'},...] cuando el
      // usuario sube imágenes. Antes se interpolaba el array tal cual en el
      // prompt → "[object Object],[object Object]" y, además, la línea
      // `body[0].content = promptAnalisis` descartaba las imágenes. El LLM
      // recibía un prompt sin producto y respondía "Espero el contenido...".
      // Aquí separamos el texto de las imágenes para tratarlos por separado.
      const contenidoUser = body[0].content
      const esMultimodal = Array.isArray(contenidoUser)
      const userMsg = esMultimodal
        ? contenidoUser.filter(p => p && p.type === 'text').map(p => p.text).join('\n').trim()
        : contenidoUser
      const imagenesUser = esMultimodal
        ? contenidoUser.filter(p => p && (p.type === 'image_url' || p.type === 'image'))
        : []
      const notaImagenes = imagenesUser.length > 0
        ? `\n\nEl usuario adjuntó ${imagenesUser.length} imagen(es) del producto. Analízalas con visión como fuente principal de información: identifica qué es el producto, qué hace, sus características visibles, su uso y su público. Combínalas con los datos de texto de arriba para construir el análisis.`
        : ''
      const promptAnalisis = `Eres un experto senior en marketing digital especializado en Meta Ads, TikTok Ads y respuesta directa para ecommerce. Tienes profundo conocimiento de Eugene Schwartz, Joe Sugarman, Dan Kennedy, Gary Halbert y Alex Hormozi.

${userMsg}${notaImagenes}

Antes de responder el JSON, piensa internamente estas preguntas sobre el producto:

1. NIVEL DE CONSCIENCIA: En este mercado (Colombia/Guatemala ecommerce), la mayoria de personas que podrian comprar este producto: saben que tienen el problema que resuelve? Lo buscan activamente? Han visto productos similares? Ya conocen esta marca? Segun eso asigna el nivel real (1=inconsciente, 2=saben el problema, 3=buscan solucion, 4=conocen productos similares, 5=ya conocen esta marca).

IMPORTANTE para los niveles: el campo "angulo" debe describir como llegar al publico en ese nivel de consciencia (el mensaje, el enfoque del contenido, el dolor o deseo a activar). NO menciones tipos de creativo (Emocional, Funcional, Educativo, etc.) dentro de los niveles. Los tipos van en la seccion separada de abajo.

2. TIPOS DE CREATIVO: Para este producto especifico, piensa que tipo de video generaria mas ventas en frio y por que. Considera: tiene resultado visible? Tiene historia emocional? Requiere explicacion? Es tecnico? Es aspiracional? Asigna scores del 10 al 99 donde el mejor tipo para este producto tenga el score mas alto y los demas reflejen cuanto menos aplican. Los 5 scores DEBEN ser diferentes entre si.

3. AVATARES: Identifica 5 perfiles de comprador para este producto. CRITERIO DE ORDEN: prioriza por TAMAÑO DE PÚBLICO (cuántas personas hay potencialmente), no por especificidad. Públicos amplios y masivos primero. La relevancia (1-100) debe reflejar qué tan grande es el público multiplicado por qué tan alineado está con el producto.
- Avatares 1 al 4: los 4 públicos más grandes y alineados con la funcionalidad del producto. Ordenados de mayor a menor en relevancia.
- Avatar 5: un avatar RARO o lateral — un público inesperado pero válido para el producto, que abre un ángulo creativo no obvio. Score más bajo pero presente como opción disruptiva.
Para cada uno: nombre del avatar, descripcion breve, dolor principal, tamano_publico (estimación cualitativa: "Masivo - millones", "Amplio - cientos de miles", "Mediano - decenas de miles", "Específico - miles", "Nicho - cientos"), relevancia (1-100).
El avatar_recomendado es el índice (0-4) del más relevante por tamaño + alineación.

4. ANGULOS DE VENTA RECOMENDADOS: De los 16 ángulos posibles, identifica los 5 más efectivos para este producto con score del 1 al 100 y por qué. Los 16 ángulos son: Problema/Dolor, Beneficio/Resultado, Curiosidad, Urgencia/Escasez, Autoridad/Prueba Social, Novedad, Comparación/Contraste, Enemigo en Común, Historia, Transformación, FOMO, Simplicidad, Ironía/Provocación, Precio/Valor, Exclusividad, Aspiracional.

Luego responde SOLO el JSON con tus conclusiones reales, sin texto antes ni despues:
{"niveles":[{"numero":1,"nombre":"Inconsciente","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":2,"nombre":"Consciente del problema","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":3,"nombre":"Consciente de la solucion","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":4,"nombre":"Consciente del producto","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":5,"nombre":"Totalmente consciente","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""}],"tipos":[{"tipo":"Emocional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Funcional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Educativo","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Racional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Aspiracional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0}],"nivel_recomendado":0,"tipo_recomendado":"","razon_recomendacion":"","avatares":[{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0}],"avatar_recomendado":0,"angulos_recomendados":[{"angulo":"","score":0,"porque":""}]}

Completa todos los campos vacios con tu analisis real del producto. CRITICO: score DEBE ser un INTEGER (85, 72, 60...) NUNCA texto ni palabras en ingles. ejemplo_hook sin comillas.`
      promptEjecutado = promptAnalisis
      // Si hubo imágenes, el content sigue siendo multimodal (prompt de texto
      // + imágenes) para que el LLM las reciba con visión. Si no, basta el string.
      body[0].content = imagenesUser.length > 0
        ? [{ type: 'text', text: promptAnalisis }, ...imagenesUser]
        : promptAnalisis
      // Log de diagnóstico temporal — verificar que las imágenes llegan al LLM.
      console.log('[GENERATE] modo=analizar | imágenes recibidas:', imagenesUser.length,
        '| provider:', provider,
        '| prompt al LLM (primeros 500 chars):', promptAnalisis.substring(0, 500))
      console.log('[GENERATE-ANALISIS] Mensajes finales que se envían al LLM:', JSON.stringify(body, null, 2).substring(0, 1000))

    } else if (isGenerar) {
      const userMsg = body[0].content
      const tipoMatch = userMsg.match(/TIPO: (\w+)/)
      const tipo = tipoMatch ? tipoMatch[1] : 'Emocional'
      const paisMatch = userMsg.match(/MERCADO: ([^\n]+)/)
      const pais = paisMatch ? paisMatch[1].trim() : 'Colombia'
      const formatoMatch = userMsg.match(/FORMATO: ([^\n]+)/)
      const formato = formatoMatch ? formatoMatch[1].trim() : 'video'
      const durMatch = userMsg.match(/DURACIÓN: ([^\n]+)/)
      const duracion = durMatch ? durMatch[1].trim() : '30 segundos'
      const esImagen = formato === 'imagen'
      const hooksDelTipo = HOOKS_COMPLETOS[tipo] || TODOS_LOS_HOOKS
      const hooksStr = hooksDelTipo.join('\n- ')

      let promptFinal = ''

      if (esImagen) {
        const formatoImgSel = userMsg.match(/FORMATO_IMG: ([^\n]+)/)?.[1]?.trim() || 'Funcional'
        const avatarImg = userMsg.match(/AVATAR: ([^\n]+)/)?.[1]?.trim() || ''
        const anguloImg = userMsg.match(/ANGULO_VENTA: ([^\n]+)/)?.[1]?.trim() || ''
        const defAnguloImg = anguloImg && ANGULOS_VENTA[anguloImg] ? `\n\nÁNGULO DE VENTA OBLIGATORIO: ${anguloImg}\nDEFINICIÓN: ${ANGULOS_VENTA[anguloImg].que_hace}\nESTRUCTURA DEL GUIÓN: ${ANGULOS_VENTA[anguloImg].estructura}\nTONO: ${ANGULOS_VENTA[anguloImg].tono}\nEJEMPLO DE REFERENCIA: "${ANGULOS_VENTA[anguloImg].ejemplo}"\nEsta idea debe aplicar este ángulo en su composición y mensaje visual.` : ''
        const avatarImgLine = avatarImg ? `\n\nAVATAR OBJETIVO: ${avatarImg}\nLa idea debe hablarle específicamente a esta persona — su contexto, su lenguaje visual, su realidad.` : ''

        // Doctrina canónica del tipo de imagen + regla anti-cruce Infográfico/Beneficios
        const docTipoImg = DOCTRINA_TIPOS_IMAGEN[formatoImgSel]
        const bloqueDoctrinaTipoImg = docTipoImg ? `

DOCTRINA OBLIGATORIA DEL TIPO DE IMAGEN: ${formatoImgSel}
- Esencia: ${docTipoImg.esencia}
- Composición visual obligatoria: ${docTipoImg.composicion}
- Reglas anti-cruce (CRÍTICO): ${docTipoImg.evitar}

REGLA ESPECIAL ANTI-CRUCE INFOGRÁFICO/BENEFICIOS (aplica solo si el tipo es uno de estos dos):
- Si el tipo es "Infográfico": la idea DEBE tener componente educativo o comparativo (SIN/CON, mitos, datos, X cosas que hace, X que detecta). PROHIBIDO entregar solo una lista de íconos con ganancias — eso es Beneficios.
- Si el tipo es "Beneficios": la idea DEBE ser solo enumeración positiva con íconos circulares. PROHIBIDO incluir contrastes SIN/CON, comparaciones, mitos o explicaciones didácticas — eso es Infográfico.` : ''

        // FIX #10 — sanitización del userMsg para niveles 1-2 + bloque refuerzo
        const nivelImg = (userMsg.match(/NIVEL:\s*(\d+)/) || [])[1]
        const userMsgFinal = debeSanitizar(nivelImg) ? redactarBloquesNivel12(userMsg) : userMsg
        const refuerzoImg = debeSanitizar(nivelImg) ? BLOQUE_REFUERZO_NIVEL12 : ''

        const reglaNivelImg = (() => {
          const n = parseInt(nivelImg || '3', 10)
          if (n <= 1) return 'REGLA NIVEL 1: NO menciones el producto ni la marca en ningún elemento visual ni en el texto. Activa dolor/curiosidad. CTA persuasivo: invite a descubrir, no a comprar.'
          if (n === 2) return 'REGLA NIVEL 2: NO menciones el producto ni la marca. Valida el dolor, sugiere que hay solución sin decirla. CTA que invite a conocer más.'
          if (n === 3) return 'REGLA NIVEL 3: El producto puede aparecer con su nombre pero de forma natural, como hallazgo. CTA persuasivo y suave: "descúbrelo", "conócelo", "míralo tú mismo".'
          if (n === 4) return 'REGLA NIVEL 4: Producto presente con beneficios claros. CTA con urgencia suave: "pruébalo", "es tu momento", "únete a quienes ya lo usan".'
          return 'REGLA NIVEL 5: Producto y marca visibles. CTA directo pero no agresivo: "pídelo ahora", "ya sabes lo que hace".'
        })()

        // FIX #7 — pre-selección de 3 hooks de HOOKS_JEFE para imagen (uno por idea/eje)
        const plataformaImg = userMsg.match(/PLATAFORMA: ([^\n]+)/)?.[1]?.trim() || ''
        // Anti-repetición: lista de índices ya usados en sesiones previas (frontend la inyecta)
        const excluidosImgRaw = userMsg.match(/HOOKS_YA_USADOS:\s*([^\n]+)/)?.[1]?.trim() || ''
        const excluidosImg = excluidosImgRaw.split(/[, ]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n))
        const seleccionImg = await seleccionarHooksJefe({
          motivo: tipo,
          angulo: anguloImg,
          nivel: nivelImg,
          avatar: avatarImg,
          plataforma: plataformaImg,
          excluidos: excluidosImg
        })
        const hooksImg = seleccionImg.hooks
        hooksIndicesUsados = seleccionImg.indices

        // FIX correctivo — regla de estructura del texto en pieza por tipo (sobreescribe el "siempre 6 bullets")
        const reglaTexto = docTipoImg?.reglaTextoEnPieza || 'Texto corto y claro.'
        const bloqueReglaTexto = `

ESTRUCTURA OBLIGATORIA DEL TEXTO EN PIEZA (CRÍTICO — NO LO ROMPAS):
${reglaTexto}

Si te equivocas en este formato (ej: pones bullets cuando la regla dice NO bullets, o pones más puntos de los pedidos, o pasas el límite de palabras), la idea queda inservible.`

        // Regla del motivo INTERPRETADA para imagen estática (1 frame, no secuencia)
        const reglaImg = REGLA_IMAGEN_POR_MOTIVO[tipo] || ''
        const esNivelBajoImg = parseInt(nivelImg, 10) <= 2
        const notaMotivoNivelBajoImg = esNivelBajoImg ? `

NOTA CRÍTICA SOBRE EL MOTIVO EN ESTE NIVEL:
Como el nivel es ${nivelImg}, la doctrina del motivo "${tipo}" se aplica SOLO al TONO/EMOCIÓN, NO al contenido visual o narrativo. Es decir:
- El TONO del motivo se mantiene (ej: si Funcional → tono confiable y demostrativo, PERO sobre el PROBLEMA, no sobre la solución).
- El CONTENIDO NO debe mostrar producto, beneficio, ni resultado.
- Foco total en el dolor/problema/curiosidad sobre el problema.
- Para imagen: si motivo es Funcional pero nivel ≤ 2, NO muestres el producto en uso. Muestra la situación de dolor/problema del avatar SIN producto a la vista.
- Para video: si motivo es Funcional pero nivel ≤ 2, NO muestres "producto en uso (40-45%)". Toda la narrativa se queda en el problema y la curiosidad.
` : ''
        const bloqueReglaMotivoImg = esNivelBajoImg ? notaMotivoNivelBajoImg : (reglaImg ? `

REGLA VISUAL OBLIGATORIA SEGÚN EL MOTIVO "${tipo}" (CRÍTICO PARA IMAGEN ESTÁTICA):
${reglaImg}

NOTA CRÍTICA: Imagen estática es UN solo frame. La estructura narrativa del motivo NO aplica como secuencia visual. Captura UN momento que comunique el motivo SIN la fase del problema. El producto debe verse VICTORIOSO o el avatar TRANSFORMADO, no en la fase previa.` : '')

        // Regla del HOOK por ángulo (misma para imagen y video)
        const angRuleImg = HOOK_POR_ANGULO[anguloImg] || null
        const bloqueAngHookImg = angRuleImg ? `

REGLA OBLIGATORIA DEL HOOK SEGÚN EL ÁNGULO "${anguloImg}":
${angRuleImg.instruccion}

EJEMPLOS DE HOOKS BUENOS PARA ESTE ÁNGULO:
${angRuleImg.buenos.map(b => '✅ ' + b).join('\n')}

EJEMPLOS DE HOOKS QUE NO SON ESTE ÁNGULO:
${angRuleImg.malos.map(m => '❌ ' + m).join('\n')}

Si tu hook no comunica claramente "${anguloImg}" — REESCRÍBELO antes de cerrar la respuesta.` : ''

        // FIX #8 + #7 — construir 3 prompts (uno por eje) con hook preseleccionado de HOOKS_JEFE
        const buildPromptIdea = (eje, hookPreseleccionado) => `${PROMPT_IMAGEN_BASE(formatoImgSel)}${avatarImgLine}${defAnguloImg}

CONTEXTO DEL PRODUCTO Y NIVEL:
${userMsgFinal}

${reglaNivelImg}

REGLAS FINALES:
- Sin mencionar tiendas ni plataformas de venta
- Pensado para tráfico frío en ${pais}
- Idea ejecutable con producción realista
- El Hook DEBE aparecer exactamente con el label "Hook:" seguido del texto${bloqueDoctrinaTipoImg}

INSTRUCCIÓN DE EJE PARA ESTA IDEA (sobreescribe lo demás en caso de conflicto sobre encuadre/foco):
Esta llamada produce UNA SOLA idea (no 3). Es la idea con eje "${eje.nombre}" (${eje.id}/3 de un set paralelo).
${eje.instruccion}
${RELLENO_BLOCK(hookPreseleccionado)}
${bloqueReglaTexto}${bloqueReglaMotivoImg}${refuerzoImg}
${BLOQUE_CRITERIOS_DETERMINISTICOS}
${bloqueReglasEstructuralesAngulo(anguloImg)}
${bloqueReglasCTANivel(nivelImg)}
${BLOQUE_AUTOVERIFICACION}

OUTPUT EXPECTED (DEVUELVE EXACTAMENTE ESTAS 3 SECCIONES — IGNORA cualquier formato anterior del bloque PROMPT_IMAGEN_BASE inicial, este es el formato definitivo):

IDEA DE IMAGEN 1
HOOK: <una sola frase completa, en una sola línea, sin viñetas, sin terminar en preposición>
DESCRIPCIÓN DE LA IMAGEN: <Descripción OPERATIVA, no narrativa. Máximo 50 palabras totales. Estructurada en estos 4 elementos cortos separados por punto y aparte (no bullets):
- COMPOSICIÓN: qué se ve (objetos, sujeto, posición). Máx 12 palabras.
- PLANO: tipo de plano y ángulo. Máx 8 palabras.
- LUZ Y AMBIENTE: tipo de luz, color dominante, lugar. Máx 12 palabras.
- ELEMENTO CLAVE: qué detiene el scroll. Máx 12 palabras.
NO escribas párrafo literario. NO describas emociones del personaje en detalle. SÍ ser específico y visual. Total: ~50 palabras máximo.>
BULLETS: <respeta EXACTAMENTE la reglaTextoEnPieza del tipo "${formatoImgSel}". Si la regla dice "NO viñetas", devuelve texto corrido sin bullets bajo este header. Si dice "EXACTAMENTE 3 o 4 puntos", devuelve esa cantidad exacta. Si dice "máximo X palabras", NO te pases. NO siempre es una lista — adapta el contenido al tipo>

NOTA: El header se llama "BULLETS:" por compatibilidad con el parser, PERO el contenido se adapta al tipo de imagen — no siempre es una lista con viñetas.

REGLAS DE FORMATO DE RESPUESTA:
- UNA sola idea (no 3). NO incluyas separadores --- entre ideas.
- Empieza directamente con la línea "IDEA DE IMAGEN 1".
- Los 3 labels HOOK:, DESCRIPCIÓN DE LA IMAGEN:, BULLETS: deben aparecer exactamente así (case-insensitive aceptado por el parser, pero respeta los dos puntos).

ÚLTIMO RECORDATORIO ANTES DE GENERAR — REGLAS CRÍTICAS DEL HOOK:

REGLA CRÍTICA DE LONGITUD DEL HOOK (SOLO IMAGEN):
- Filosofía: MENOS PALABRAS = MEJOR. Lo más corto que comunique el mensaje.
- LÍMITE SUPERIOR: 7 palabras. Nunca superar.
- IDEAL: 3-5 palabras. Si puedes decirlo en 3, mejor que en 5. Si en 5, mejor que en 6.
- Si la plantilla del hook elegida de la lista del jefe es larga, REDUCE A LO ESENCIAL conservando el sentido — pero NUNCA cortes en preposición/conjunción/artículo.
- Prefieres una frase completa de 8 palabras antes que cortada en 7.

EJEMPLOS DE EXCELENTES (3-5 palabras):
✅ "Dolor de espalda" (3 palabras)
✅ "Acabados de chef en casa" (5 palabras)
✅ "Espalda sin dolor" (3 palabras)
✅ "Cocina como restaurante" (3 palabras)

EJEMPLOS DE ACEPTABLES (6-7 palabras):
✅ "Espalda sin dolor en 7 días" (6 palabras)
✅ "El soplete que cambió mi cocina" (6 palabras)

EJEMPLOS DE INACEPTABLES POR LONGITUD:
❌ "Vas a necesitar esto para tu cintura adolorida después" (9 palabras, excede)
❌ "Lo que descubrí cuando entendí cómo funcionaba esto y" (cortado además de largo)
❌ "El soplete que cambió mi cocina para siempre y mi" (cortado además de largo)

CHEQUEO DE LONGITUD ANTES DE ENVIAR:
1. ¿Cuántas palabras tiene tu hook? Cuenta. Si >7 → reescribe más corto.
2. ¿Podrías decir lo mismo con MENOS palabras? Si sí → hazlo.
3. ¿Termina en palabra fuerte (sustantivo/verbo/signo)? Si no → reformula.

EJEMPLOS DE HOOKS MAL CONSTRUIDOS (NO HAGAS ESTO):
❌ "Vas a necesitar esto para tus platos después de" → termina en preposición "de"
❌ "Flamix es el único que uso para caramelizar y" → termina en conjunción "y"
❌ "No puedo creer que este ajuste sea solo" → termina en adverbio sin completar idea
❌ "Compré esto para mi papá y ahora la correa" → termina en sustantivo huérfano sin contexto

EJEMPLOS DE HOOKS BIEN CONSTRUIDOS:
✅ "Vas a necesitar esto para platos profesionales"
✅ "El soplete que cambió mi cocina para siempre"
✅ "Dorado de chef sin salir de casa"
✅ "Esto resolvió mi problema de espalda en 7 días"

CHEQUEO OBLIGATORIO ANTES DE ENVIAR:
1. Mira la última palabra de tu HOOK.
2. Si es: y, o, de, la, el, un, una, para, con, por, en, mi, tu, su, este, ese, es, son, sea, solo, más, menos, que, si, no, le, les, lo → REESCRÍBELO. Está incompleto.
3. El HOOK debe poder leerse en voz alta sin sentirse cortado.${bloqueAngHookImg}`

        imagePrompts3 = EJES_IMAGEN.map((eje, i) => buildPromptIdea(eje, hooksImg[i]))
        promptFinal = imagePrompts3[0]

      } else {
        promptFinal = `${PROMPTS_POR_TIPO[tipo] || PROMPTS_POR_TIPO['Emocional']}

CONTEXTO:
${userMsg}

PALABRAS: ${duracion==='10'?30:duracion==='20'?60:duracion==='30'?90:duracion==='40'?120:duracion==='50'?150:180} palabras por versión (equivale a ${duracion} segundos). Las 2 versiones deben tener el mismo conteo.

HOOKS DISPONIBLES — tipo ${tipo.toUpperCase()} (elige los 2 mejores y adáptalos al producto):
- ${hooksStr}

FORMATO — genera exactamente 2 versiones:

═══════════════════════════════
VERSIÓN 1 — Hook: [primer hook adaptado]
═══════════════════════════════
[texto narrado completo, listo para voz, sin etiquetas]
---

═══════════════════════════════
VERSIÓN 2 — Hook: [segundo hook adaptado]
═══════════════════════════════
[texto narrado completo, listo para voz, sin etiquetas]
---

REGLAS:
- Solo texto narrado — sin escenas, sin indicaciones de producción, sin etiquetas
- Tono UGC, orgánico, que no suene a publicidad
- Genera dopamina: ritmo, curiosidad, ganchos que retengan
- CTA natural al final, sin mencionar tiendas ni plataformas
- Lenguaje natural de ${pais}
- Las 2 versiones completamente diferentes entre sí
- Empieza DIRECTAMENTE con la línea ═══ de VERSIÓN 1, sin texto introductorio`
      }

      promptEjecutado = promptFinal
      body[0].content = promptFinal

    } else if (isVariaciones) {
      // Tomar el guión base y generar 2 variaciones con mismo conteo de palabras
      const userMsg = body[0].content
      const durMatch = userMsg.match(/DURACI[OÓ]N: ([^\n]+)/)
      const duracion = durMatch ? durMatch[1].replace(' segundos','').trim() : '30'
      const palabras = duracion==='10'?30:duracion==='20'?60:duracion==='30'?90:duracion==='40'?120:duracion==='50'?150:180
      const tipoVar = userMsg.match(/TIPO: (\w+)/)?.[1] || 'Funcional'
      const hooksDelTipoVar = HOOKS_COMPLETOS[tipoVar] || TODOS_LOS_HOOKS
      const hooksStrVar = hooksDelTipoVar.join('\n- ')

      const nivelNumVar = parseInt(userMsg.match(/NIVEL:\s*(\d+)/)?.[1] || '3')
      const anguloVar = userMsg.match(/ANGULO_VENTA: ([^\n]+)/)?.[1]?.trim() || ''
      const defAnguloVar = anguloVar && ANGULOS_VENTA[anguloVar] ? `\nÁNGULO DE VENTA OBLIGATORIO: ${anguloVar}\nDEFINICIÓN: ${ANGULOS_VENTA[anguloVar].que_hace}\nESTRUCTURA DEL GUIÓN: ${ANGULOS_VENTA[anguloVar].estructura}\nTONO: ${ANGULOS_VENTA[anguloVar].tono}\nEJEMPLO DE REFERENCIA: "${ANGULOS_VENTA[anguloVar].ejemplo}"` : ''
      const reglaNivelVar = nivelNumVar <= 2
        ? `REGLA CRÍTICA: Nivel de consciencia ${nivelNumVar}. NO menciones el producto, la marca ni ninguna solución específica. ${nivelNumVar===1?'Activa el dolor como revelación.':'Valida el dolor y promete que hay respuesta sin decirla.'} CTA: lleva a descubrir más, no a comprar.`
        : nivelNumVar === 3 ? `REGLA: Nivel 3. Presenta el producto como hallazgo natural, no como venta.`
        : nivelNumVar === 4 ? `REGLA: Nivel 4. Menciona el producto con beneficios y diferenciadores. CTA natural con urgencia suave.`
        : `REGLA: Nivel 5. CTA directo y con convicción. Puedes usar urgencia o escasez si aplica.`

      // FIX #10 — sanitización del userMsg + bloque refuerzo en niveles 1-2
      const userMsgFinalVar = debeSanitizar(nivelNumVar) ? redactarBloquesNivel12(userMsg) : userMsg
      const refuerzoVar = debeSanitizar(nivelNumVar) ? BLOQUE_REFUERZO_NIVEL12 : ''

      const promptVariaciones = `Eres experto en copywriting de respuesta directa. Te doy un guión aprobado. Genera 2 VARIACIONES — mismo hook, mismo mensaje, reescrito con otras palabras y diferente estilo narrativo.

GUIÓN ORIGINAL A VARIAR:
${userMsgFinalVar}

${reglaNivelVar}${defAnguloVar}${refuerzoVar}

INSTRUCCIONES:
- Usa EXACTAMENTE el mismo hook en las 2 variaciones
- Cada variación con estilo narrativo diferente:
  VARIACIÓN 1: Desde experiencia personal ("yo...", "mi problema era...", "desde que...")
  VARIACIÓN 2: Desde demostración y evidencia ("esto funciona porque...", "lo que hace es...", "el resultado...")
- Las 2 deben sonar completamente diferentes entre sí y al original
- MISMO mensaje central, mismo hook
- EXACTAMENTE ${palabras} palabras por variación
- Solo texto narrado — sin etiquetas ni indicaciones

INSTRUCCIÓN CRÍTICA DE DIFERENCIACIÓN DE CIERRES:
Las 2 variaciones DEBEN terminar con palabras y CTA completamente distintos entre sí.
- NO uses las mismas palabras finales en las 2
- NO repitas la frase de CTA literal entre variaciones
- Las últimas 5-7 palabras de cada variación deben ser únicas
- Cada variación construye su propio CTA con sus propias palabras
${RELLENO_BLOCK_PRESERVAR}

FORMATO:

═══════════════════════════════
VERSIÓN 1 — Hook: [mismo hook del original]
═══════════════════════════════
[texto narrado completo, reescrito con otras palabras]
---

═══════════════════════════════
VERSIÓN 2 — Hook: [mismo hook del original]
═══════════════════════════════
[texto narrado completo, reescrito con otras palabras]
---

Empieza DIRECTAMENTE con ═══ de VERSIÓN 1, sin texto introductorio`

      promptEjecutado = promptVariaciones
      body[0].content = promptVariaciones

    } else if (modo === 'auditar') {
      const userMsg = body[0].content
      // ── Formato declarado: campo explícito del body (preferente) →
      //    regex "FORMATO: ..." del contenido (fallback) → 'video' por default. ──
      const formatoBody = String(formato || '').toLowerCase()
      const formatoMatch = String(userMsg || '').match(/FORMATO:\s*([a-záéíóú]+)/i)
      const formatoRegex = formatoMatch ? formatoMatch[1].toLowerCase() : ''
      const formatoDetectado = (formatoBody === 'imagen' || formatoRegex === 'imagen') ? 'imagen' : 'video'

      // WORKAROUND TEMPORAL: forzar evaluación como video
      // TODO: bug del switch backend no toma rama correcta. Resolver después de entrega.
      const formatoAuditoria = 'video'
      console.log('[AUDIT BACKEND] formatoAuditoria FORZADO a video | detectado era:', formatoDetectado, '| req.body.formato:', formato)

      // ── Switch por formato reescrito como if/else explícito.
      //    Los ternarios dentro de template literals a veces los ignora el LLM;
      //    construir aquí cada bloque garantiza que SOLO uno llega al prompt. ──
      let bloqueCriteriosFormato
      let plantillaRespuesta
      let notaPuntaje
      let reglaCierreFormato

      if (formatoAuditoria === 'video') {
        bloqueCriteriosFormato = `═══════════════════════════════════════════════
CRITERIOS PARA VIDEO (ESTRICTOS — JAMÁS MEZCLAR CON IMAGEN)
═══════════════════════════════════════════════
El contenido es un GUION DE VIDEO — narrativa hablada para feed/reels.

PROHIBICIONES ABSOLUTAS:
- NUNCA evalúes bullets, headline visual, foto del producto o composición visual.
- NUNCA escribas "TIPO DE IMAGEN", "composición visual", "headline" ni "bullets" en tu respuesta.
- NUNCA penalices por ser un párrafo narrativo — es EXACTAMENTE lo correcto para video.

EVALÚA 4 DIMENSIONES (25 puntos cada una):
1. NIVEL DE CONSCIENCIA: el guion respeta las reglas del nivel declarado.
2. MOTIVO: el tono, las palabras y la estructura reflejan el motivo declarado.
3. ÁNGULO: la APERTURA del guion respeta la estructura del ángulo (ej: Beneficio/Resultado abre con resultado, NO con problema).
4. NARRATIVA AUDIOVISUAL: hook scroll-stopping en la primera frase, producto temprano (≤ palabra 15 si el nivel ≥ 3), CTA coherente con el nivel, tono consistente, duración estimada coherente (palabras ÷ 3 = segundos).

PUNTAJE MÁXIMO: 100 (4 dimensiones × 25).`

        plantillaRespuesta = `📊 AUDITORÍA DE LINEAMIENTOS

NIVEL [N - nombre]:
✅ [criterio que cumple]: explicación de 1 línea con cita
⚠️ [criterio parcial]: explicación de 1 línea con cita
❌ [criterio que no cumple]: explicación de 1 línea con cita

MOTIVO [nombre]:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

ÁNGULO [nombre]:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

NARRATIVA AUDIOVISUAL:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

PUNTAJE GLOBAL: X/100

RECOMENDACIONES (top 3 cambios concretos para subir el puntaje):
1. [acción específica]
2. [acción específica]
3. [acción específica]`

        notaPuntaje = '4 dimensiones × 25 puntos: Nivel, Motivo, Ángulo, Narrativa audiovisual.'
        reglaCierreFormato = '- ESTO ES UN VIDEO: NUNCA escribas la sección "TIPO DE IMAGEN", NUNCA menciones bullets, headline ni composición visual.'
      } else {
        // formato === 'imagen'
        bloqueCriteriosFormato = `═══════════════════════════════════════════════
CRITERIOS PARA IMAGEN
═══════════════════════════════════════════════
El contenido es una PIEZA VISUAL.

EVALÚA 5 DIMENSIONES (20 puntos cada una):
1. NIVEL DE CONSCIENCIA: la pieza respeta las reglas del nivel declarado.
2. MOTIVO: el enfoque visual refleja el motivo declarado.
3. ÁNGULO: el headline / la composición respeta la estructura del ángulo.
4. ESTRUCTURA VISUAL: headline corto + foto del producto en uso.
5. BULLETS: 3-4 bullets ultra-cortos (máximo 6 palabras cada uno).

REGLAS PARA IMAGEN:
- SÍ exige bullets. La imagen es visual.
- SÍ exige headline corto.
- Penaliza párrafos narrativos largos como contenido principal.

PUNTAJE MÁXIMO: 100 (5 dimensiones × 20).`

        plantillaRespuesta = `📊 AUDITORÍA DE LINEAMIENTOS

NIVEL [N - nombre]:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

MOTIVO [nombre]:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

ÁNGULO [nombre]:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

ESTRUCTURA VISUAL:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

BULLETS:
✅ [criterio]: explicación
⚠️ [criterio]: explicación
❌ [criterio]: explicación

PUNTAJE GLOBAL: X/100

RECOMENDACIONES (top 3 cambios concretos para subir el puntaje):
1. [acción específica]
2. [acción específica]
3. [acción específica]`

        notaPuntaje = '5 dimensiones × 20 puntos: Nivel, Motivo, Ángulo, Estructura visual, Bullets.'
        reglaCierreFormato = '- ESTO ES UNA IMAGEN: evalúa headline corto, bullets ultra-cortos y composición visual.'
      }

      const promptAuditoria = `Eres un auditor experto de marketing de respuesta directa. Evalúa el contenido aplicando criterios diferenciados SEGÚN EL FORMATO. NUNCA mezcles criterios de video con criterios de imagen.

FORMATO DECLARADO: ${formatoAuditoria}

${bloqueCriteriosFormato}

REGLAS ABSOLUTAS DE AUDITORÍA:
- Solo evalúa contra los lineamientos explícitamente provistos en el bloque "═══ LINEAMIENTOS DEL CLIENTE A VERIFICAR ═══" del input.
- Si una decisión es prohibida en un lineamiento (ej: "Nivel 1: NO menciones el producto"), una violación es ❌ — no negocies.
- Si una decisión es obligatoria (ej: "ESTRUCTURA: 1) Nombrar el dolor 2)..."), evalúa paso por paso.
- Sé crítico y específico. Cita LÍNEAS o FRAGMENTOS exactos del contenido como evidencia.
- Si el guión cumple en parte: ⚠️ + qué falta. Si cumple bien: ✅ + cita evidencia. Si no cumple: ❌ + cita la desviación.

INPUT (decisiones + lineamientos + contenido a auditar):
${userMsg}

SIGUE ESTA PLANTILLA EXACTA EN TU RESPUESTA (no agregues ni quites secciones):

${plantillaRespuesta}

REGLAS DE PUNTAJE: ${notaPuntaje} Rúbrica: 90-100 = todo cumplido; 70-89 = mayoría con parciales; 50-69 = mitad sin cumplir; <50 = mayoría sin cumplir. Sé estricto, no inflate.

REGLAS DE FORMATO DE RESPUESTA:
- Empieza directamente con "📊 AUDITORÍA DE LINEAMIENTOS", sin preámbulo.
- Cada criterio empieza con ✅ ⚠️ o ❌ (con espacio después del emoji).
- "PUNTAJE GLOBAL: X/100" debe aparecer literalmente con esa cadena (el frontend la parsea).
- "RECOMENDACIONES" igual literal.
${reglaCierreFormato}`

      promptEjecutado = promptAuditoria
      body[0].content = promptAuditoria

    } else {
      // Corrección — mantener mensajes como vienen
    }

    let responseText = ''
    const isImagenFormato = body[0]?.content?.includes('FORMATO: imagen')
    const isVideoGenerar = (isGenerar || isVariaciones) && !isImagenFormato

    // ── Función de llamada única al modelo ──────────────────────────
    // Las imágenes llegan del frontend en formato OpenAI ({type:'image_url'}).
    // La API nativa de Claude usa otro esquema ({type:'image', source:{...}}),
    // así que convertimos cualquier content multimodal antes de enviarlo.
    function adaptarMensajesParaClaude(messages) {
      return messages.map(m => {
        if (!Array.isArray(m.content)) return m
        return {
          ...m,
          content: m.content.map(part => {
            if (part && part.type === 'image_url') {
              const url = (part.image_url && part.image_url.url) || ''
              const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/)
              if (dataMatch) {
                return { type: 'image', source: { type: 'base64', media_type: dataMatch[1], data: dataMatch[2] } }
              }
              return { type: 'image', source: { type: 'url', url } }
            }
            return part
          })
        }
      })
    }

    async function llamarModelo(messages, maxTok) {
      if (provider === 'claude') {
        if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY no configurada')
        const messagesClaude = adaptarMensajesParaClaude(messages)
        if (isAnalisis) console.log('[GENERATE-ANALISIS-CLAUDE] Mensajes adaptados para Claude:', JSON.stringify(messagesClaude, null, 2).substring(0, 1000))
        let textC = ''
        let inputTokens = 0, outputTokens = 0
        let intentosC = 0
        while (intentosC < 3) {
          const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: modeloClaude, max_tokens: maxTok, messages: messagesClaude })
          })
          const d = await r.json()
          if (d.error) throw new Error(d.error.message || JSON.stringify(d.error))
          textC = d.content?.[0]?.text || ''
          inputTokens += d.usage?.input_tokens || 0
          outputTokens += d.usage?.output_tokens || 0
          if (!textC.includes("Lo siento") && !textC.includes("I'm sorry") && !textC.includes("can't assist")) break
          intentosC++
        }
        return { texto: textC, inputTokens, outputTokens }
      } else {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY no configurada')
        let text = ''
        let inputTokens = 0, outputTokens = 0
        let intentos = 0
        while (intentos < 3) {
          const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
            body: JSON.stringify({ model: modeloGPT, max_tokens: maxTok, messages })
          })
          const d = await r.json()
          if (d.error) throw new Error(d.error.message)
          text = d.choices?.[0]?.message?.content || ''
          inputTokens += d.usage?.prompt_tokens || 0
          outputTokens += d.usage?.completion_tokens || 0
          if (!text.includes("I'm sorry") && !text.includes("can't assist")) break
          intentos++
        }
        return { texto: text, inputTokens, outputTokens }
      }
    }

    // ── FIX #7 — Selector de 3 hooks de HOOKS_JEFE (585 plantillas) ──
    // Hace una pre-llamada barata a OpenAI gpt-4.1-mini independiente del provider del request.
    // Si OPENAI_API_KEY no está, fallback al provider del usuario via llamarModelo.
    // Si todo falla, devuelve 3 hooks distribuidos por la lista como fallback determinista.
    async function seleccionarHooksJefe({ motivo, angulo, nivel, avatar, plataforma, excluidos }) {
      const excluidosSet = new Set((Array.isArray(excluidos) ? excluidos : []).map(n => parseInt(n, 10)).filter(n => !isNaN(n)))
      const excluidosLista = Array.from(excluidosSet).sort((a,b) => a-b)
      const bloqueExcluidos = excluidosLista.length > 0
        ? `\n\nIMPORTANTE: NO elijas estos índices que ya se usaron antes en la sesión: [${excluidosLista.join(', ')}]. Elige 3 nuevos diferentes a esos.`
        : ''

      const lista = HOOKS_JEFE.map((h, i) => `${i}: ${h}`).join('\n')
      const promptSel = `Tienes una lista de 585 plantillas de hooks. Cada plantilla puede tener:
- ___ : espacio para rellenar con 1-3 palabras coherentes con el contexto.
- # : espacio para un número específico (preferentemente 3-7).

CONTEXTO:
- Motivo: ${motivo || '(no especificado)'}
- Ángulo: ${angulo || '(no especificado)'}
- Nivel de consciencia: ${nivel || '(no especificado)'}
- Avatar: ${avatar || '(no especificado)'}
- Plataforma: ${plataforma || '(no especificado)'}

LISTA DE HOOKS (índice: hook):
${lista}

Tu tarea: elige los 3 índices de hooks MÁS compatibles con el contexto (motivo + ángulo + nivel + avatar). Elige hooks DIVERSOS entre sí en estructura (no 3 que empiecen igual).${bloqueExcluidos}

Devuelve SOLO un JSON: {"indices": [n1, n2, n3]}`

      let raw = ''
      // Llamada directa a OpenAI gpt-4.1-mini con temperature alta para diversidad entre regeneraciones
      try {
        if (process.env.OPENAI_API_KEY) {
          const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
            body: JSON.stringify({ model: 'gpt-4.1-mini', max_tokens: 80, temperature: 0.9, messages: [{ role: 'user', content: promptSel }] })
          })
          const d = await r.json()
          if (!d.error) {
            raw = d.choices?.[0]?.message?.content || ''
            registrarLlamada('Fix #7 hooks-jefe (pre-llamada)', 'gpt-4.1-mini', d.usage?.prompt_tokens || 0, d.usage?.completion_tokens || 0)
          }
        }
      } catch (e) { /* fallback abajo */ }

      // Fallback al provider del usuario si OpenAI no respondió
      if (!raw) {
        try {
          const rFb = await llamarModelo([{ role: 'user', content: promptSel }], 120)
          raw = rFb.texto
          registrarLlamada('Fix #7 hooks-jefe (fallback)', modeloUsado, rFb.inputTokens, rFb.outputTokens)
        } catch (e) { /* nada, usa fallback indices */ }
      }

      // Parsear JSON {"indices":[...]}
      try {
        const clean = String(raw || '').replace(/```json|```/g, '').trim()
        const start = clean.indexOf('{'), end = clean.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
          const obj = JSON.parse(clean.slice(start, end + 1))
          let idx = (obj.indices || [])
            .map(n => parseInt(n, 10))
            .filter(n => !isNaN(n) && n >= 0 && n < HOOKS_JEFE.length && !excluidosSet.has(n))
          if (idx.length >= 3) return { hooks: idx.slice(0, 3).map(i => HOOKS_JEFE[i]), indices: idx.slice(0, 3) }
          // Si el LLM ignoró la exclusión, completa con índices distintos no excluidos
          while (idx.length < 3) {
            const candidato = Math.floor(Math.random() * HOOKS_JEFE.length)
            if (!excluidosSet.has(candidato) && !idx.includes(candidato)) idx.push(candidato)
          }
          return { hooks: idx.slice(0, 3).map(i => HOOKS_JEFE[i]), indices: idx.slice(0, 3) }
        }
      } catch (e) { /* fallback abajo */ }

      // Fallback determinista: 3 hooks distribuidos por la lista (saltando excluidos si caen ahí)
      const candidatos = [
        Math.floor(HOOKS_JEFE.length * 0.15),
        Math.floor(HOOKS_JEFE.length * 0.5),
        Math.floor(HOOKS_JEFE.length * 0.85)
      ]
      const fb = candidatos.map(i => {
        let n = i
        let intento = 0
        while (excluidosSet.has(n) && intento < HOOKS_JEFE.length) {
          n = (n + 1) % HOOKS_JEFE.length
          intento++
        }
        excluidosSet.add(n)
        return n
      })
      return { hooks: fb.map(i => HOOKS_JEFE[i]), indices: fb }
    }

    // ── Ajustar guión neto a exactamente N palabras (post-process) ──
    function ajustarPalabras(texto, objetivo) {
      const palabras = texto.trim().split(/\s+/).filter(w => w.length > 0)
      if (palabras.length === objetivo) return texto

      if (palabras.length > objetivo) {
        // Recortar desde el final, preservando puntuación de cierre
        const recortado = palabras.slice(0, objetivo)
        const ultimo = recortado[recortado.length - 1]
        if (!ultimo.match(/[.!?]$/)) recortado[recortado.length - 1] = ultimo + '.'
        return recortado.join(' ')
      }

      // Expandir — agregar palabras de relleno naturales al final
      const conectores = ['Además,', 'Sin duda,', 'De verdad,', 'En serio,', 'Créeme,', 'Y lo mejor,', 'Por eso,', 'Así que']
      const rellenos = ['es increíble.', 'funciona perfecto.', 'vale la pena.', 'marca la diferencia.', 'te lo recomiendo.', 'no falla.', 'es lo que necesitas.', 'te cambia el día.']
      const faltantes = objetivo - palabras.length
      const extras = []
      let ci = 0
      while (extras.length < faltantes) {
        const c = conectores[ci % conectores.length].split(' ')
        const r = rellenos[ci % rellenos.length].split(' ')
        extras.push(...c, ...r)
        ci++
      }
      // Insertar antes del CTA final (últimas 5 palabras)
      const cuerpo = palabras.slice(0, -5)
      const cta = palabras.slice(-5)
      return [...cuerpo, ...extras.slice(0, faltantes), ...cta].join(' ')
    }

    // Aplicar ajuste a todos los guiones neto de un texto de versiones
    function ajustarNetosEnTexto(texto, objetivo) {
      return texto.replace(
        /(---\s*GU[IÍ]ÓN NETO\s*\d*[:\s]*)([\s\S]*?)(---)/gi,
        (match, inicio, neto, fin) => {
          const ajustado = ajustarPalabras(neto.trim(), objetivo)
          return inicio + '\n' + ajustado + '\n' + fin
        }
      )
    }

    // ── Extrae las últimas N palabras del cuerpo narrado de una versión ya generada ──
    // Limpia separadores ═══, encabezados "VERSIÓN X — Hook:", delimitadores ---, asteriscos
    // markdown y colapsa whitespace antes de tomar el slice final.
    function ultimasNPalabras(texto, n) {
      const limpio = String(texto || '')
        .replace(/═{3,}[^\n]*/g, ' ')
        .replace(/VERSI[OÓ]N\s*\d+\s*[—\-–]\s*Hook:\s*[^\n]+/gi, ' ')
        .replace(/^\s*---+\s*$/gm, ' ')
        .replace(/\*+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      const palabras = limpio.split(/\s+/).filter(w => w.length > 0)
      return palabras.slice(-n).join(' ')
    }

    // ── Extrae solo el cuerpo narrado de una versión (sin separadores ═══,
    // sin encabezado "VERSIÓN X — Hook:", sin delimitadores --- ni markdown) ──
    function extraerGuionNarrado(texto) {
      return String(texto || '')
        .replace(/═{3,}[^\n]*/g, ' ')
        .replace(/VERSI[OÓ]N\s*\d+\s*[—\-–]\s*Hook:\s*[^\n]+/gi, ' ')
        .replace(/^\s*---+\s*$/gm, ' ')
        .replace(/\*+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    // ── Cuenta en qué palabra del guion aparece el producto (nombre o
    // referencia genérica "este/esta..."). Devuelve Infinity si no aparece. ──
    function contarPalabrasHastaProducto(texto, producto) {
      if (!texto || !producto) return Infinity
      const palabras = texto.toLowerCase().split(/\s+/).filter(Boolean)
      // Primera palabra significativa del nombre del producto (ignora artículos/preposiciones)
      const stop = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del']
      const tokensProd = producto.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-záéíóúñ0-9]/gi, ''))
      const referenciaProducto = (tokensProd.find(w => w.length >= 3 && !stop.includes(w)) || tokensProd[0] || '').trim()
      const referenciasGenericas = ['este', 'esta', 'estos', 'estas']

      for (let i = 0; i < palabras.length; i++) {
        const limpia = palabras[i].replace(/[^a-záéíóúñ0-9]/gi, '')
        // Coincidencia con el nombre del producto
        if (referenciaProducto && limpia.includes(referenciaProducto)) return i + 1
        // Referencia genérica "este/esta..." seguida de un sustantivo
        if (referenciasGenericas.includes(limpia) && i < palabras.length - 1) return i + 1
      }
      return Infinity
    }

    if (isVideoGenerar) {
      // ── 2 llamadas paralelas, una por versión, con max_tokens ajustado ──
      const durMatch3 = body[0].content.match(/DURACI[ÓO]N: (\d+)/)
      const dur3 = durMatch3 ? durMatch3[1] : '30'
      const maxTokVersion = dur3==='10'?800:dur3==='20'?900:dur3==='30'?1000:dur3==='40'?1200:dur3==='50'?1500:2200

      // Construir prompt para UNA versión por llamada
      const ctxOriginal = body[0].content
      const tipoV = ctxOriginal.match(/TIPO: (\w+)/)?.[1] || tipo
      const avatarV = ctxOriginal.match(/AVATAR: ([^\n]+)/)?.[1]?.trim() || ''
      const anguloV = ctxOriginal.match(/ANGULO_VENTA: ([^\n]+)/)?.[1]?.trim() || ''
      const paisV = ctxOriginal.match(/MERCADO: ([^\n]+)/)?.[1]?.trim() || pais
      const npalabras = dur3==='10'?30:dur3==='20'?60:dur3==='30'?90:dur3==='40'?120:dur3==='50'?150:180
      const hooksV = (HOOKS_COMPLETOS[tipoV] || TODOS_LOS_HOOKS).join('\n- ')
      const basePrompt = PROMPTS_POR_TIPO[tipoV] || PROMPTS_POR_TIPO['Emocional']

      // FIX #10 — sanitización del ctxOriginal en niveles 1-2 (afecta también al substring inyectado abajo)
      const nivelGen = (ctxOriginal.match(/NIVEL:\s*(\d+)/) || [])[1]
      const ctxOriginalFinal = debeSanitizar(nivelGen) ? redactarBloquesNivel12(ctxOriginal) : ctxOriginal
      const refuerzoGen = debeSanitizar(nivelGen) ? BLOQUE_REFUERZO_NIVEL12 : ''

      // FIX #7 — Selección de 2 hooks de HOOKS_JEFE (585 plantillas curadas por el jefe)
      // Pre-llamada barata a gpt-4.1-mini con todo el contexto (motivo, ángulo, nivel, avatar, plataforma)
      const plataformaV = ctxOriginal.match(/PLATAFORMA: ([^\n]+)/)?.[1]?.trim() || ''
      // Nombre del producto — lo usa el validador post-generación (producto en primeras 15 palabras)
      const productoV = (ctxOriginal.match(/PRODUCTO:\s*([^\n]+)/) || [])[1]?.trim() || ''
      const excluidosVRaw = ctxOriginal.match(/HOOKS_YA_USADOS:\s*([^\n]+)/)?.[1]?.trim() || ''
      const excluidosV = excluidosVRaw.split(/[, ]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n))
      const seleccionV = await seleccionarHooksJefe({
        motivo: tipoV,
        angulo: anguloV,
        nivel: nivelGen,
        avatar: avatarV,
        plataforma: plataformaV,
        excluidos: excluidosV
      })
      const hooksElegidos = seleccionV.hooks
      hooksIndicesUsados = seleccionV.indices
      // FIX #7 — bloque legacy de selección eliminado; se conserva data/hooks-data.js en disco intacto
      // (ver fin de bloque más abajo)
      /* LEGACY_REMOVED_START
        const cleanH = rH.replace(/```json|```/g,'').replace(/[\u0000-\u001F]/g,' ').trim()
        const jStart = cleanH.indexOf('{'), jEnd = cleanH.lastIndexOf('}')
        if (jStart!==-1 && jEnd!==-1) {
          const pH = JSON.parse(cleanH.slice(jStart, jEnd+1))
          let i1 = parseInt(pH.i1), i2 = parseInt(pH.i2), i3 = parseInt(pH.i3)
          if (!isNaN(i1) && !isNaN(i2) && !isNaN(i3)) {
            // Forzar que sean diferentes entre sí con separación mínima de 3
            if (Math.abs(i1-i2)<3) i2 = Math.min(i1+5, listaNum.length-1)
            if (Math.abs(i2-i3)<3) i3 = Math.min(i2+5, listaNum.length-1)
            if (Math.abs(i1-i3)<3) i3 = Math.min(i1+10, listaNum.length-1)
            hooksElegidos = [
              listaNum[Math.min(i1, listaNum.length-1)],
              listaNum[Math.min(i2, listaNum.length-1)],
              listaNum[Math.min(i3, listaNum.length-1)]
            ]
            // Verificar que no sean iguales como texto
            if (hooksElegidos[0]===hooksElegidos[1]) hooksElegidos[1] = listaNum[Math.floor(listaNum.length*0.5)]
            if (hooksElegidos[1]===hooksElegidos[2]) hooksElegidos[2] = listaNum[Math.floor(listaNum.length*0.8)]
            if (hooksElegidos[0]===hooksElegidos[2]) hooksElegidos[2] = listaNum[listaNum.length-1]
          }
        }
      LEGACY_REMOVED_END */

      const estilosNarrativos = [
        `Narra desde la EXPERIENCIA PERSONAL del usuario — usa "yo", habla de tu vida diaria, el problema que vivías, cómo lo descubriste. Tono confesional, íntimo.`,
        `Narra desde la EVIDENCIA Y DEMOSTRACIÓN — describe qué hace el producto, cómo funciona, qué resultado produce. Tono demostrativo, directo, concreto.`
      ]

      const nivelNumGen = parseInt(ctxOriginal.match(/NIVEL:\s*(\d+)/)?.[1] || '3')
      let reglaNivel = ''
      if (nivelNumGen <= 1) reglaNivel = `REGLA SAGRADA NIVEL 1 — INCONSCIENTE
AUDIENCIA: No sabe que tiene un problema.
ESTRATEGIA: Crear conciencia mediante contenido educativo o disruptivo, mostrando la problemática.
PROHIBIDO ABSOLUTAMENTE:
- Mencionar el nombre del producto
- Mencionar la marca
- Nombrar una solución específica
- Decir existe una solución o hay un producto
- Mencionar ingredientes o mecanismos
CÓMO ABRIR: Dato disruptivo, pregunta provocadora, o problemática que el avatar vive sin nombrarla
CÓMO DESARROLLAR: Educar sobre el problema desde el ángulo elegido. Si el motivo es Educativo, enseña algo. Si es Funcional, muestra el problema visible.
CTA OBLIGATORIO: Invitación a saber más en el enlace. Usa frases como:
- Mira en el enlace por qué te pasa esto
- Aprende qué hay detrás
- Descubre lo que pocos saben
- Entra al enlace y aprende más
NUNCA invites a comprar. NUNCA menciones producto.`
      else if (nivelNumGen === 2) reglaNivel = `REGLA SAGRADA NIVEL 2 — CONSCIENTE DEL PROBLEMA
AUDIENCIA: Sabe que algo anda mal pero no busca soluciones activamente.
ESTRATEGIA: Empatizar, educar sobre el problema y sus causas.
PROHIBIDO ABSOLUTAMENTE:
- Mencionar el nombre del producto
- Mencionar la marca
- Hacer promesas concretas de resolución
- Vender directamente
CÓMO ABRIR: Validación empática del dolor que el avatar reconoce, tipo si tú también
CÓMO DESARROLLAR: Explicar las causas reales del problema. Hacer que el avatar entienda por qué le pasa.
CTA OBLIGATORIO: Invitación a entender cómo otros lo resolvieron. Usa frases como:
- Entra al enlace y entiende cómo otros lo resolvieron
- Mira lo que muchos ya están haciendo
- Conoce más en el enlace
- Descubre qué hicieron quienes ya pasaron por esto
NUNCA nombres el producto. NUNCA hagas venta directa.`
      else if (nivelNumGen === 3) reglaNivel = `REGLA NIVEL 3 — CONSCIENTE DE LA SOLUCIÓN
AUDIENCIA: Conoce que existen soluciones pero no conoce este producto específico.
ESTRATEGIA: Presentar la propuesta como la mejor alternativa.
PERMITIDO: Mencionar el producto, pero como hallazgo natural, NO como anuncio publicitario.
CÓMO ABRIR: Conexión con la búsqueda activa del avatar, tipo estaba buscando algo que
CÓMO DESARROLLAR: Presentar el producto como descubrimiento personal, sin lenguaje publicitario tipo el mejor, único, revolucionario.
CTA: Invitación suave, sin presión:
- Descubrí algo que cambió todo
- Mira esto que encontré
- Vale la pena que lo veas
TONO: Hallazgo personal, no venta. NUNCA uses verbos imperativos de compra como compra u ordena.`
      else if (nivelNumGen === 4) reglaNivel = `REGLA NIVEL 4 — CONSCIENTE DEL PRODUCTO
AUDIENCIA: Conoce el producto pero duda.
ESTRATEGIA: Mostrar beneficios concretos, testimonios, garantías, comparativas.
PERMITIDO: Mencionar producto con beneficios, prueba social, urgencia suave.
CÓMO ABRIR: Reconoce las dudas comunes del avatar
CÓMO DESARROLLAR: Beneficios concretos, prueba social, garantías, comparativas
CTA: Urgencia suave, NO agresiva:
- Pruébalo tú mismo
- Es momento de intentarlo
- Únete a quienes ya lo usan
- Date la oportunidad de comprobarlo`
      else reglaNivel = `REGLA NIVEL 5 — TOTALMENTE CONSCIENTE
AUDIENCIA: Ya conoce, confía, solo necesita el empujón final.
ESTRATEGIA: Cerrar la venta con razón concreta para actuar HOY.
PERMITIDO: Venta directa, escasez, urgencia real, ofertas.
CÓMO ABRIR: Va al grano, sin preámbulos
CÓMO DESARROLLAR: Razón concreta para actuar HOY (descuento, escasez, beneficio limitado)
CTA: Acción directa:
- Pídelo ahora
- No lo dejes pasar
- Ya sabes lo que hace, es tu momento
- Última oportunidad antes de que se acabe`

      // Regla del motivo INTERPRETADA para video (secuencia con tiempo, no 1 frame)
      const reglaVid = REGLA_VIDEO_POR_MOTIVO[tipoV] || ''
      const esNivelBajoVid = parseInt(nivelGen, 10) <= 2
      const notaMotivoNivelBajoVid = esNivelBajoVid ? `

NOTA CRÍTICA SOBRE EL MOTIVO EN ESTE NIVEL:
Como el nivel es ${nivelGen}, la doctrina del motivo "${tipoV}" se aplica SOLO al TONO/EMOCIÓN, NO al contenido visual o narrativo. Es decir:
- El TONO del motivo se mantiene (ej: si Funcional → tono confiable y demostrativo, PERO sobre el PROBLEMA, no sobre la solución).
- El CONTENIDO NO debe mostrar producto, beneficio, ni resultado.
- Foco total en el dolor/problema/curiosidad sobre el problema.
- Para imagen: si motivo es Funcional pero nivel ≤ 2, NO muestres el producto en uso. Muestra la situación de dolor/problema del avatar SIN producto a la vista.
- Para video: si motivo es Funcional pero nivel ≤ 2, NO muestres "producto en uso (40-45%)". Toda la narrativa se queda en el problema y la curiosidad.
` : ''
      const bloqueReglaMotivoVid = esNivelBajoVid ? notaMotivoNivelBajoVid : (reglaVid ? `

REGLA NARRATIVA OBLIGATORIA SEGÚN EL MOTIVO "${tipoV}" (CRÍTICO PARA VIDEO):
${reglaVid}

El producto y la solución deben dominar el tiempo del video. El problema solo se introduce brevemente al inicio para crear contexto.` : '')

      // Regla del HOOK por ángulo (misma lógica que imagen, los 16 ángulos aplican a ambos)
      const angRuleVid = HOOK_POR_ANGULO[anguloV] || null
      const bloqueAngHookVid = angRuleVid ? `

REGLA OBLIGATORIA DEL HOOK SEGÚN EL ÁNGULO "${anguloV}":
${angRuleVid.instruccion}

EJEMPLOS DE HOOKS BUENOS PARA ESTE ÁNGULO:
${angRuleVid.buenos.map(b => '✅ ' + b).join('\n')}

EJEMPLOS DE HOOKS QUE NO SON ESTE ÁNGULO:
${angRuleVid.malos.map(m => '❌ ' + m).join('\n')}

Si tu hook no comunica claramente "${anguloV}" — REESCRÍBELO antes de cerrar la respuesta.` : ''

      const prompts = [
        { hook: hooksElegidos[0], enfoque: 'PROBLEMA/DOLOR', estilo: estilosNarrativos[0] },
        { hook: hooksElegidos[1], enfoque: 'TRANSFORMACIÓN/RESULTADO', estilo: estilosNarrativos[1] }
      ].map((enfoque, i) => `${basePrompt}

CONTEXTO DEL PRODUCTO:
${ctxOriginalFinal}

${avatarV ? `AVATAR OBJETIVO: ${avatarV}
Escribe el guión ESPECÍFICAMENTE para esta persona — usa su lenguaje, su contexto diario, su dolor concreto. No hables a un público genérico.` : ''}
${anguloV && ANGULOS_VENTA[anguloV] ? `ÁNGULO DE VENTA OBLIGATORIO: ${anguloV}
DEFINICIÓN: ${ANGULOS_VENTA[anguloV].que_hace}
ESTRUCTURA DEL GUIÓN: ${ANGULOS_VENTA[anguloV].estructura}
TONO: ${ANGULOS_VENTA[anguloV].tono}
EJEMPLO DE REFERENCIA: "${ANGULOS_VENTA[anguloV].ejemplo}"
Este ángulo es la estructura narrativa principal del guión — no solo afecta el hook, define cómo se desarrolla todo el mensaje.` : ''}

TAREA: Escribe UN SOLO guión de video publicitario.
${RELLENO_BLOCK(enfoque.hook)}

ESTILO NARRATIVO OBLIGATORIO para esta versión:
${enfoque.estilo}
Este estilo debe dominar TODO el guión, no solo el inicio.

${reglaNivel}${bloqueReglaMotivoVid}
${parseInt(nivelGen, 10) >= 3 ? bloqueReglaProducto15(anguloV) : `(Nivel ${nivelGen}: NO se menciona producto — la regla de aparición temprana del producto NO aplica.)`}

PALABRAS: exactamente ${npalabras} palabras (= ${dur3} segundos).
REGLA DE LONGITUD DEL GUION (CRÍTICA):
- Respeta estrictamente el conteo de palabras: 180 palabras por minuto = 3 palabras por segundo.
- NO excedas más de 10% del límite — máximo absoluto ${Math.ceil(npalabras * 1.1)} palabras.
${BLOQUE_CRITERIOS_DETERMINISTICOS}
${bloqueReglasEstructuralesAngulo(anguloV)}
${bloqueReglasCTANivel(nivelGen)}
${BLOQUE_AUTOVERIFICACION}

═══ REGLA DE LONGITUD DEL HOOK (CRÍTICA) ═══
El HOOK de cada versión (la primera frase antes del cuerpo) DEBE tener:
- Entre 5 y 9 palabras MÁXIMO
- Una sola línea
- Sin puntos suspensivos al final
- Termina en palabra fuerte (sustantivo/verbo/adjetivo)

EJEMPLOS BUENOS:
✅ "Mi taller cambió en cinco minutos" (6 palabras)
✅ "No raspes otro motor sin esto" (6 palabras)

EJEMPLOS MALOS (RECHAZAR):
❌ "En 5 minutos limpié mi motor con esta pulverizadora cuando antes me tomaba más de una hora" (16+ palabras)
❌ "Compré esto para mi taller y ahora limpiar motores ¡ya no existe!" (12 palabras y frase rara)

ANTES de entregar cada versión, cuenta las palabras del hook. Si >9 → reescríbelo MÁS CORTO.

FORMATO — devuelve ÚNICAMENTE esto:

═══════════════════════════════
VERSIÓN ${i+1} — Hook: [hook adaptado]
═══════════════════════════════
[texto narrado completo, listo para voz]
---

REGLAS:
- UNA sola versión
- Solo texto narrado — sin etiquetas ni indicaciones
- ${npalabras} palabras exactas
- Tono UGC, orgánico, lenguaje de ${paisV}
- CTA apropiado para el nivel (ver regla de nivel arriba)
- Empieza con ═══, sin texto previo${refuerzoGen}${bloqueAngHookVid}`
      )

      const resultados = []
      for (let i = 0; i < prompts.length; i++) {
        // CAMBIO A — diferenciación de cierre obligatoria
        const instrDif = `

INSTRUCCIÓN CRÍTICA DE DIFERENCIACIÓN:
Esta es la versión ${i+1} de 2. Las 2 versiones DEBEN tener un cierre completamente distinto.
- NO uses las mismas palabras finales que las otras versiones
- NO uses la misma frase de CTA literal, construye tu propio CTA con tus palabras
- Las últimas 5-7 palabras de cada versión deben ser únicas
- Los ejemplos de CTA del nivel son INSPIRACIÓN, no frases para copiar literalmente

REGLA DE DIVERSIDAD ENTRE VERSIONES:
- Las 2 versiones del mismo formato deben ser DIFERENTES en hook, narrativa y estructura interna.
- Pero AMBAS deben cumplir la regla del producto en las primeras 15 palabras.
- NO repitas la misma apertura entre versiones.`

        // CAMBIO B — inyectar cierres de versiones anteriores como "evitar"
        let bloqueEvitar = ''
        if (i === 1 && resultados[0]) {
          bloqueEvitar = `

CIERRE QUE DEBES EVITAR (versión 1 ya terminó así, no lo repitas ni parafrasees):
"${ultimasNPalabras(resultados[0], 60)}"`
        }

        const promptConDif = prompts[i] + instrDif + bloqueEvitar

        let rVid = await llamarModelo([{ role: 'user', content: promptConDif }], maxTokVersion)
        let t = rVid.texto
        registrarLlamada(`Video versión ${i+1}`, modeloUsado, rVid.inputTokens, rVid.outputTokens)
        // Reintentar si el modelo rechaza
        if (t.includes("Lo siento") || t.includes("I'm sorry") || t.includes("can't assist") || t.trim().length < 30) {
          rVid = await llamarModelo([{ role: 'user', content: promptConDif }], maxTokVersion)
          t = rVid.texto
          registrarLlamada(`Video versión ${i+1} (reintento)`, modeloUsado, rVid.inputTokens, rVid.outputTokens)
        }
        const num = i + 1
        let texto = t.trim()
        if (!texto.match(/^═{3,}/)) {
          texto = `═══════════════════════════════\nVERSIÓN ${num} — Hook: ` + texto
        } else {
          texto = texto.replace(/VERSI[OÓ]N \d+/, `VERSIÓN ${num}`)
        }
        if (!texto.trim().endsWith('---')) texto = texto.trim() + '\n---'

        // ── VALIDADOR POST-GENERACIÓN — producto en las primeras 15 palabras (niveles ≥ 3) ──
        // Determinístico: si el producto aparece tarde, se reintenta UNA vez con prompt
        // más estricto. Si el reintento tampoco cumple, se deja pasar con warning en logs.
        if (parseInt(nivelGen, 10) >= 3 && productoV) {
          const guionNarrado = extraerGuionNarrado(texto)
          const palabrasHastaProducto = contarPalabrasHastaProducto(guionNarrado, productoV)

          if (palabrasHastaProducto > 15) {
            console.log(`[VALIDADOR] Versión ${num}: producto aparece en palabra ${palabrasHastaProducto} (>15). Reintentando...`)

            const promptReintento = `${promptConDif}

═══════════════════════════════════════════════
TU INTENTO ANTERIOR FALLÓ — REINTENTO OBLIGATORIO:
El producto apareció en la palabra ${palabrasHastaProducto} del guion narrado. La regla EXIGE que el producto (nombre, categoría o referencia clara como "esta/este ...") aparezca dentro de las PRIMERAS 15 PALABRAS, sin excepción.

GUION QUE FALLÓ:
"${guionNarrado}"

Reescribe el MISMO concepto (mismo hook, mismo ángulo, misma longitud, mismo estilo narrativo, mismo CTA del nivel) pero con el producto mencionado dentro de las primeras 15 palabras del texto narrado.
Devuelve SOLO el formato indicado (═══ ... VERSIÓN ${num} — Hook: ... ═══ ... texto ... ---).
═══════════════════════════════════════════════`

            try {
              const rRe = await llamarModelo([{ role: 'user', content: promptReintento }], maxTokVersion)
              registrarLlamada(`Video versión ${num} (reintento validador producto)`, modeloUsado, rRe.inputTokens, rRe.outputTokens)
              const tRe = String(rRe.texto || '').trim()

              if (tRe.length > 30 && !tRe.includes("I'm sorry") && !tRe.includes("Lo siento") && !tRe.includes("can't assist")) {
                let textoRe = tRe
                if (!textoRe.match(/^═{3,}/)) {
                  textoRe = `═══════════════════════════════\nVERSIÓN ${num} — Hook: ` + textoRe
                } else {
                  textoRe = textoRe.replace(/VERSI[OÓ]N \d+/, `VERSIÓN ${num}`)
                }
                if (!textoRe.trim().endsWith('---')) textoRe = textoRe.trim() + '\n---'

                const reCount = contarPalabrasHastaProducto(extraerGuionNarrado(textoRe), productoV)
                if (reCount <= 15) {
                  texto = textoRe
                  console.log(`[VALIDADOR] Versión ${num}: reintento OK, producto ahora en palabra ${reCount}.`)
                } else {
                  console.warn(`[VALIDADOR] Versión ${num}: el reintento sigue fallando (producto en palabra ${reCount}). Se devuelve el guion original SIN bloquear la generación.`)
                }
              } else {
                console.warn(`[VALIDADOR] Versión ${num}: el reintento no devolvió un guion válido. Se devuelve el guion original SIN bloquear.`)
              }
            } catch (e) {
              console.warn(`[VALIDADOR] Versión ${num}: error en el reintento (${e?.message || e}). Se devuelve el guion original SIN bloquear.`)
            }
          } else {
            console.log(`[VALIDADOR] Versión ${num}: OK, producto en palabra ${palabrasHastaProducto}.`)
          }
        }

        resultados.push(texto)
      }
      responseText = resultados.join('\n\n')

      // Post-process: ajustar cada guión neto al número exacto de palabras
      const objetivo = dur3==='10'?30:dur3==='20'?60:dur3==='30'?90:dur3==='40'?120:dur3==='50'?150:180
      responseText = ajustarNetosEnTexto(responseText, objetivo)

    } else if (modo === 'correccion' && !isImagenFormato) {
      // ── Corrección de video: aplicar corrección a cada una de las 2 versiones por separado ──
      // El body[1] (assistant) tiene el texto con las 2 versiones, body[2] (user) tiene la instrucción
      const textoActual = body.find(m => m.role === 'assistant')?.content || ''
      const instruccion = body[body.length-1].content

      // Extraer las 2 versiones del texto actual
      const versionesActuales = textoActual.split(/\n\n---\n\n/).filter(v => v.trim().length > 20)

      const durMatchC = body[0].content.match(/DURACI[ÓO]N: (\d+)/)
      const durC = durMatchC ? durMatchC[1] : '30'
      const npalabrasC = durC==='10'?30:durC==='20'?60:durC==='30'?90:durC==='40'?120:durC==='50'?150:180
      const maxTokC = durC==='10'?800:durC==='20'?900:durC==='30'?1000:durC==='40'?1200:durC==='50'?1500:2200

      // FIX #10 — bloque refuerzo en niveles 1-2 (la corrección no inyecta userMsg directo, solo refuerzo)
      const nivelC = (body[0].content.match(/NIVEL:\s*(\d+)/) || [])[1]
      const refuerzoC = debeSanitizar(nivelC) ? BLOQUE_REFUERZO_NIVEL12 : ''

      const resultadosC = []
      for (let i = 0; i < Math.min(versionesActuales.length, 2); i++) {
        // CAMBIO D — anti-repetición de cierres entre las 2 versiones corregidas
        let bloqueEvitarC = ''
        if (i === 1 && resultadosC[0]) {
          bloqueEvitarC = `

CIERRE QUE DEBES EVITAR (versión 1 corregida ya terminó así, no lo repitas ni parafrasees):
"${ultimasNPalabras(resultadosC[0], 60)}"`
        }

        const promptC = `Te doy una versión de un guión de video. Aplica esta corrección manteniendo TODO lo demás (hook, estructura, mensaje, longitud, tono):

CORRECCIÓN A APLICAR: "${instruccion.match(/\"([^\"]+)\"/)?.[1] || instruccion}"

VERSIÓN ${i+1} ORIGINAL:
${versionesActuales[i]}

INSTRUCCIONES:
- Aplica SOLO la corrección indicada, no rehagas el guión desde cero
- Mantén EXACTAMENTE ${npalabrasC} palabras de narración
- Mantén el mismo hook (a menos que la corrección pida cambiarlo)
- Devuelve SOLO esto, sin texto previo:

═══════════════════════════════
VERSIÓN ${i+1} — Hook: [hook]
═══════════════════════════════
[texto corregido]
---

INSTRUCCIÓN CRÍTICA DE DIFERENCIACIÓN:
Esta es la versión ${i+1} de 2 corregidas. Las 2 versiones DEBEN tener un cierre completamente distinto entre sí.
- NO uses las mismas palabras finales que las otras versiones corregidas
- Las últimas 5-7 palabras de cada versión deben ser únicas
- Si la corrección no toca el cierre, reescribe el cierre con palabras propias para no repetir el de las otras versiones${bloqueEvitarC}${refuerzoC}
${RELLENO_BLOCK_PRESERVAR}`
        let rCorr = await llamarModelo([{role:'user', content: promptC}], maxTokC)
        let t = rCorr.texto
        registrarLlamada(`Corrección video versión ${i+1}`, modeloUsado, rCorr.inputTokens, rCorr.outputTokens)
        if (t.includes("Lo siento") || t.includes("I'm sorry") || t.trim().length < 30) {
          rCorr = await llamarModelo([{role:'user', content: promptC}], maxTokC)
          t = rCorr.texto
          registrarLlamada(`Corrección video versión ${i+1} (reintento)`, modeloUsado, rCorr.inputTokens, rCorr.outputTokens)
        }
        let texto = t.trim()
        if (!texto.match(/^═{3,}/)) {
          texto = `═══════════════════════════════\nVERSIÓN ${i+1} — Hook: ` + texto
        } else {
          texto = texto.replace(/VERSI[OÓ]N \d+/, `VERSIÓN ${i+1}`)
        }
        if (!texto.trim().endsWith('---')) texto = texto.trim() + '\n---'
        resultadosC.push(texto)
      }

      responseText = resultadosC.join('\n\n')
      responseText = ajustarNetosEnTexto(responseText, npalabrasC)

    } else {
      // ── Imagen / análisis / corrección / mapeo — llamada única ──
      // FIX #8 — si imagePrompts3 está set, hacer 2 llamadas paralelas (una por eje)
      if (imagePrompts3) {
        const maxTokIdea = 1500
        // Función que llama al LLM, valida el hook y reintenta UNA vez si terminó mal
        const llamarConValidacion = async (promptOriginal, idxEje) => {
          const rPrim = await llamarModelo([{ role:'user', content: promptOriginal }], maxTokIdea)
          registrarLlamada(`Imagen idea ${idxEje+1}`, modeloUsado, rPrim.inputTokens, rPrim.outputTokens)
          const primera = rPrim.texto
          const hookExtraido = extraerHookDeRespuesta(primera)
          if (!hookTerminaMal(hookExtraido, true)) return primera
          // Diagnóstico: ¿el problema es longitud, palabra final, o ambos?
          const nPalabrasPrev = hookExtraido.trim().replace(/[.!?¿¡,;:]+$/, '').trim().split(/\s+/).filter(Boolean).length
          const excedeLongitud = nPalabrasPrev > 7
          const bloqueLongitud = excedeLongitud
            ? `El hook anterior tenía ${nPalabrasPrev} palabras. ACÓRTALO. El ideal es 3-5 palabras, el máximo absoluto es 7. Si tu hook actual dice "Vas a necesitar esto para tu cintura" (7 palabras), podrías decir "Tu cintura merece esto" (4 palabras) o "Cintura sin dolor" (3 palabras). Manten la frase autónoma y completa.`
            : ''
          // Reintento: prompt reforzado con el error específico
          const promptReintento = `${promptOriginal}

REINTENTO OBLIGATORIO POR HOOK MAL CONSTRUIDO:
El hook que generaste antes era: "${hookExtraido}". Esto es INACEPTABLE.
${bloqueLongitud}
Genera de nuevo. El hook DEBE terminar en sustantivo concreto, verbo conjugado o signo de puntuación.
El hook DEBE tener máximo 7 palabras (ideal 3-5).
Genera la idea completa otra vez con un hook nuevo, corto y completo.`
          try {
            const rSeg = await llamarModelo([{ role:'user', content: promptReintento }], maxTokIdea)
            registrarLlamada(`Imagen idea ${idxEje+1} (reintento validador)`, modeloUsado, rSeg.inputTokens, rSeg.outputTokens)
            const segunda = rSeg.texto
            const hookSegundo = extraerHookDeRespuesta(segunda)
            // Aceptar la segunda si mejoró; si no, degradar grácil a la primera
            return !hookTerminaMal(hookSegundo, true) ? segunda : primera
          } catch (e) {
            return primera
          }
        }
        const settled = await Promise.allSettled(
          imagePrompts3.map((p, idx) => llamarConValidacion(p, idx))
        )
        // Renumerar headers a 1/2 y normalizar separador
        const bloques = settled.map((r, i) => {
          if (r.status !== 'fulfilled' || !r.value) {
            return `IDEA DE IMAGEN ${i+1} — ${EJES_IMAGEN[i].nombre}\nHook: [Generación falló para este eje]\nDescripción de la imagen:\n• Error: la llamada para el eje "${EJES_IMAGEN[i].nombre}" no devolvió contenido\nTexto en imagen:\n• Reintenta o cambia de modelo`
          }
          let txt = String(r.value).trim()
          // El LLM devuelve "IDEA DE IMAGEN 1" en cada llamada — renumerar al índice real
          if (txt.match(/IDEA DE IMAGEN\s*\d+/i)) {
            txt = txt.replace(/IDEA DE IMAGEN\s*\d+/i, `IDEA DE IMAGEN ${i+1}`)
          } else {
            txt = `IDEA DE IMAGEN ${i+1}\n\n${txt}`
          }
          // Quitar separador --- final si vino, lo agregamos uniforme
          txt = txt.replace(/\n*---\s*$/g, '').trim()
          return txt
        })
        responseText = bloques.join('\n\n---\n\n')
      } else {
        // Análisis y mapeo de advertorial necesitan más tokens (JSON estructurado largo)
        const isAnalisisOMapeo = isAnalisis || (modo === 'mapear_advertorial') || (modo === 'auditar')
        const maxTok = isImagenFormato ? 2500 : isAnalisisOMapeo ? 6000 : 4000
        const tipoLlamada = isAnalisis ? 'Análisis' : (modo === 'auditar') ? 'Auditoría' : (modo === 'mapear_advertorial') ? 'Mapeo advertorial' : (isVariaciones) ? 'Variaciones' : (modo === 'correccion') ? 'Corrección' : 'Llamada principal'
        const rMain = await llamarModelo(body, maxTok)
        responseText = rMain.texto
        if (isAnalisis) console.log('[GENERATE-ANALISIS] Respuesta cruda del LLM (primeros 500 chars):', JSON.stringify(rMain).substring(0, 500))
        registrarLlamada(tipoLlamada, modeloUsado, rMain.inputTokens, rMain.outputTokens)
      }
    }

    return res.status(200).json({ content: [{ text: responseText }], promptEjecutado, hooksIndicesUsados, costoOperacion })

  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
    responseLimit: "20mb",
  },
};
