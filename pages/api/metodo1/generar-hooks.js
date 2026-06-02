import { crearAnuncio, agregarVersion } from '../../../lib/historial-db'
import { crearCostoOperacion, parseJsonTolerante, llamarModelo } from '../../../lib/metodo1-llm'
import { HOOKS_JEFE } from '../../../data/hooks-jefe'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

// ════════════════════════════════════════
// VALIDADORES DETERMINÍSTICOS (no LLM)
// ════════════════════════════════════════

const PALABRAS_COMUNES = new Set([
  'pero', 'para', 'como', 'cuando', 'donde', 'porque', 'desde', 'hasta',
  'cada', 'todo', 'todos', 'todas', 'esto', 'eso', 'esta', 'este', 'estos',
  'estas', 'algo', 'nada', 'mucho', 'muchos', 'muchas', 'poco', 'pocos',
  'que', 'con', 'sin', 'por', 'una', 'uno', 'unos', 'unas', 'ese',
  'mas', 'menos', 'tambien', 'aqui', 'alli', 'ahi', 'siempre', 'nunca',
  'antes', 'ahora', 'despues', 'mientras', 'tener', 'haber', 'estar',
  'hacer', 'poder', 'querer', 'saber', 'decir', 'venir', 'salir',
  'dejar', 'pasar', 'sentir', 'mira', 'observa', 'fijate'
])

const TERMINACIONES_MALAS = new Set([
  'de','del','a','la','el','los','las','en','con','un','una','y','o',
  'pero','que','para','por','sobre','sin','si','no','su','sus','mi','mis','tu','tus'
])

const ANGULOS_DISPONIBLES = ['Transformación','Problema/Dolor','FOMO','Beneficio/Resultado','Aspiracional','Enemigo en Común','Ironía/Provocación','Urgencia/Escasez','Exclusividad','Autoridad/Prueba Social','Comparación/Contraste','Precio/Valor','Curiosidad','Novedad','Historia','Simplicidad']

const DEFINICIONES_ANGULOS = {
  'Transformación': 'el antes vs después, el cambio logrado',
  'Problema/Dolor': 'el sufrimiento que resuelve',
  'FOMO': 'otros ya lo tienen, te quedas atrás',
  'Beneficio/Resultado': 'el resultado concreto que entrega',
  'Aspiracional': 'la vida o identidad deseada',
  'Enemigo en Común': 'contra el método viejo o la industria',
  'Ironía/Provocación': 'desafío o humor punzante',
  'Urgencia/Escasez': 'tiempo o stock limitado',
  'Exclusividad': 'solo para pocos, acceso especial',
  'Autoridad/Prueba Social': 'expertos o muchos lo usan',
  'Comparación/Contraste': 'comparado con la alternativa',
  'Precio/Valor': 'lo que ahorras o lo que vale',
  'Curiosidad': 'intriga, gap de información',
  'Novedad': 'lo nuevo, lo que no conocías',
  'Historia': 'narrativa personal, anécdota',
  'Simplicidad': 'lo fácil que es'
}

function extraerPalabrasClave(cuerpo, analisis) {
  const palabras = (cuerpo || '').toLowerCase()
    .replace(/[.,!?¿¡:;()"']/g, ' ')
    .split(/\s+/)
    .filter(p => p.length >= 4 && !PALABRAS_COMUNES.has(p))
  const extras = []
  if (analisis?.producto) extras.push(...analisis.producto.toLowerCase().split(/\s+/).filter(p => p.length >= 4))
  if (analisis?.avatar) extras.push(...analisis.avatar.toLowerCase().split(/\s+/).filter(p => p.length >= 4))
  return new Set([...palabras, ...extras])
}

function validarHook(hook, cuerpoTxt, analisis) {
  if (!hook?.texto) return { valido: false, razon: 'sin texto' }

  const texto = hook.texto.trim()
  const palabras = texto.split(/\s+/)

  // 1. Longitud 5-9
  if (palabras.length < 5) return { valido: false, razon: `muy corto (${palabras.length} palabras)` }
  if (palabras.length > 9) return { valido: false, razon: `muy largo (${palabras.length} palabras)` }

  // 2. Termina en palabra fuerte
  const ultima = palabras[palabras.length - 1].toLowerCase().replace(/[.!?¿¡,;:]+$/, '')
  if (TERMINACIONES_MALAS.has(ultima)) return { valido: false, razon: 'termina en preposición/conjunción' }

  // 3. NO empieza con palabra vaga
  const primera = palabras[0].toLowerCase().replace(/[¿¡(]/g, '')
  const palabrasVagasInicio = new Set(['esto', 'eso', 'aquello', 'algo'])
  if (palabrasVagasInicio.has(primera)) {
    return { valido: false, razon: `empieza con palabra vaga ("${palabras[0]}")` }
  }

  // 4. NO empieza con arranque tibio (regex porque puede ser frase de 2-3 palabras)
  const arranquesTibios = [
    /^¿?cómo\s/i,
    /^¿?como\s/i,
    /^(tres|cinco|siete)\s+(formas|maneras|trucos|consejos)\s/i,
    /^\d+\s+(formas|maneras|trucos|consejos|razones|cosas)\s/i,
    /^combate\s/i,
    /^descubre\s/i,
    /^conoce\s/i,
    /^aprende\s/i,
    /^observa\s+(cómo|como)\s/i,
    /^mira\s+(cómo|como)\s/i,
    /^la\s+asombrosa\s/i,
    /^la\s+increíble\s/i
  ]
  for (const rgx of arranquesTibios) {
    if (rgx.test(texto)) {
      return { valido: false, razon: `arranque tibio: "${texto.split(/\s+/).slice(0, 3).join(' ')}..."` }
    }
  }

  // 5. Pregunta debe cerrar con ?
  const tieneAperturaPregunta = texto.startsWith('¿')
  const tieneCierrePregunta = texto.endsWith('?')
  if (tieneAperturaPregunta && !tieneCierrePregunta) {
    return { valido: false, razon: 'pregunta sin signo de cierre "?"' }
  }

  // 6. Contiene palabra clave del cuerpo
  const palabrasClave = extraerPalabrasClave(cuerpoTxt, analisis)
  const tieneClave = palabras.some(p => {
    const pl = p.toLowerCase().replace(/[.,!?¿¡:;()"']/g, '')
    for (const clave of palabrasClave) {
      if (pl.includes(clave.substring(0, 5)) || clave.includes(pl.substring(0, 5))) return true
    }
    return false
  })
  if (!tieneClave) return { valido: false, razon: 'sin palabra clave del cuerpo' }

  return { valido: true }
}

// ════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { anuncioId, analisisConfirmado, hookOriginal, cuerpo, modelo, autor, correccionUsuario } = req.body || {}
    const analisis = analisisConfirmado || {}
    const cuerpoTxt = (cuerpo || '').toString().trim()
    const hookOrig = (hookOriginal || '').toString().trim()
    if (!cuerpoTxt) return res.status(400).json({ error: 'cuerpo requerido' })

    const modeloSel = (modelo || 'claude-haiku-4-5').toString()
    const motivo = (analisis.motivo || '').toString()
    const angulo = (analisis.angulo || '').toString()
    const nivel = analisis.nivel != null ? String(analisis.nivel) : ''

    const angulosHooks = Array.isArray(req.body?.angulosHooks) && req.body.angulosHooks.length === 3
      ? req.body.angulosHooks
      : null

    // Fallback si no llegan ángulos: usar el del análisis + 2 complementarios
    let angulosFinales = angulosHooks
    if (!angulosFinales) {
      const principal = angulo || 'Transformación'
      const complementarios = ANGULOS_DISPONIBLES.filter(a => a !== principal)
      angulosFinales = [principal, complementarios[0], complementarios[1]]
    }

    const { costoOperacion, registrarLlamada } = crearCostoOperacion(modeloSel)

    // ── Pool de plantillas del jefe ───────
    const textoDeHook = h => typeof h === 'string' ? h : (h.texto || h.plantilla || h.hook || '')

    // Arranques tibios a evitar (filtrar de plantillas)
    const arranquesTibios = [
      /^cómo\s/i, /^como\s/i, /^maneras\s/i, /^formas\s/i,
      /^# (consejos|maneras|formas|trucos|ideas|cosas)/i,
      /^# pasos para/i, /^# razones por las que/i,
      /^combate/i, /^descubre/i, /^conoce/i
    ]

    const plantillasUsables = HOOKS_JEFE
      .filter(h => {
        const t = textoDeHook(h).trim()
        const palabras = t.split(/\s+/).length
        return palabras >= 3 && palabras <= 9
      })
      .filter(h => {
        const t = textoDeHook(h).trim().toLowerCase()
        return !arranquesTibios.some(rgx => rgx.test(t))
      })

    // Tomar 30 plantillas aleatorias (menos = LLM más enfocado)
    const muestra = plantillasUsables
      .sort(() => 0.5 - Math.random())
      .slice(0, 30)

    const plantillasNumeradas = muestra.map((h, i) => `${i + 1}. ${textoDeHook(h)}`).join('\n')

    // ── PROMPT SIMPLIFICADO ───────
    let prompt = `Eres experto en publicidad de Meta Ads. Genera 3 HOOKS alternativos para Variar Hook.

ANÁLISIS CONFIRMADO:
- Nivel: ${nivel}
- Motivo: ${motivo}
- Ángulo: ${angulo}
- Producto: ${analisis.producto || 'sin especificar'}
- Avatar: ${analisis.avatar || 'sin especificar'}

CUERPO QUE SE CONSERVA INTACTO (no lo modificas):
${cuerpoTxt}

HOOK ORIGINAL (referencia, NO copies):
${hookOrig}

PLANTILLAS DEL JEFE (elige 3 DISTINTAS):
${plantillasNumeradas}

═══ ÁNGULO ASIGNADO A CADA HOOK (OBLIGATORIO) ═══
Cada hook debe atacar el producto desde UN ángulo de venta DIFERENTE. Esto es CRÍTICO: los 3 hooks se convertirán en 3 videos distintos para testear. Si los 3 dicen lo mismo, no sirven.

- HOOK 1 → ángulo "${angulosFinales[0]}" (${DEFINICIONES_ANGULOS[angulosFinales[0]] || ''})
- HOOK 2 → ángulo "${angulosFinales[1]}" (${DEFINICIONES_ANGULOS[angulosFinales[1]] || ''})
- HOOK 3 → ángulo "${angulosFinales[2]}" (${DEFINICIONES_ANGULOS[angulosFinales[2]] || ''})

Cada hook debe sentirse claramente distinto de los otros 2 porque ataca una dimensión diferente del mismo producto. NO repitas la misma idea con sinónimos.

EJEMPLO (producto: pulverizadora):
- Hook ángulo Problema/Dolor: "Mi espalda no aguantaba otra jornada"
- Hook ángulo Transformación: "Tres horas raspando, ahora cinco minutos"
- Hook ángulo Autoridad/Prueba Social: "Los talleres serios ya pasaron a esto"
(Los 3 hablan de la pulverizadora pero atacan cosas distintas: dolor, cambio, prestigio)

═══ REGLAS ═══

1. ELIGE 3 plantillas DISTINTAS y RELLENA los placeholders:
   - "___" se reemplaza con palabras concretas del cuerpo, producto o avatar
   - "#" se reemplaza con número (3, 5, 7 típicamente)
   - NO uses "esto", "eso", "algo" como relleno

2. CADA HOOK debe cumplir:
   - 5-9 palabras (NO más)
   - Una sola línea sin puntos suspensivos
   - Termina en palabra fuerte (sustantivo/verbo/adjetivo), nunca en preposición
   - Contiene AL MENOS 1 palabra extraída del cuerpo (rozaduras, motor, espalda, etc.)
   - NO contradice lo que afirma el cuerpo

3. SI nivel es 1 o 2: NO menciones producto/marca. SI nivel 3-5: puedes mencionarlo.

4. CONEXIÓN HOOK-CUERPO:
   - Lee la primera frase del cuerpo arriba.
   - Si tu hook + esa primera frase fluyen naturales → transicion: ""
   - Si hay quiebre o el cuerpo arranca con preposición ("Con", "En", "Por") → transicion: 1-3 palabras puente ("Mira.", "Te explico.", "Por eso.")

5. EVITAR arranques tibios:
   ❌ "Cómo evitar...", "Tres formas de...", "Combate la...", "Descubre cómo..."
   ❌ Adjetivos publicitarios: "asombroso", "increíble", "tremendo", "maravilloso"
   ✅ Dolor primera persona: "No aguantaba...", "Pasaba años..."
   ✅ Provocación: "Deja de...", "No raspes otro..."
   ✅ Cifra dura: "Tres horas a veinte minutos..."
   ✅ Pregunta con tensión: "¿Cuántas horas pierdes...?"

═══ OUTPUT ═══

DEVUELVE SOLO JSON (sin texto antes ni después, sin markdown, sin comentarios):

{
  "hooks": [
    {
      "plantillaUsada": "<número de plantilla 1-30>",
      "plantillaOriginal": "<texto exacto de la plantilla>",
      "anguloUsado": "<el ángulo asignado a este hook: hook 1 = '${angulosFinales[0]}', hook 2 = '${angulosFinales[1]}', hook 3 = '${angulosFinales[2]}'>",
      "texto": "<hook 5-9 palabras>",
      "transicion": "<vacía o 1-3 palabras>",
      "ideaVisual": "<escena scroll-stopping con drama/conflicto/contraste en 1-2 frases>",
      "guionCompleto": "<hook + (transicion si existe) + cuerpo conservado>",
      "advertenciaMeta": "Cumple políticas"
    }
  ]
}

EXACTAMENTE 3 hooks. Plantillas distintas. Cada hook con SU ángulo asignado.`

    if (correccionUsuario && correccionUsuario.toString().trim()) {
      prompt += '\n\nCORRECCIÓN DEL USUARIO: ' + correccionUsuario.toString().trim()
    }

    // ── LLAMADA 1 ───────
    const r = await llamarModelo(modeloSel, prompt, 2000)
    registrarLlamada('metodo1-generacion', r.inputTokens, r.outputTokens)

    const mapHook = (h, i) => {
      const hookTexto = (h.texto || '').toString()
      const transicion = (h.transicion || '').toString().trim()
      const transicionFinal = transicion && transicion.split(/\s+/).length <= 3 ? transicion : ''
      const guionUnido = h.guionCompleto
        ? h.guionCompleto.toString()
        : (hookTexto + (transicionFinal ? ' ' + transicionFinal : '') + '\n\n' + cuerpoTxt)
      const anguloAsignado = angulosFinales[i] || ''
      const anguloUsado = (h.anguloUsado || anguloAsignado).toString()
      return {
        plantillaUsada: (h.plantillaUsada != null ? h.plantillaUsada : '').toString(),
        plantillaOriginal: (h.plantillaOriginal || '').toString(),
        anguloUsado,
        texto: hookTexto,
        transicion: transicionFinal,
        ideaVisual: (h.ideaVisual || '').toString(),
        guionCompleto: guionUnido,
        advertenciaMeta: (h.advertenciaMeta || 'Cumple políticas').toString()
      }
    }

    let parsed
    try {
      parsed = parseJsonTolerante(r.texto)
    } catch (e) {
      console.error('[M1] JSON malformado intento 1:', e.message)
      return res.status(502).json({ error: 'No se pudieron interpretar los hooks: ' + e.message })
    }

    let hooks = Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 3).map(mapHook) : []
    if (hooks.length === 0) return res.status(502).json({ error: 'El modelo no devolvió hooks' })

    // ── VALIDACIÓN ───────
    let resultadosValidacion = hooks.map(h => validarHook(h, cuerpoTxt, analisis))
    let hooksValidos = hooks.filter((_, i) => resultadosValidacion[i].valido)

    console.log('[M1] Intento 1:', hooks.length, 'hooks. Válidos:', hooksValidos.length)
    resultadosValidacion.forEach((v, i) => {
      if (!v.valido) console.log(`[M1]   Hook ${i+1} INVÁLIDO: ${v.razon}`)
    })

    // ── REINTENTO ÚNICO si hay <3 válidos ───────
    if (hooksValidos.length < 3) {
      console.log('[M1] Reintentando con prompt reforzado...')
      try {
        const razones = resultadosValidacion
          .filter(v => !v.valido)
          .map(v => v.razon)
          .join(', ')

        const promptReintento = prompt + `\n\n═══ CORRECCIÓN OBLIGATORIA ═══\nTU INTENTO ANTERIOR FALLÓ: ${razones}. Genera los 3 hooks corrigiendo esos errores. Cumple TODAS las reglas estrictamente.`

        const r2 = await llamarModelo(modeloSel, promptReintento, 2000)
        registrarLlamada('metodo1-reintento', r2.inputTokens, r2.outputTokens)
        const parsed2 = parseJsonTolerante(r2.texto)
        const hooks2 = Array.isArray(parsed2.hooks) ? parsed2.hooks.slice(0, 3).map(mapHook) : []

        if (hooks2.length > 0) {
          const validacion2 = hooks2.map(h => validarHook(h, cuerpoTxt, analisis))
          const validos2 = hooks2.filter((_, i) => validacion2[i].valido)

          console.log('[M1] Reintento:', hooks2.length, 'hooks. Válidos:', validos2.length)

          // Si el reintento mejora, usarlo
          if (validos2.length > hooksValidos.length) {
            hooks = hooks2
            hooksValidos = validos2
          }
        }
      } catch (e) {
        console.error('[M1] Reintento falló:', e.message)
      }
    }

    // Devolver hooks (válidos si los hay, sino todos los originales)
    const hooksDevolver = hooksValidos.length > 0 ? hooks : hooks

    // ── AUTO-SAVE ───────
    let idAnuncio = anuncioId ? Number(anuncioId) : null
    try {
      if (!idAnuncio) {
        idAnuncio = crearAnuncio({
          autor: (autor || '').toString().trim() || 'Anónimo',
          producto: (analisis.producto || ('Variar Hook — ' + hookOrig)).toString().slice(0, 200),
          avatar: (analisis.avatar || '').toString().slice(0, 300),
          formato: (analisis.formato || '').toString(),
          duracion: (analisis.duracion || '').toString(),
          nivel, motivo, angulo,
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
          modo: 'metodo1', m1Paso: 3,
          m1Analisis: analisis,
          m1HookOriginal: hookOrig,
          m1Cuerpo: cuerpoTxt,
          m1Hooks: hooksDevolver
        }
      })
    } catch (e) {
      console.error('Auto-save M1 falló:', e)
    }

    return res.status(200).json({ hooks: hooksDevolver, costoOperacion, anuncioId: idAnuncio })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
