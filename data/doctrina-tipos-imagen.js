const DOCTRINA_TIPOS_IMAGEN = {
  'Funcional': {
    color: '#1a8cc4',
    esencia: 'Producto en uso real, sin distracciones.',
    composicion: 'Producto como protagonista absoluto en su contexto auténtico de uso. Foto realista del producto siendo usado. Headline corto arriba. Sin íconos circulares ni listas.',
    evitar: 'NO usar 4 cuadros (eso es Collage). NO íconos circulares con beneficios (eso es Beneficios). NO comparaciones SIN/CON (eso es Infográfico).',
    reglaTextoEnPieza: '1 frase de apoyo sobre la imagen, máximo 8 palabras. NO uses viñetas. NO listas. Texto corrido.'
  },
  'Collage': {
    color: '#8b5cf6',
    esencia: 'Mosaico de usos y ángulos del mismo producto.',
    composicion: '4 cuadros con bordes redondeados mostrando el producto en diferentes contextos, ángulos o usos. Título grande arriba con marca o nombre del producto. Cada cuadro es una foto distinta sin texto largo dentro.',
    evitar: 'NO escribir párrafos dentro de los cuadros. NO comparar SIN/CON.',
    reglaTextoEnPieza: 'Solo el título grande del producto o marca para colocar arriba del mosaico. NO texto adicional dentro de los cuadros. NO bullets.'
  },
  'Antes y Después': {
    color: '#ec4899',
    esencia: 'Contraste claro entre el problema y la solución.',
    composicion: 'Split vertical o secuencial. Lado izquierdo: problema visible (la condición a resolver). Lado derecho: producto en acción resolviéndolo. Línea o flecha divisora central. Headline emocional con contraste tipográfico (palabra clave en color/itálica distinta).',
    evitar: 'NO usar 4 cuadros (eso es Collage). NO listar beneficios con íconos (eso es Beneficios).',
    reglaTextoEnPieza: 'EXACTAMENTE 2 líneas: una para el lado "ANTES" y una para el lado "DESPUÉS". Máximo 6 palabras cada línea. NO uses viñetas. Formato:\nANTES: <frase corta>\nDESPUÉS: <frase corta>'
  },
  'Infográfico': {
    color: '#f59e0b',
    esencia: 'EDUCAR o COMPARAR. Tiene tensión, datos o confrontación visual.',
    composicion: 'Formatos válidos: SIN vs CON con X rojas y checks verdes, mitos vs verdades, "X fallas que detecta", explicación con íconos didácticos. SIEMPRE con componente de enseñanza o comparación con la alternativa.',
    evitar: 'CRÍTICO: NO confundir con Beneficios. Si solo enumeras ventajas con íconos sin comparar ni explicar el porqué → ES BENEFICIOS, no Infográfico. Infográfico SIEMPRE confronta o educa.',
    reglaTextoEnPieza: 'EXACTAMENTE 3 o 4 puntos comparativos o didácticos. Máximo 6 palabras cada punto. Formato preferido: SIN/CON con X y check, o "X cosas que detecta", o mitos vs verdades. AQUÍ SÍ van viñetas cortas.'
  },
  'Beneficios': {
    color: '#059669',
    esencia: 'ENUMERAR ganancias del producto. Lista positiva sin contraste.',
    composicion: 'Producto en lifestyle o sobre fondo limpio + 3-4 íconos circulares con frases cortas de ganancia ("Hidratación profunda", "Mejora elasticidad", "Llama regulable"). Tono optimista directo, sin oposición.',
    evitar: 'CRÍTICO: NO confundir con Infográfico. Si introduces SIN/CON, mitos, datos comparativos o explicación didáctica → ES INFOGRÁFICO, no Beneficios. Beneficios SOLO lista qué obtiene el cliente.',
    reglaTextoEnPieza: 'EXACTAMENTE 3 o 4 frases ultra-cortas tipo etiqueta de ícono. Máximo 4 palabras cada una. Tono optimista directo. AQUÍ SÍ van viñetas pero cortísimas (NO frases completas).'
  },
  'Testimonial': {
    color: '#dc2626',
    esencia: 'Cliente real validando con su experiencia.',
    composicion: 'Card blanca con la reseña encima de imagen lifestyle del producto. 5 estrellas doradas, nombre + ciudad del cliente. Texto en primera persona con lenguaje natural y coloquial del cliente común. Imagen del producto en uso real abajo o de fondo.',
    evitar: 'NO usar voz de experto ni del productor. La voz es del cliente común. NO escribir como copy publicitario.',
    reglaTextoEnPieza: 'Reseña en primera persona del cliente, entre 40 y 60 palabras, tono natural y coloquial (no copy publicitario). Al final: nombre del cliente y ciudad. NO uses viñetas ni listas. Texto corrido.'
  },
  'Respuesta a Comentario': {
    color: '#0e6a98',
    esencia: 'Un experto del área o el productor responde una duda real.',
    composicion: 'Overlay con burbuja tipo comentario de Instagram/Facebook con la pregunta o duda real del avatar (texto corto, con avatar genérico de usuario) + persona experta del área o productor del producto respondiendo visualmente o con texto corto al lado/debajo. Híbrido autoridad + cercanía.',
    evitar: 'NO es testimonial de cliente. Aquí responde un experto o el productor, no el comprador. La voz es de autoridad amable, no de venta directa.',
    reglaTextoEnPieza: 'EXACTAMENTE 2 bloques:\n1) Comentario simulado del avatar entre 15 y 25 palabras.\n2) Respuesta del experto o productor entre 15 y 25 palabras.\nNO uses viñetas. Tono autoridad amable.'
  }
}

module.exports = { DOCTRINA_TIPOS_IMAGEN }
