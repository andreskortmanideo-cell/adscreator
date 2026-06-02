const fs = require('fs');
const path = require('path');

const CONFIG = {
  baseUrl: 'http://51.83.129.63/ads/api',
  modelo: 'claude-haiku-4-5-20251001',
  esperaMs: 2000
};

const PRODUCTO = {
  nombre: 'Pulverizadora de Alta Presión',
  descripcion: 'Pulverizadora conectable a compresor de aire. Limpia motores, herramientas, superficies. Manguera de 1.5m, alcance de 40cm, válvula ajustable. Producto para mecánicos y talleres en Colombia.',
  mercado: 'Colombia',
  avatar: 'Mecánico/dueño de taller, 30-55 años, hombres, pierde tiempo limpiando motores manualmente',
  nivel: 3,
  motivo: 'Funcional',
  angulo: 'Transformación',
  formato: 'video',
  duracion: 30
};

const GUION_BASE = 'Yo llevaba años fregando motores a mano, destrozándome la espalda cada noche. Con esta pulverizadora de alta presión todo cambió. Conecto al compresor, ajusto la presión y en cinco minutos limpio lo que antes me tomaba dos horas raspando. La grasa más incrustada desaparece sin esfuerzo. Ahora manejo mi taller sin ese cansancio que me dejaba hecho polvo. Esto sí funciona como se debe.';

const reporte = {
  fechaInicio: '',
  fechaFin: '',
  producto: PRODUCTO,
  guionBase: GUION_BASE,
  modos: {}
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function llamarApi(endpoint, body) {
  const inicio = Date.now();
  const res = await fetch(`${CONFIG.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const tiempo = Date.now() - inicio;
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
  }
  const data = await res.json();
  return { data, tiempoMs: tiempo };
}

async function testCrear() {
  console.log('\n🎬 === MODO CREAR ===');
  const contenido = `PRODUCTO: ${PRODUCTO.nombre}
DESCRIPCIÓN: ${PRODUCTO.descripcion}
MERCADO: ${PRODUCTO.mercado}
AVATAR: ${PRODUCTO.avatar}
TIPO: ${PRODUCTO.motivo}
NIVEL: ${PRODUCTO.nivel}
ANGULO_VENTA: ${PRODUCTO.angulo}
FORMATO: ${PRODUCTO.formato}
DURACIÓN: ${PRODUCTO.duracion}

Genera 2 versiones del anuncio.`;

  try {
    const { data, tiempoMs } = await llamarApi('/generate', {
      messages: [{ role: 'user', content: contenido }],
      modo: 'generar',
      apiProvider: 'anthropic',
      modelo: CONFIG.modelo
    });
    reporte.modos.crear = {
      input: contenido,
      output: data.content?.[0]?.text || '',
      tiempoMs,
      costo: data.costoOperacion?.totales || {},
      timestamp: new Date().toISOString()
    };
    console.log(`  ✓ Generado en ${tiempoMs}ms`);
    console.log(`  Output (primeras 300 chars): ${(data.content?.[0]?.text || '').substring(0, 300)}...`);
  } catch (e) {
    reporte.modos.crear = { error: e.message };
    console.error(`  ❌ ${e.message}`);
  }
  await sleep(CONFIG.esperaMs);
}

async function testM1() {
  console.log('\n🔍 === MODO M1 (Variar Hook) ===');
  try {
    // Paso 1: analizar
    const a = await llamarApi('/metodo1/analizar', {
      guionCompleto: GUION_BASE,
      contextoAdicional: '',
      modelo: CONFIG.modelo,
      autor: 'TestFlujo'
    });
    console.log(`  Análisis: N${a.data.analisis?.nivel} | ${a.data.analisis?.motivo} | ${a.data.analisis?.angulo}`);
    console.log(`  Hook detectado: "${a.data.hookOriginal}"`);
    console.log(`  Cuerpo arranca: "${(a.data.cuerpo || '').substring(0, 80)}..."`);

    await sleep(CONFIG.esperaMs);

    // Paso 2: generar-hooks
    const g = await llamarApi('/metodo1/generar-hooks', {
      anuncioId: a.data.anuncioId,
      analisisConfirmado: a.data.analisis,
      hookOriginal: a.data.hookOriginal,
      cuerpo: a.data.cuerpo,
      modelo: CONFIG.modelo,
      autor: 'TestFlujo'
    });

    console.log(`  ✓ Generados ${g.data.hooks?.length || 0} hooks en ${g.tiempoMs}ms`);
    (g.data.hooks || []).forEach((h, i) => {
      console.log(`    Hook ${i+1}: "${h.texto}"`);
      if (h.transicion) console.log(`      Transición: "${h.transicion}"`);
    });

    reporte.modos.m1 = {
      analisis_input: GUION_BASE,
      analisis_output: {
        analisis: a.data.analisis,
        hookOriginal: a.data.hookOriginal,
        cuerpo: a.data.cuerpo
      },
      analisis_tiempoMs: a.tiempoMs,
      hooks_input: {
        hookOriginal: a.data.hookOriginal,
        cuerpo: a.data.cuerpo
      },
      hooks_output: g.data.hooks || [],
      hooks_tiempoMs: g.tiempoMs,
      costo: {
        analisis: a.data.costoOperacion?.totales || {},
        hooks: g.data.costoOperacion?.totales || {}
      },
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    reporte.modos.m1 = { error: e.message };
    console.error(`  ❌ ${e.message}`);
  }
  await sleep(CONFIG.esperaMs);
}

async function testM2() {
  console.log('\n🔗 === MODO M2 (Fusión) ===');
  const hookSource = 'Tres horas raspando reducidas a cinco minutos. Mira cómo lo hago.';
  const cuerpoSource = 'Compré esta pulverizadora de alta presión y fue lo mejor que pude hacer. Yo perdía dos horas diarias limpiando motores con cepillo y solventes. La conecto al compresor, ajusto la presión y la grasa desaparece sola. Mi taller cambió completamente. Mi espalda agradece.';

  try {
    const a = await llamarApi('/metodo2/analizar', {
      textoConHook: hookSource,
      textoConCuerpo: cuerpoSource,
      contextoAdicional: '',
      modelo: CONFIG.modelo,
      autor: 'TestFlujo'
    });
    console.log(`  Hook extraído: "${a.data.hookExtraido}"`);
    console.log(`  Cuerpo extraído: "${(a.data.cuerpoExtraido || '').substring(0, 80)}..."`);
    console.log(`  Compatibilidad: ${a.data.compatibilidad?.nivel || 'N/A'}`);

    await sleep(CONFIG.esperaMs);

    const f = await llamarApi('/metodo2/fusionar', {
      anuncioId: a.data.anuncioId,
      hookConfirmado: a.data.hookExtraido,
      cuerpoConfirmado: a.data.cuerpoExtraido,
      analisisCompatibilidad: a.data.compatibilidad,
      modelo: CONFIG.modelo,
      autor: 'TestFlujo'
    });
    console.log(`  ✓ Fusionado en ${f.tiempoMs}ms`);
    console.log(`  Transición: "${f.data.transicionAgregada || 'Ninguna'}"`);
    console.log(`  Guion: "${(f.data.guionFusionado || '').substring(0, 200)}..."`);

    reporte.modos.m2 = {
      analisis_input: { textoConHook: hookSource, textoConCuerpo: cuerpoSource },
      analisis_output: {
        hookExtraido: a.data.hookExtraido,
        cuerpoExtraido: a.data.cuerpoExtraido,
        compatibilidad: a.data.compatibilidad
      },
      fusion_output: {
        guionFusionado: f.data.guionFusionado,
        transicionAgregada: f.data.transicionAgregada,
        notas: f.data.notas
      },
      tiempoMs: a.tiempoMs + f.tiempoMs,
      costo: {
        analisis: a.data.costoOperacion?.totales || {},
        fusion: f.data.costoOperacion?.totales || {}
      },
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    reporte.modos.m2 = { error: e.message };
    console.error(`  ❌ ${e.message}`);
  }
  await sleep(CONFIG.esperaMs);
}

async function testM3() {
  console.log('\n🔄 === MODO M3 (Reestructurar) ===');
  try {
    const a = await llamarApi('/metodo3/analizar', {
      guionGanador: GUION_BASE,
      contextoAdicional: '',
      modelo: CONFIG.modelo,
      autor: 'TestFlujo'
    });
    console.log(`  Análisis: N${a.data.analisis?.nivel} | ${a.data.analisis?.motivo} | ${a.data.analisis?.angulo}`);
    console.log(`  Estructura detectada: ${a.data.estructura?.length || 0} pasos`);
    console.log(`  Palabras clave: ${a.data.palabrasClave?.length || 0}`);

    await sleep(CONFIG.esperaMs);

    const r = await llamarApi('/metodo3/regenerar', {
      anuncioId: a.data.anuncioId,
      analisisConfirmado: a.data.analisis,
      estructuraConfirmada: a.data.estructura,
      palabrasClaveOriginales: a.data.palabrasClave,
      guionOriginal: GUION_BASE,
      modelo: CONFIG.modelo,
      autor: 'TestFlujo'
    });

    console.log(`  ✓ Regeneradas ${r.data.versiones?.length || 0} versiones en ${r.tiempoMs}ms`);
    (r.data.versiones || []).forEach((v, i) => {
      console.log(`    V${i+1}: "${(v.hook || '').substring(0, 60)}..."`);
    });

    reporte.modos.m3 = {
      analisis_input: GUION_BASE,
      analisis_output: {
        analisis: a.data.analisis,
        estructura: a.data.estructura,
        palabrasClave: a.data.palabrasClave
      },
      regenerar_output: r.data.versiones || [],
      tiempoMs: a.tiempoMs + r.tiempoMs,
      costo: {
        analisis: a.data.costoOperacion?.totales || {},
        regenerar: r.data.costoOperacion?.totales || {}
      },
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    reporte.modos.m3 = { error: e.message };
    console.error(`  ❌ ${e.message}`);
  }
}

function guardarReporte() {
  const carpeta = path.join(__dirname, 'resultados');
  if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
  const fecha = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const rutaJson = path.join(carpeta, `flujo-completo-${fecha}.json`);
  const rutaMd = path.join(carpeta, `flujo-completo-${fecha}.md`);

  fs.writeFileSync(rutaJson, JSON.stringify(reporte, null, 2), 'utf8');

  // Reporte legible en MD
  let md = `# Reporte Flujo Completo — ${reporte.fechaInicio}\n\n`;
  md += `**Producto:** ${PRODUCTO.nombre}\n`;
  md += `**Guion base:**\n> ${GUION_BASE}\n\n---\n\n`;

  for (const [modo, data] of Object.entries(reporte.modos)) {
    md += `## Modo: ${modo.toUpperCase()}\n\n`;
    if (data.error) {
      md += `❌ **ERROR:** ${data.error}\n\n`;
      continue;
    }
    md += '```json\n' + JSON.stringify(data, null, 2) + '\n```\n\n';
  }

  fs.writeFileSync(rutaMd, md, 'utf8');
  console.log(`\n💾 Reporte JSON: ${rutaJson}`);
  console.log(`💾 Reporte MD:   ${rutaMd}`);
}

async function main() {
  reporte.fechaInicio = new Date().toISOString();
  console.log('🚀 INICIO TEST FLUJO COMPLETO');
  console.log(`Fecha inicio: ${reporte.fechaInicio}`);

  await testCrear();
  await testM1();
  await testM2();
  await testM3();

  reporte.fechaFin = new Date().toISOString();
  guardarReporte();

  console.log(`\n══════════════════════════════════════`);
  console.log(`✅ COMPLETO`);
  console.log(`Fecha fin: ${reporte.fechaFin}`);
  console.log(`\nPara capturar los logs del backend de esta ventana, ejecuta en el VPS:`);
  console.log(`pm2 logs adscreator --lines 500 --nostream > /tmp/logs-flujo.txt && cat /tmp/logs-flujo.txt`);
}

main().catch(console.error);
