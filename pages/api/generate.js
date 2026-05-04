const { HOOKS_COMPLETOS, TODOS_LOS_HOOKS } = require('../../data/hooks-data')

const ANGULOS_VENTA = {
  'Problema/Dolor': 'Empieza activando el problema concreto que vive el avatar. Muestra el dolor de forma reconocible antes de cualquier solución.',
  'Beneficio/Resultado': 'Empieza mostrando el resultado final ya logrado. Lo que el avatar va a tener/sentir/lograr es el centro de todo el guión.',
  'Curiosidad': 'Abre con un dato, hecho o pregunta que genere "necesito saber más". Mantén el misterio durante el desarrollo y resuélvelo al final.',
  'Urgencia/Escasez': 'El motor del guión es el tiempo o disponibilidad limitada. "Antes de que se acabe", "solo por hoy", "últimas unidades". El producto es lo que urge tomar ya.',
  'Autoridad/Prueba Social': 'Apóyate en evidencia externa: número de clientes, recomendado por X, testimonios reales, datos verificables. La credibilidad la da el otro.',
  'Novedad': 'Posiciona como algo nuevo, recién llegado, descubrimiento reciente. "Acaba de salir", "lo último en", "la nueva forma de".',
  'Comparación/Contraste': 'Confronta dos opciones: el producto vs lo tradicional, antes vs ahora, ellos vs nosotros. El producto siempre gana la comparación.',
  'Enemigo en Común': 'Identifica un villano externo (la industria, un hábito mainstream, un mito, otra marca implícita) contra el que el producto pelea junto al avatar.',
  'Historia': 'Narrativa de un personaje (real o representativo) que vivió una transformación gracias al producto. Estructura: situación, conflicto, descubrimiento, resolución.',
  'Transformación': 'Centro en el cambio del avatar: quién era antes vs quién es ahora. El producto es el catalizador del cambio personal.',
  'FOMO': 'Ya hay gente que lo tiene/usa/disfruta y eso está pasando ahora. Quien no actúa se queda fuera. "Mientras tú lees esto otros ya están..."',
  'Simplicidad': 'El ángulo es la facilidad. "Solo 3 pasos", "tan simple como", "sin complicaciones". El producto resuelve sin esfuerzo.',
  'Ironía/Provocación': 'Tono irreverente o sarcástico. Cuestiona algo obvio, se ríe de una creencia común, rompe la cuarta pared. Memorable por descarado.',
  'Precio/Valor': 'El centro es la relación valor/precio. "Por menos de", "lo que pagas por X equivale a Y", "una sola compra que reemplaza Z". Justifica económicamente.',
  'Exclusividad': 'No es para todos. Selectivo, especial, para quienes saben/merecen/buscan algo distinto. Apela al estatus o pertenencia a un grupo selecto.',
  'Aspiracional': 'Apela al ideal, al deseo de convertirse en una mejor versión. Conecta el producto con el estilo de vida o identidad que el avatar quiere tener.'
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
EVITA: Explicaciones largas. Lenguaje técnico. Sonar como conferencia. CTA agresivos. Mencionar tiendas o plataformas de venta.`,

  Directo: `Quiero que actúes como un experto senior en marketing digital especializado en Meta Ads y respuesta directa.
Ayúdame a construir un guión para un video publicitario con enfoque directo, para audiencias nivel de consciencia 4 y 5.
El objetivo: presentar el producto de forma clara y persuasiva para impulsar la conversión inmediata.
ESTRUCTURA OBLIGATORIA:
1. Hook directo (0-3s) → Mostrar el producto en acción o resultado claro
2. Presentación clara → Qué es + para quién es
3. Beneficios principales (rápidos y concretos)
4. Diferenciador clave → Qué lo hace mejor o distinto
5. Demostración breve / uso → Lo fácil que es usarlo
6. Refuerzo de confianza
7. Cierre con CTA directo pero natural
CLAVES: Ir al punto rápidamente. El producto es el protagonista desde el segundo 1.
ESTILO: Demostrativo / directo a cámara / hands-on.
EVITA: Storytelling largo. Rodeos. CTA agresivos. Mencionar tiendas o plataformas de venta.`
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

Tu misión es crear 3 IDEAS DE IMAGEN en formato ${formatoImg.toUpperCase()} para un anuncio estático de alta conversión en tráfico frío. Las 3 ideas deben seguir el mismo formato pero con enfoques, ángulos y mensajes completamente diferentes.

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { messages, modo, apiProvider, modelo } = req.body
  const provider = apiProvider || 'openai'
  const modeloGPT = (modelo && modelo.startsWith('gpt')) ? modelo : 'gpt-4o-mini'
  const modeloClaude = (modelo && modelo.startsWith('claude')) ? modelo : 'claude-sonnet-4-6'

  try {
    const body = JSON.parse(JSON.stringify(messages))
    const isAnalisis = modo === 'analizar'
    const isGenerar = modo === 'generar'
    const isVariaciones = modo === 'variaciones'
    let promptEjecutado = ''

    if (isAnalisis) {
      const userMsg = body[0].content
      const promptAnalisis = `Eres un experto senior en marketing digital especializado en Meta Ads, TikTok Ads y respuesta directa para ecommerce. Tienes profundo conocimiento de Eugene Schwartz, Joe Sugarman, Dan Kennedy, Gary Halbert y Alex Hormozi.

${userMsg}

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
{"niveles":[{"numero":1,"nombre":"Inconsciente","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":2,"nombre":"Consciente del problema","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":3,"nombre":"Consciente de la solucion","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":4,"nombre":"Consciente del producto","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""},{"numero":5,"nombre":"Totalmente consciente","angulo":"","porque_si":"","porque_no":"","ejemplo_hook":""}],"tipos":[{"tipo":"Emocional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Funcional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Educativo","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Racional","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0},{"tipo":"Directo","score":0,"porque_convierte":"","porque_no":"","mejor_nivel":0}],"nivel_recomendado":0,"tipo_recomendado":"","razon_recomendacion":"","avatares":[{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0},{"nombre":"","descripcion":"","dolor_principal":"","tamano_publico":"","relevancia":0}],"avatar_recomendado":0,"angulos_recomendados":[{"angulo":"","score":0,"porque":""}]}

Completa todos los campos vacios con tu analisis real del producto. CRITICO: score DEBE ser un INTEGER (85, 72, 60...) NUNCA texto ni palabras en ingles. ejemplo_hook sin comillas.`
      promptEjecutado = promptAnalisis
      body[0].content = promptAnalisis

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
        const defAnguloImg = anguloImg && ANGULOS_VENTA[anguloImg] ? `\n\nÁNGULO DE VENTA: ${anguloImg}\nDEFINICIÓN: ${ANGULOS_VENTA[anguloImg]}\nLas 3 ideas deben aplicar este ángulo en su composición y mensaje visual.` : ''
        const avatarImgLine = avatarImg ? `\n\nAVATAR OBJETIVO: ${avatarImg}\nLas ideas deben hablarle específicamente a esta persona — su contexto, su lenguaje visual, su realidad.` : ''
        promptFinal = `${PROMPT_IMAGEN_BASE(formatoImgSel)}${avatarImgLine}${defAnguloImg}

CONTEXTO DEL PRODUCTO Y NIVEL:
${userMsg}

LISTA DE HOOKS DISPONIBLES — elige los 3 más poderosos y visuales para imagen estática (${hooksDelTipo.length} hooks disponibles):
- ${hooksStr}

INSTRUCCIÓN DE HOOKS: De la lista anterior selecciona los 3 hooks más visuales e impactantes para imagen estática. Adáptalos al producto real reemplazando los ___. Los 3 deben ser diferentes en enfoque: uno puede atacar el dolor, otro la curiosidad, otro el resultado o transformación. NO inventes hooks fuera de la lista.

${(()=>{
  const nivelImgNum = parseInt(userMsg.match(/NIVEL:\s*(\d+)/)?.[1] || '3')
  if (nivelImgNum <= 1) return 'REGLA NIVEL 1: NO menciones el producto ni la marca en ningún elemento visual ni en el texto. Activa dolor/curiosidad. CTA persuasivo: invite a descubrir, no a comprar.'
  if (nivelImgNum === 2) return 'REGLA NIVEL 2: NO menciones el producto ni la marca. Valida el dolor, sugiere que hay solución sin decirla. CTA que invite a conocer más.'
  if (nivelImgNum === 3) return 'REGLA NIVEL 3: El producto puede aparecer con su nombre pero de forma natural, como hallazgo. CTA persuasivo y suave: "descúbrelo", "conócelo", "míralo tú mismo".'
  if (nivelImgNum === 4) return 'REGLA NIVEL 4: Producto presente con beneficios claros. CTA con urgencia suave: "pruébalo", "es tu momento", "únete a quienes ya lo usan".'
  return 'REGLA NIVEL 5: Producto y marca visibles. CTA directo pero no agresivo: "pídelo ahora", "ya sabes lo que hace".'
})()}

REGLAS FINALES:
- Las 3 ideas completamente diferentes en composición y ángulo
- Sin mencionar tiendas ni plataformas de venta
- Pensado para tráfico frío en ${pais}
- Cada idea ejecutable con producción realista
- El Hook DEBE aparecer exactamente con el label "Hook:" seguido del texto`

      } else {
        promptFinal = `${PROMPTS_POR_TIPO[tipo] || PROMPTS_POR_TIPO['Emocional']}

CONTEXTO:
${userMsg}

PALABRAS: ${duracion==='10'?22:duracion==='20'?43:duracion==='30'?65:duracion==='40'?87:duracion==='50'?108:130} palabras por versión (equivale a ${duracion} segundos). Las 3 versiones deben tener el mismo conteo.

HOOKS DISPONIBLES — tipo ${tipo.toUpperCase()} (elige los 3 mejores y adáptalos al producto):
- ${hooksStr}

FORMATO — genera exactamente 3 versiones:

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

═══════════════════════════════
VERSIÓN 3 — Hook: [tercer hook adaptado]
═══════════════════════════════
[texto narrado completo, listo para voz, sin etiquetas]
---

REGLAS:
- Solo texto narrado — sin escenas, sin indicaciones de producción, sin etiquetas
- Tono UGC, orgánico, que no suene a publicidad
- Genera dopamina: ritmo, curiosidad, ganchos que retengan
- CTA natural al final, sin mencionar tiendas ni plataformas
- Lenguaje natural de ${pais}
- Las 3 versiones completamente diferentes entre sí
- Empieza DIRECTAMENTE con la línea ═══ de VERSIÓN 1, sin texto introductorio`
      }

      promptEjecutado = promptFinal
      body[0].content = promptFinal

    } else if (isVariaciones) {
      // Tomar el guión base y generar 3 variaciones con mismo conteo de palabras
      const userMsg = body[0].content
      const durMatch = userMsg.match(/DURACI[OÓ]N: ([^\n]+)/)
      const duracion = durMatch ? durMatch[1].replace(' segundos','').trim() : '30'
      const palabras = duracion==='10'?22:duracion==='20'?43:duracion==='30'?65:duracion==='40'?87:duracion==='50'?108:130
      const tipoVar = userMsg.match(/TIPO: (\w+)/)?.[1] || 'Funcional'
      const hooksDelTipoVar = HOOKS_COMPLETOS[tipoVar] || TODOS_LOS_HOOKS
      const hooksStrVar = hooksDelTipoVar.join('\n- ')

      const nivelNumVar = parseInt(userMsg.match(/NIVEL:\s*(\d+)/)?.[1] || '3')
      const anguloVar = userMsg.match(/ANGULO_VENTA: ([^\n]+)/)?.[1]?.trim() || ''
      const defAnguloVar = anguloVar && ANGULOS_VENTA[anguloVar] ? `\nMantén el ángulo de venta "${anguloVar}": ${ANGULOS_VENTA[anguloVar]}` : ''
      const reglaNivelVar = nivelNumVar <= 2
        ? `REGLA CRÍTICA: Nivel de consciencia ${nivelNumVar}. NO menciones el producto, la marca ni ninguna solución específica. ${nivelNumVar===1?'Activa el dolor como revelación.':'Valida el dolor y promete que hay respuesta sin decirla.'} CTA: lleva a descubrir más, no a comprar.`
        : nivelNumVar === 3 ? `REGLA: Nivel 3. Presenta el producto como hallazgo natural, no como venta.`
        : nivelNumVar === 4 ? `REGLA: Nivel 4. Menciona el producto con beneficios y diferenciadores. CTA natural con urgencia suave.`
        : `REGLA: Nivel 5. CTA directo y con convicción. Puedes usar urgencia o escasez si aplica.`

      const promptVariaciones = `Eres experto en copywriting de respuesta directa. Te doy un guión aprobado. Genera 3 VARIACIONES — mismo hook, mismo mensaje, reescrito con otras palabras y diferente estilo narrativo.

GUIÓN ORIGINAL A VARIAR:
${userMsg}

${reglaNivelVar}${defAnguloVar}

INSTRUCCIONES:
- Usa EXACTAMENTE el mismo hook en las 3 variaciones
- Cada variación con estilo narrativo diferente:
  VARIACIÓN 1: Desde experiencia personal ("yo...", "mi problema era...", "desde que...")
  VARIACIÓN 2: Desde demostración y evidencia ("esto funciona porque...", "lo que hace es...", "el resultado...")
  VARIACIÓN 3: Desde pregunta o revelación ("¿sabías que...", "la mayoría no sabe...", "el problema real es...")
- Las 3 deben sonar completamente diferentes entre sí y al original
- MISMO mensaje central, mismo hook
- EXACTAMENTE ${palabras} palabras por variación
- Solo texto narrado — sin etiquetas ni indicaciones

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

═══════════════════════════════
VERSIÓN 3 — Hook: [mismo hook del original]
═══════════════════════════════
[texto narrado completo, reescrito con otras palabras]
---

Empieza DIRECTAMENTE con ═══ de VERSIÓN 1, sin texto introductorio`

      promptEjecutado = promptVariaciones
      body[0].content = promptVariaciones

    } else if (modo === 'auditar') {
      const userMsg = body[0].content
      const promptAuditoria = `Eres un auditor senior de marketing digital experto en Meta Ads. Tu trabajo NO es escribir creativos, es VALIDAR si un guion/idea de imagen cumple las decisiones estratégicas que se tomaron al crearlo en este ads creator.

INPUT QUE RECIBES (incluye decisiones y el guion/idea generado):
${userMsg}

ALCANCE DE LA AUDITORÍA — REGLAS ABSOLUTAS:
- Auditas SOLO los 5 criterios del ads creator: Avatar, Nivel de Consciencia, Motivo/Tipo, Ángulo de Venta, Información de referencia.
- NO auditas coherencia con advertoriales. El advertorial puede aparecer como "información de referencia" pero NO es criterio de cumplimiento.
- En este sistema TODAS las decisiones son obligatorias (avatar, nivel, motivo, ángulo). Siempre las evalúas.
- Sé crítico, no condescendiente. Si algo no cumple, dilo. Esto sirve para entrenar al equipo.

REGLAS SAGRADAS POR NIVEL DE CONSCIENCIA (no las violes en la auditoría):
- Nivel 1 INCONSCIENTE: prohibido mencionar producto, marca o solución específica. Si el guion las menciona = ❌ (no es coherente con el nivel).
- Nivel 2 CONSCIENTE DEL PROBLEMA: prohibido mencionar producto, marca o nombre del mecanismo. Solo se valida el dolor y se sugiere que hay solución sin nombrarla. Si nombra producto/marca/mecanismo = ❌. NUNCA exijas que mencione el mecanismo en este nivel.
- Nivel 3 CONSCIENTE DE LA SOLUCIÓN: el producto puede aparecer naturalmente, como hallazgo. CTA suave.
- Nivel 4 CONSCIENTE DEL PRODUCTO: producto presente con beneficios claros. CTA con urgencia suave.
- Nivel 5 TOTALMENTE CONSCIENTE: producto y marca visibles. CTA directo permitido.

ÁNGULOS DE VENTA — DEFINICIONES:
- Problema/Dolor: activa el problema concreto antes de cualquier solución.
- Beneficio/Resultado: empieza mostrando el resultado final ya logrado.
- Curiosidad: dato/pregunta que genere "necesito saber más", misterio.
- Urgencia/Escasez: tiempo o disponibilidad limitada como motor.
- Autoridad/Prueba Social: evidencia externa, número de clientes, testimonios.
- Novedad: posiciona como descubrimiento reciente, recién llegado.
- Comparación/Contraste: confronta producto vs alternativa, antes vs ahora.
- Enemigo en Común: villano externo (industria, mito, otra marca implícita).
- Historia: narrativa de personaje con transformación.
- Transformación: cambio del avatar de antes a ahora.
- FOMO: ya hay gente disfrutándolo, quien no actúa se queda fuera.
- Simplicidad: facilidad, "solo 3 pasos", "sin complicaciones".
- Ironía/Provocación: tono irreverente o sarcástico, descarado.
- Precio/Valor: relación valor/precio, justifica económicamente.
- Exclusividad: no es para todos, selectivo, estatus.
- Aspiracional: ideal, identidad o estilo de vida que el avatar quiere.

PARA CADA CRITERIO EVALÚA:
- ✓ APLICADO: la decisión se cumple claramente. Cita LÍNEA o FRAGMENTO específico del guion como evidencia.
- ⚠ PARCIAL: se intenta pero no llega del todo. Explica qué falta y cita la línea problemática.
- ❌ NO APLICADO: no se cumple. Explica en qué se desvió y qué debería decir/hacer en su lugar.

FORMATO DE RESPUESTA EXACTO — solo emojis indicados, en este orden:

📊 AUDITORÍA DE CUMPLIMIENTO

👤 AVATAR
[✓/⚠/❌] [Verdict de 1 línea]
Evidencia: [línea o fragmento del guion, o lo que falta]

📈 NIVEL DE CONSCIENCIA
[✓/⚠/❌] [Verdict de 1 línea]
Evidencia: [línea o fragmento, o lo que falta]

🎭 MOTIVO/TIPO
[✓/⚠/❌] [Verdict de 1 línea]
Evidencia: [línea o fragmento, o lo que falta]

🎯 ÁNGULO DE VENTA
[✓/⚠/❌] [Verdict de 1 línea]
Evidencia: [línea o fragmento, o lo que falta]

📚 INFORMACIÓN DE REFERENCIA
[✓/⚠] ¿Se aprovecha el contexto provisto (descripción del producto, URL, archivos, advertorial si lo hay) para que el guion sea específico y no genérico?
Evidencia: [qué dato concreto del contexto se usa, o si el guion es genérico y debería usar algo del contexto]

🔧 RECOMENDACIONES DE MEJORA
- [Sugerencia accionable concreta 1, respetando las reglas del nivel]
- [Sugerencia accionable concreta 2]
- [Sugerencia accionable concreta 3]

📌 VEREDICTO GLOBAL
[1-2 líneas: cuántos criterios cumple de los evaluados / si debe regenerarse o se puede usar tal cual]`

      promptEjecutado = promptAuditoria
      body[0].content = promptAuditoria

    } else {
      // Corrección — mantener mensajes como vienen
    }

    let responseText = ''
    const isImagenFormato = body[0]?.content?.includes('FORMATO: imagen')
    const isVideoGenerar = (isGenerar || isVariaciones) && !isImagenFormato

    // ── Función de llamada única al modelo ──────────────────────────
    async function llamarModelo(messages, maxTok) {
      if (provider === 'claude') {
        if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY no configurada')
        let textC = ''
        let intentosC = 0
        while (intentosC < 3) {
          const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: modeloClaude, max_tokens: maxTok, messages })
          })
          const d = await r.json()
          if (d.error) throw new Error(d.error.message || JSON.stringify(d.error))
          textC = d.content?.[0]?.text || ''
          if (!textC.includes("Lo siento") && !textC.includes("I'm sorry") && !textC.includes("can't assist")) break
          intentosC++
        }
        return textC
      } else {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY no configurada')
        let text = ''
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
          if (!text.includes("I'm sorry") && !text.includes("can't assist")) break
          intentos++
        }
        return text
      }
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

    if (isVideoGenerar) {
      // ── 3 llamadas paralelas, una por versión, con max_tokens ajustado ──
      const durMatch3 = body[0].content.match(/DURACI[ÓO]N: (\d+)/)
      const dur3 = durMatch3 ? durMatch3[1] : '30'
      const maxTokVersion = dur3==='10'?800:dur3==='20'?900:dur3==='30'?1000:dur3==='40'?1200:dur3==='50'?1500:2200

      // Construir prompt para UNA versión por llamada
      const ctxOriginal = body[0].content
      const tipoV = ctxOriginal.match(/TIPO: (\w+)/)?.[1] || tipo
      const avatarV = ctxOriginal.match(/AVATAR: ([^\n]+)/)?.[1]?.trim() || ''
      const anguloV = ctxOriginal.match(/ANGULO_VENTA: ([^\n]+)/)?.[1]?.trim() || ''
      const paisV = ctxOriginal.match(/MERCADO: ([^\n]+)/)?.[1]?.trim() || pais
      const npalabras = dur3==='10'?22:dur3==='20'?43:dur3==='30'?65:dur3==='40'?87:dur3==='50'?108:130
      const hooksV = (HOOKS_COMPLETOS[tipoV] || TODOS_LOS_HOOKS).join('\n- ')
      const basePrompt = PROMPTS_POR_TIPO[tipoV] || PROMPTS_POR_TIPO['Emocional']

      // Llamada previa: elegir 3 índices de hooks para este producto
      const listaHooks = HOOKS_COMPLETOS[tipoV] || TODOS_LOS_HOOKS
      const listaNum = listaHooks.slice(0, 40)
      const promptSelHooks = `Eres experto en copywriting. Dado este producto, elige los 3 números de hooks más efectivos de la lista — uno por enfoque (PROBLEMA, TRANSFORMACION, CURIOSIDAD). Responde SOLO JSON: {"i1":0,"i2":0,"i3":0} con los índices numéricos. Sin texto extra.

PRODUCTO: ${ctxOriginal.substring(0, 400)}

HOOKS NUMERADOS:
${listaNum.map((h,i)=>i+': '+h).join('\n')}`

      const fallbackIdx = [2, Math.floor(listaNum.length*0.4), Math.floor(listaNum.length*0.75)]
      let hooksElegidos = fallbackIdx.map(i => listaHooks[i] || listaHooks[0])
      try {
        const rH = await llamarModelo([{role:'user',content:promptSelHooks}], 150)
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
      } catch(e) { /* usar fallback */ }

      const estilosNarrativos = [
        `Narra desde la EXPERIENCIA PERSONAL del usuario — usa "yo", habla de tu vida diaria, el problema que vivías, cómo lo descubriste. Tono confesional, íntimo.`,
        `Narra desde la EVIDENCIA Y DEMOSTRACIÓN — describe qué hace el producto, cómo funciona, qué resultado produce. Tono demostrativo, directo, concreto.`,
        `Narra desde una PREGUNTA O DATO SORPRENDENTE — abre con algo que el espectador no sabía, genera curiosidad, explica el porqué. Tono revelador, educativo.`
      ]

      const nivelNumGen = parseInt(ctxOriginal.match(/NIVEL:\s*(\d+)/)?.[1] || '3')
      let reglaNivel = ''
      if (nivelNumGen <= 1) reglaNivel = 'REGLA CRITICA NIVEL 1: El espectador NO sabe que tiene el problema. PROHIBIDO mencionar producto, marca o solucion. Activa el dolor como revelacion o dato curioso. CTA: lleva a descubrir por que le pasa esto, nunca a comprar.'
      else if (nivelNumGen === 2) reglaNivel = 'REGLA CRITICA NIVEL 2: El espectador sabe que tiene el problema pero no busca solucion. PROHIBIDO mencionar producto o marca. Valida su dolor, hazle sentir que no esta solo y que hay respuesta — sin decir cual. CTA: lleva a entender como otros lo resolvieron, nunca a comprar.'
      else if (nivelNumGen === 3) reglaNivel = 'REGLA NIVEL 3: El espectador conoce que existen soluciones. Presenta el producto como hallazgo natural ("descubri algo", "encontre una forma"), no como venta directa.'
      else if (nivelNumGen === 4) reglaNivel = 'REGLA NIVEL 4: El espectador conoce productos similares. Menciona el producto con beneficios concretos. CTA con urgencia suave: "pruebalo", "es tu momento".'
      else reglaNivel = 'REGLA NIVEL 5: El espectador conoce este producto. CTA directo y con conviccion: "pidelo ahora", "no lo dejes pasar". Puedes usar escasez o urgencia.'

      const prompts = [
        { hook: hooksElegidos[0], enfoque: 'PROBLEMA/DOLOR', estilo: estilosNarrativos[0] },
        { hook: hooksElegidos[1], enfoque: 'TRANSFORMACIÓN/RESULTADO', estilo: estilosNarrativos[1] },
        { hook: hooksElegidos[2], enfoque: 'CURIOSIDAD', estilo: estilosNarrativos[2] }
      ].map((enfoque, i) => `${basePrompt}

CONTEXTO DEL PRODUCTO:
${ctxOriginal}

${avatarV ? `AVATAR OBJETIVO: ${avatarV}
Escribe el guión ESPECÍFICAMENTE para esta persona — usa su lenguaje, su contexto diario, su dolor concreto. No hables a un público genérico.` : ''}
${anguloV ? `ÁNGULO DE VENTA OBLIGATORIO: ${anguloV}
DEFINICIÓN del ángulo: ${ANGULOS_VENTA[anguloV] || 'Aplica este ángulo de forma coherente'}
Este ángulo es la estructura narrativa principal del guión — no solo afecta el hook, define cómo se desarrolla todo el mensaje.` : ''}

TAREA: Escribe UN SOLO guión de video publicitario.

HOOK OBLIGATORIO — úsalo EXACTAMENTE al inicio: "${enfoque.hook}"
(adapta los ___ al producto pero mantén la estructura del hook)

ESTILO NARRATIVO OBLIGATORIO para esta versión:
${enfoque.estilo}
Este estilo debe dominar TODO el guión, no solo el inicio.

${reglaNivel}

PALABRAS: exactamente ${npalabras} palabras (= ${dur3} segundos).

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
- Empieza con ═══, sin texto previo`
      )

      const resultados = []
      for (let i = 0; i < prompts.length; i++) {
        let t = await llamarModelo([{ role: 'user', content: prompts[i] }], maxTokVersion)
        // Reintentar si el modelo rechaza
        if (t.includes("Lo siento") || t.includes("I'm sorry") || t.includes("can't assist") || t.trim().length < 30) {
          t = await llamarModelo([{ role: 'user', content: prompts[i] }], maxTokVersion)
        }
        const num = i + 1
        let texto = t.trim()
        if (!texto.match(/^═{3,}/)) {
          texto = `═══════════════════════════════\nVERSIÓN ${num} — Hook: ` + texto
        } else {
          texto = texto.replace(/VERSI[OÓ]N \d+/, `VERSIÓN ${num}`)
        }
        if (!texto.trim().endsWith('---')) texto = texto.trim() + '\n---'
        resultados.push(texto)
      }
      responseText = resultados.join('\n\n')

      // Post-process: ajustar cada guión neto al número exacto de palabras
      const objetivo = dur3==='10'?22:dur3==='20'?43:dur3==='30'?65:dur3==='40'?87:dur3==='50'?108:130
      responseText = ajustarNetosEnTexto(responseText, objetivo)

    } else if (modo === 'correccion' && !isImagenFormato) {
      // ── Corrección de video: aplicar corrección a cada una de las 3 versiones por separado ──
      // El body[1] (assistant) tiene el texto con las 3 versiones, body[2] (user) tiene la instrucción
      const textoActual = body.find(m => m.role === 'assistant')?.content || ''
      const instruccion = body[body.length-1].content

      // Extraer las 3 versiones del texto actual
      const versionesActuales = textoActual.split(/\n\n---\n\n/).filter(v => v.trim().length > 20)

      const durMatchC = body[0].content.match(/DURACI[ÓO]N: (\d+)/)
      const durC = durMatchC ? durMatchC[1] : '30'
      const npalabrasC = durC==='10'?22:durC==='20'?43:durC==='30'?65:durC==='40'?87:durC==='50'?108:130
      const maxTokC = durC==='10'?800:durC==='20'?900:durC==='30'?1000:durC==='40'?1200:durC==='50'?1500:2200

      const resultadosC = []
      for (let i = 0; i < Math.min(versionesActuales.length, 3); i++) {
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
---`
        let t = await llamarModelo([{role:'user', content: promptC}], maxTokC)
        if (t.includes("Lo siento") || t.includes("I'm sorry") || t.trim().length < 30) {
          t = await llamarModelo([{role:'user', content: promptC}], maxTokC)
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
      // Análisis y mapeo de advertorial necesitan más tokens (JSON estructurado largo)
      const isAnalisisOMapeo = isAnalisis || (modo === 'mapear_advertorial') || (modo === 'auditar')
      const maxTok = isImagenFormato ? 2500 : isAnalisisOMapeo ? 6000 : 4000
      responseText = await llamarModelo(body, maxTok)
    }

    return res.status(200).json({ content: [{ text: responseText }], promptEjecutado })

  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
