const fs = require('fs');
const path = require('path');

const CONFIG = {
  baseUrl: 'http://51.83.129.63/ads/api',
  producto: {
    nombre: 'Pulverizadora de Alta Presión',
    descripcion: 'Pulverizadora conectable a compresor de aire. Limpia motores, herramientas, superficies. Manguera de 1.5m, alcance de 40cm, válvula ajustable. Producto para mecánicos y talleres en Colombia.',
    mercado: 'Colombia',
    avatar: 'Mecánico/dueño de taller, 30-55 años, hombres, pierde tiempo limpiando motores manualmente'
  },
  crearCombinaciones: {
    niveles: [2, 3, 4],
    motivos: ['Emocional', 'Funcional', 'Aspiracional'],
    angulos: ['Beneficio/Resultado', 'Problema/Dolor', 'Transformación', 'FOMO']
  },
  formato: 'video',
  duracion: 30,
  modelo: 'claude-haiku-4-5-20251001',
  esperaMs: 2000
};

const GUIONES_PRUEBA = {
  guion1: 'Conseguí esta pulverizadora y mi taller cambió. Yo pasaba tres horas raspando grasa con cepillo, espalda destrozada. Mira cómo la uso: conecto al compresor, presiono el gatillo y la suciedad sale en segundos. Limpio motores sin esfuerzo. Ahora termino en veinte minutos lo que me tomaba tres horas. Mi taller se ve impecable. Esto es lo que finalmente encontré que funcionaba.',
  guion2: 'Cada motor sucio me robaba horas. Hasta que probé esta pulverizadora de alta presión. La conecto al compresor que ya tenía, ajusto la válvula y aprieto. Cuarenta centímetros de alcance llegan donde nada llega. La manguera de metro y medio me deja moverme libre. Recuperé dos horas diarias. Vale la pena conocerla.',
  m2_hookSource: 'Esta pulverizadora me salvó tres horas al día. Mira cómo funciona.',
  m2_cuerpoSource: 'Compré esta herramienta porque ya no aguantaba. Yo pasaba horas raspando grasa con cepillos, sin resultado. La presión hace todo el trabajo. Cuarenta centímetros de alcance llegan a rincones imposibles. Recuperé tiempo y mi espalda agradece. Vale la pena.'
};

const resultados = [];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function guardarCSV() {
  const carpeta = path.join(__dirname, 'resultados');
  if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
  const fecha = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const ruta = path.join(carpeta, `test-${fecha}.csv`);
  if (resultados.length === 0) return;
  const headers = Object.keys(resultados[0]).join(',');
  const filas = resultados.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(','));
  fs.writeFileSync(ruta, [headers, ...filas].join('\n'), 'utf8');
}

function extraerPuntaje(texto) {
  const match = texto.match(/PUNTAJE\s*GLOBAL\s*:\s*(\d+)\s*\/\s*100/i) || texto.match(/(\d+)\s*\/\s*100/);
  return match ? parseInt(match[1]) : 0;
}

async function llamarApi(endpoint, body, timeoutMs = 90000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status} en ${endpoint}: ${errorText.substring(0, 200)}`);
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

// Auditoría usa /api/generate con modo 'auditar' — el contenido va embebido en messages[0].content
async function auditar(version, params, modo) {
  const contenido = `Anuncio a auditar (modo ${modo}):
NIVEL DECLARADO: ${params.nivel || 'no aplica'}
MOTIVO DECLARADO: ${params.motivo || 'no aplica'}
ANGULO DECLARADO: ${params.angulo || 'no aplica'}
FORMATO: video

HOOK: ${version.hook || version.texto || ''}
GUION: ${version.guionCompleto || version.guion || ''}`;

  const r = await llamarApi('/generate', {
    messages: [{ role: 'user', content: contenido }],
    modo: 'auditar',
    apiProvider: 'anthropic',
    modelo: CONFIG.modelo,
    formato: 'video'
  });
  return r.content?.[0]?.text || '';
}

// ============ MODO CREAR DESDE 0 ============
// IMPORTANTE: usa modo:'generar' (NO 'analizar') y los parámetros van EMBEBIDOS en messages[0].content
async function testCrearDesde0() {
  console.log('\n🎬 === MODO CREAR DESDE 0 ===');
  const niveles = CONFIG.crearCombinaciones.niveles;
  const motivos = CONFIG.crearCombinaciones.motivos;
  const angulos = CONFIG.crearCombinaciones.angulos;
  const total = niveles.length * motivos.length * angulos.length;
  let contador = 0;

  for (const nivel of niveles) {
    for (const motivo of motivos) {
      for (const angulo of angulos) {
        contador++;
        console.log(`\n[${contador}/${total}] CREAR: N${nivel} | ${motivo} | ${angulo}`);

        try {
          // Construir prompt EMBEBIDO según formato real del endpoint
          const contenidoGen = `PRODUCTO: ${CONFIG.producto.nombre}
DESCRIPCIÓN: ${CONFIG.producto.descripcion}
MERCADO: ${CONFIG.producto.mercado}
AVATAR: ${CONFIG.producto.avatar}
TIPO: ${motivo}
NIVEL: ${nivel}
ANGULO_VENTA: ${angulo}
FORMATO: ${CONFIG.formato}
DURACIÓN: ${CONFIG.duracion}

Genera 2 versiones del anuncio respetando nivel, motivo y ángulo declarados.`;

          const generado = await llamarApi('/generate', {
            messages: [{ role: 'user', content: contenidoGen }],
            modo: 'generar',
            apiProvider: 'anthropic',
            modelo: CONFIG.modelo
          });

          const texto = generado.content?.[0]?.text || '';

          // El output es texto plano. Parsearemos de forma flexible.
          const versiones = parsearVersionesTextoPlano(texto);

          for (let i = 0; i < versiones.length; i++) {
            const v = versiones[i];
            const aud = await auditar(v, { nivel, motivo, angulo }, 'crear');
            const puntaje = extraerPuntaje(aud);
            console.log(`  V${i+1}: ${puntaje}/100 | "${(v.hook||'').substring(0,60)}"`);
            resultados.push({
              modo: 'CREAR', n: contador, nivel, motivo, angulo,
              version: i + 1,
              hook: (v.hook || '').substring(0, 200),
              guion: (v.guionCompleto || '').substring(0, 300),
              puntaje, error: ''
            });
          }
          guardarCSV();
          await sleep(CONFIG.esperaMs);
        } catch (e) {
          console.error(`  ❌ ${e.message}`);
          resultados.push({ modo: 'CREAR', n: contador, nivel, motivo, angulo, version: 0, hook: '', guion: '', puntaje: 0, error: e.message.substring(0, 200) });
        }
      }
    }
  }
}

function parsearVersionesTextoPlano(texto) {
  // Heurística: divide por "VERSIÓN" o "Versión" y extrae hook (primera frase) + guión
  const bloques = texto.split(/VERSI[OÓ]N\s*\d+/gi).filter(b => b.trim().length > 50);
  if (bloques.length === 0) return [{ hook: texto.substring(0, 100), guionCompleto: texto }];
  return bloques.slice(0, 2).map(b => {
    const limpio = b.trim();
    const primeraFrase = (limpio.match(/^[^.!?]+[.!?]/) || [''])[0].trim();
    return { hook: primeraFrase, guionCompleto: limpio };
  });
}

// ============ MODO M1 - VARIAR HOOK ============
async function testM1() {
  console.log('\n🔍 === MODO M1 - VARIAR HOOK ===');
  const guiones = [GUIONES_PRUEBA.guion1, GUIONES_PRUEBA.guion2];

  for (let i = 0; i < guiones.length; i++) {
    console.log(`\n[M1 ${i+1}/${guiones.length}]`);
    try {
      const analisis = await llamarApi('/metodo1/analizar', {
        guionCompleto: guiones[i],
        contextoAdicional: '',
        modelo: CONFIG.modelo,
        autor: 'TestScript'
      });
      console.log(`  Análisis: N${analisis.analisis?.nivel} | ${analisis.analisis?.motivo} | ${analisis.analisis?.angulo}`);

      const hooks = await llamarApi('/metodo1/generar-hooks', {
        anuncioId: analisis.anuncioId,
        analisisConfirmado: analisis.analisis,
        hookOriginal: analisis.hookOriginal,
        cuerpo: analisis.cuerpo,
        modelo: CONFIG.modelo,
        autor: 'TestScript'
      });

      for (let h = 0; h < (hooks.hooks || []).length; h++) {
        const hook = hooks.hooks[h];
        const aud = await auditar({ hook: hook.texto, guionCompleto: hook.guionCompleto }, analisis.analisis, 'M1');
        const puntaje = extraerPuntaje(aud);
        console.log(`  Hook ${h+1}: ${puntaje}/100 | "${(hook.texto||'').substring(0,60)}"`);
        resultados.push({
          modo: 'M1', n: i + 1,
          nivel: analisis.analisis?.nivel, motivo: analisis.analisis?.motivo, angulo: analisis.analisis?.angulo,
          version: h + 1,
          hook: (hook.texto || '').substring(0, 200),
          guion: (hook.guionCompleto || '').substring(0, 300),
          puntaje, error: ''
        });
      }
      guardarCSV();
      await sleep(CONFIG.esperaMs);
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
      resultados.push({ modo: 'M1', n: i+1, nivel: '', motivo: '', angulo: '', version: 0, hook: '', guion: '', puntaje: 0, error: e.message.substring(0, 200) });
    }
  }
}

// ============ MODO M2 - FUSIÓN ============
async function testM2() {
  console.log('\n🔗 === MODO M2 - FUSIÓN ===');
  try {
    const analisis = await llamarApi('/metodo2/analizar', {
      textoConHook: GUIONES_PRUEBA.m2_hookSource,
      textoConCuerpo: GUIONES_PRUEBA.m2_cuerpoSource,
      contextoAdicional: '',
      modelo: CONFIG.modelo,
      autor: 'TestScript'
    });

    const fusion = await llamarApi('/metodo2/fusionar', {
      anuncioId: analisis.anuncioId,
      hookConfirmado: analisis.hookExtraido,
      cuerpoConfirmado: analisis.cuerpoExtraido,
      analisisCompatibilidad: analisis.compatibilidad,
      modelo: CONFIG.modelo,
      autor: 'TestScript'
    });

    const aud = await auditar({ hook: analisis.hookExtraido, guionCompleto: fusion.guionFusionado }, {}, 'M2');
    const puntaje = extraerPuntaje(aud);
    console.log(`  Fusión: ${puntaje}/100 | transición: ${fusion.transicionAgregada}`);
    resultados.push({
      modo: 'M2', n: 1, nivel: '', motivo: '', angulo: '', version: 1,
      hook: (analisis.hookExtraido || '').substring(0, 200),
      guion: (fusion.guionFusionado || '').substring(0, 300),
      puntaje, error: ''
    });
    guardarCSV();
  } catch (e) {
    console.error(`  ❌ ${e.message}`);
    resultados.push({ modo: 'M2', n: 1, nivel: '', motivo: '', angulo: '', version: 0, hook: '', guion: '', puntaje: 0, error: e.message.substring(0, 200) });
  }
}

// ============ MODO M3 - REESTRUCTURAR ============
async function testM3() {
  console.log('\n🔄 === MODO M3 - REESTRUCTURAR ===');
  const guiones = [GUIONES_PRUEBA.guion1, GUIONES_PRUEBA.guion2];

  for (let i = 0; i < guiones.length; i++) {
    console.log(`\n[M3 ${i+1}/${guiones.length}]`);
    try {
      const analisis = await llamarApi('/metodo3/analizar', {
        guionGanador: guiones[i],
        contextoAdicional: '',
        modelo: CONFIG.modelo,
        autor: 'TestScript'
      });

      const regen = await llamarApi('/metodo3/regenerar', {
        anuncioId: analisis.anuncioId,
        analisisConfirmado: analisis.analisis,
        estructuraConfirmada: analisis.estructura,
        palabrasClaveOriginales: analisis.palabrasClave,
        guionOriginal: guiones[i],
        modelo: CONFIG.modelo,
        autor: 'TestScript'
      });

      for (let v = 0; v < (regen.versiones || []).length; v++) {
        const version = regen.versiones[v];
        const aud = await auditar({ hook: version.hook, guionCompleto: version.guionCompleto }, analisis.analisis, 'M3');
        const puntaje = extraerPuntaje(aud);
        console.log(`  V${v+1}: ${puntaje}/100 | "${(version.hook||'').substring(0,60)}"`);
        resultados.push({
          modo: 'M3', n: i + 1,
          nivel: analisis.analisis?.nivel, motivo: analisis.analisis?.motivo, angulo: analisis.analisis?.angulo,
          version: v + 1,
          hook: (version.hook || '').substring(0, 200),
          guion: (version.guionCompleto || '').substring(0, 300),
          puntaje, error: ''
        });
      }
      guardarCSV();
      await sleep(CONFIG.esperaMs);
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
      resultados.push({ modo: 'M3', n: i+1, nivel: '', motivo: '', angulo: '', version: 0, hook: '', guion: '', puntaje: 0, error: e.message.substring(0, 200) });
    }
  }
}

// ============ MAIN ============
async function main() {
  console.log('🚀 INICIO TEST EXHAUSTIVO');
  const inicio = Date.now();

  await testCrearDesde0();
  await testM1();
  await testM2();
  await testM3();

  guardarCSV();

  const minutos = ((Date.now() - inicio) / 60000).toFixed(1);
  const conPuntaje = resultados.filter(r => r.puntaje > 0);
  const promedio = conPuntaje.length > 0 ? (conPuntaje.reduce((s, r) => s + r.puntaje, 0) / conPuntaje.length).toFixed(1) : 0;
  const errores = resultados.filter(r => r.error).length;

  console.log('\n══════════════════════════════════════');
  console.log(`✅ COMPLETO en ${minutos} min`);
  console.log(`Total filas: ${resultados.length}`);
  console.log(`Errores: ${errores}`);
  console.log(`Puntaje promedio: ${promedio}/100`);
  console.log(`\nPor modo:`);
  ['CREAR', 'M1', 'M2', 'M3'].forEach(m => {
    const filas = resultados.filter(r => r.modo === m && r.puntaje > 0);
    if (filas.length > 0) {
      const prom = (filas.reduce((s, r) => s + r.puntaje, 0) / filas.length).toFixed(1);
      console.log(`  ${m}: ${filas.length} resultados, promedio ${prom}/100`);
    }
  });
}

main().catch(console.error);
