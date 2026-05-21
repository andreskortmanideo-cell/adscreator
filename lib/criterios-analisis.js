export const CRITERIOS_MOTIVOS = `
DOCTRINA DE IDENTIFICACIÓN DE MOTIVOS (5 opciones únicas):

EMOCIONAL:
- Narrativa en primera persona con emociones explícitas, vulnerabilidad.
- SEÑALES: "yo sentía", "me dolía", "tenía miedo", "no sabía qué hacer", "lloraba".
- Tono confesional, íntimo, conexión emocional avatar-espectador.

FUNCIONAL:
- Muestra CÓMO funciona el producto, demostración, evidencia visible.
- SEÑALES: "mira cómo", "en X minutos", "el resultado es", "presiono y", "funciona así".
- Tono demostrativo, directo, confiable.

EDUCATIVO:
- Enseña, explica el porqué, da contexto.
- SEÑALES: "¿sabías que?", "esto pasa porque", "resulta que", "el motivo es".
- Tono didáctico, paciente.

ASPIRACIONAL:
- Vida deseada, identidad transformada, lifestyle.
- SEÑALES: "imagina", "conviértete", "vive como", "tu mejor versión", "merece".
- Tono inspirador, motivacional.

RACIONAL:
- Lista beneficios, método estructurado, comparativas lógicas.
- SEÑALES: "1, 2, 3", "primero", "segundo", "los beneficios son", "vs", "menos de".
- Tono organizado, sin emoción.

REGLA DE DESEMPATE:
1. Si tiene narrativa personal con emociones → Emocional.
2. Si demuestra cómo funciona en vivo → Funcional.
3. Si explica el porqué del problema/solución → Educativo.
4. Si vende identidad/lifestyle → Aspiracional.
5. Si lista metódicamente → Racional.
SIEMPRE elige UNO. Si dudas entre dos, escoge el más prominente.
`;

export const CRITERIOS_ANGULOS = `
DOCTRINA DE IDENTIFICACIÓN DE ÁNGULOS DE VENTA (16 opciones únicas):

Problema/Dolor: NOMBRA el dolor concreto del avatar. Señales: "si llegas con", "el dolor de", "esa sensación de".
Beneficio/Resultado: muestra resultado YA LOGRADO. Señales: "ahora puedo", "en X días logré", "el resultado fue".
Curiosidad: intriga, dato, pregunta. Señales: "¿sabías?", "el error que", "lo que no te dicen".
Urgencia/Escasez: tiempo/stock limitado. Señales: "última semana", "solo X unidades".
Autoridad/Prueba Social: cifras/expertos. Señales: "X personas", "los expertos recomiendan", "estudios".
Novedad: descubrimiento reciente. Señales: "el primero", "lo nuevo", "acaba de llegar".
Comparación/Contraste: vieja vs nueva. Señales: "antes vs ahora", "lo tradicional vs".
Enemigo en Común: villano externo. Señales: "la industria", "te hicieron creer", "lo que no quieren".
Historia: narrativa con protagonista. Señales: "hace X meses", "mi tía", "un día".
Transformación: antes/después medible. Señales: "de X a Y", "pasé de", "perdí/gané".
FOMO: otros ya cambiaron. Señales: "mientras dudas", "ya cambiaron", "todos están usando".
Simplicidad: fácil. Señales: "sin contar", "solo 3 pasos", "fácil de usar".
Ironía/Provocación: contra creencia común. Señales: "hacer X te perjudica", "no es lo que crees".
Precio/Valor: inversión enmarcada. Señales: "menos que un café", "vale lo de".
Exclusividad: filtro de público. Señales: "no es para todos", "solo si tú".
Aspiracional: identidad. Señales: "conviértete en", "merece", "tu mejor versión".

REGLA DE DESEMPATE:
- Si hay múltiples señales, prioriza la que más se REPITE en el guion.
- Si el guion abre con problema → Problema/Dolor.
- Si abre con resultado logrado → Beneficio/Resultado.
- Si abre con pregunta/dato → Curiosidad.
SIEMPRE elige UNO.
`;

export const CRITERIOS_NIVELES = `
DOCTRINA DE NIVELES DE CONSCIENCIA SCHWARTZ (1-5):

NIVEL 1 (Inconsciente del problema):
- NO menciona producto, marca, mecanismo, ingredientes, solución.
- Solo describe síntomas que el avatar normaliza.
- CTA: "Aprende qué pasa", "Mira por qué".
- Hook típico: "¿Sabías que la mayoría normaliza esto?".

NIVEL 2 (Consciente del problema, NO de la solución):
- NO menciona producto. NO insinúa que existe solución.
- Valida el dolor con detalle. Educa sobre el porqué.
- CTA: "Entiende qué hay detrás".
- Hook típico: "Si llegas con X, no eres el único".

NIVEL 3 (Consciente de la solución, NO del producto):
- SÍ menciona producto/categoría como descubrimiento natural.
- Frases tipo "compré esto", "descubrí algo", "encontré que".
- Hook típico: "Una forma diferente de resolver X".
- CTA: "Conoce más".

NIVEL 4 (Consciente del producto, evaluando):
- Compara con alternativas, da beneficios, prueba social.
- Frases tipo "es mejor que", "a diferencia de", "X usuarios".
- Hook típico: "Lo que diferencia a X".
- CTA: "Pruébalo".

NIVEL 5 (Totalmente consciente):
- Oferta, urgencia, escasez, precio.
- Frases tipo "última semana", "X% off", "compra ahora".
- CTA: Compra directa.

REGLA DECISIVA (CRÍTICA):
- Frase tipo "compré/descubrí/uso esto" → mínimo NIVEL 3.
- Mencion explícita de producto o marca → mínimo NIVEL 3.
- Solo problema sin solución → NIVEL 1 o 2.
- Compara productos → NIVEL 4.
- Habla de oferta/precio/urgencia → NIVEL 5.

CASOS COMUNES:
- "Mira cómo limpio mi motor con esto" → Nivel 3 (menciona uso del producto).
- "Si llegas cansado todos los días" → Nivel 2 (problema, sin solución).
- "El error que cometes al limpiar" → Nivel 1 o 2 (no producto).
- "Esta pulverizadora es mejor que las tradicionales" → Nivel 4 (comparación).
`;
