import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'

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

    // ── LLAMADA ÚNICA — 3 hooks + idea visual simple ─────────────
    const prompt = `Eres experto en publicidad de Meta Ads. Te doy un análisis ESTRATÉGICO YA CONFIRMADO por el usuario y un cuerpo de guion. Tu tarea es generar 3 HOOKS ALTERNATIVOS + IDEA VISUAL SIMPLE para cada uno.

ANÁLISIS CONFIRMADO (úsalo como autoridad, NO lo cuestiones):
${JSON.stringify(analisis)}

CUERPO DEL GUION:
${cuerpoTxt}

HOOK ORIGINAL (referencia, no copies):
${hookOrig}

REQUISITOS DE LOS HOOKS:
- Mantén MISMO motivo "${motivo}", ÁNGULO "${angulo}", NIVEL "${nivel}".
- Si nivel es 1 o 2: NO menciones producto, marca, mecanismo. Foco en dolor/curiosidad.
- Si nivel es 3, 4 o 5: puedes mencionar el producto/solución.
- Cada hook con DIFERENTE entrada estratégica (problema, curiosidad, dato, prueba social).
- ${esVideo ? '≤15 palabras (es video)' : '≤7 palabras (es imagen)'}.
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

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      return res.status(502).json({ error: 'No se pudieron interpretar los hooks generados: ' + e.message })
    }
    const hooks = Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 3).map(h => ({
      texto: (h.texto || '').toString(),
      ideaVisual: (h.ideaVisual || '').toString(),
      guionCompleto: (h.guionCompleto || ((h.texto || '') + '\n\n' + cuerpoTxt)).toString(),
      advertenciaMeta: (h.advertenciaMeta || 'Cumple políticas').toString()
    })) : []
    if (hooks.length === 0) {
      return res.status(502).json({ error: 'El modelo no devolvió hooks alternativos' })
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
          m1Hooks: hooks
        }
      })
    } catch (e) {
      console.error('Auto-save Método 1 (generación) falló:', e)
    }

    return res.status(200).json({ hooks, costoOperacion, anuncioId: idAnuncio })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
