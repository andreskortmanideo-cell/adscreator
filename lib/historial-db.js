import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
const DB_PATH = path.join(DATA_DIR, 'historial.db')

let db
function getDB() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    // Si existe un schema viejo (single-table), lo renombramos como legacy.
    const cols = db.prepare("PRAGMA table_info(anuncios)").all()
    const hasLegacy = cols.length > 0 && cols.some(c => c.name === 'datos_json')
    if (hasLegacy) {
      db.exec(`ALTER TABLE anuncios RENAME TO anuncios_legacy;`)
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS anuncios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creado_en TEXT NOT NULL,
        actualizado_en TEXT NOT NULL,
        autor TEXT,
        producto TEXT,
        avatar TEXT,
        formato TEXT,
        duracion TEXT,
        tipo_imagen TEXT,
        nivel TEXT,
        motivo TEXT,
        angulo TEXT,
        modelo TEXT,
        briefing_json TEXT,
        costo_usd_total REAL DEFAULT 0,
        costo_cop_total REAL DEFAULT 0,
        versiones_count INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_anuncios_creado ON anuncios(creado_en DESC);
      CREATE INDEX IF NOT EXISTS idx_anuncios_autor ON anuncios(autor);

      CREATE TABLE IF NOT EXISTS versiones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anuncio_id INTEGER NOT NULL,
        creado_en TEXT NOT NULL,
        tipo TEXT NOT NULL,
        modelo TEXT,
        costo_usd REAL DEFAULT 0,
        costo_cop REAL DEFAULT 0,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        contenido_json TEXT,
        FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_versiones_anuncio ON versiones(anuncio_id, creado_en DESC);
    `)
  }
  return db
}

function nowIso() { return new Date().toISOString() }

function camposBriefing(b = {}) {
  return {
    autor: (b.autor || '').toString().slice(0, 200) || null,
    producto: (b.producto || '').toString().slice(0, 200),
    avatar: (b.avatar || '').toString().slice(0, 300),
    formato: (b.formato || '').toString(),
    duracion: (b.duracion || '').toString(),
    tipo_imagen: (b.tipoImagen || b.formatoImagen || '').toString(),
    nivel: (b.nivel !== undefined && b.nivel !== null) ? String(b.nivel) : '',
    motivo: (b.motivo || '').toString(),
    angulo: (b.angulo || '').toString(),
    modelo: (b.modelo || '').toString(),
    briefing_json: JSON.stringify(b.briefingJson || b)
  }
}

export function crearAnuncio(briefing = {}) {
  const db = getDB()
  const c = camposBriefing(briefing)
  const ahora = nowIso()
  const stmt = db.prepare(`
    INSERT INTO anuncios
      (creado_en, actualizado_en, autor, producto, avatar, formato, duracion, tipo_imagen, nivel, motivo, angulo, modelo, briefing_json, costo_usd_total, costo_cop_total, versiones_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
  `)
  const res = stmt.run(
    ahora, ahora,
    c.autor, c.producto, c.avatar, c.formato, c.duracion, c.tipo_imagen,
    c.nivel, c.motivo, c.angulo, c.modelo, c.briefing_json
  )
  return Number(res.lastInsertRowid)
}

export function actualizarBriefing(anuncioId, briefing = {}) {
  const db = getDB()
  const c = camposBriefing(briefing)
  const stmt = db.prepare(`
    UPDATE anuncios SET
      producto = ?, avatar = ?, formato = ?, duracion = ?, tipo_imagen = ?,
      nivel = ?, motivo = ?, angulo = ?, modelo = ?, briefing_json = ?,
      actualizado_en = ?
    WHERE id = ?
  `)
  const res = stmt.run(
    c.producto, c.avatar, c.formato, c.duracion, c.tipo_imagen,
    c.nivel, c.motivo, c.angulo, c.modelo, c.briefing_json,
    nowIso(), anuncioId
  )
  return res.changes > 0
}

export function agregarVersion(anuncioId, datos = {}) {
  const db = getDB()
  const ahora = nowIso()
  const insVersion = db.prepare(`
    INSERT INTO versiones
      (anuncio_id, creado_en, tipo, modelo, costo_usd, costo_cop, input_tokens, output_tokens, contenido_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const updAnuncio = db.prepare(`
    UPDATE anuncios SET
      costo_usd_total = costo_usd_total + ?,
      costo_cop_total = costo_cop_total + ?,
      versiones_count = versiones_count + 1,
      actualizado_en = ?
    WHERE id = ?
  `)
  const tx = db.transaction(() => {
    const r = insVersion.run(
      anuncioId, ahora,
      String(datos.tipo || 'desconocido'),
      String(datos.modelo || ''),
      Number(datos.costoUsd || 0),
      Number(datos.costoCop || 0),
      Number(datos.inputTokens || 0),
      Number(datos.outputTokens || 0),
      JSON.stringify(datos.contenido || {})
    )
    updAnuncio.run(
      Number(datos.costoUsd || 0),
      Number(datos.costoCop || 0),
      ahora,
      anuncioId
    )
    return Number(r.lastInsertRowid)
  })
  return tx()
}

export function listarAnuncios(limit = 50, autor = null) {
  const db = getDB()
  const cap = Math.max(1, Math.min(parseInt(limit, 10) || 50, 200))
  if (autor && String(autor).trim()) {
    return db.prepare(`
      SELECT id, creado_en, actualizado_en, autor, producto, avatar, formato, duracion,
             tipo_imagen, nivel, motivo, angulo, modelo,
             costo_usd_total, costo_cop_total, versiones_count
      FROM anuncios
      WHERE autor = ?
      ORDER BY actualizado_en DESC
      LIMIT ?
    `).all(String(autor).trim(), cap)
  }
  return db.prepare(`
    SELECT id, creado_en, actualizado_en, autor, producto, avatar, formato, duracion,
           tipo_imagen, nivel, motivo, angulo, modelo,
           costo_usd_total, costo_cop_total, versiones_count
    FROM anuncios
    ORDER BY actualizado_en DESC
    LIMIT ?
  `).all(cap)
}

export function obtenerAnuncio(id) {
  const db = getDB()
  const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(id)
  if (!anuncio) return null
  const versiones = db.prepare(`
    SELECT id, creado_en, tipo, modelo, costo_usd, costo_cop, input_tokens, output_tokens, contenido_json
    FROM versiones
    WHERE anuncio_id = ?
    ORDER BY creado_en DESC, id DESC
  `).all(id)
  let briefing = null
  if (anuncio.briefing_json) {
    try { briefing = JSON.parse(anuncio.briefing_json) } catch {}
  }
  return {
    ...anuncio,
    briefing,
    versiones: versiones.map(v => {
      let contenido = null
      if (v.contenido_json) {
        try { contenido = JSON.parse(v.contenido_json) } catch {}
      }
      return { ...v, contenido }
    })
  }
}

export function obtenerUltimaSesion(autor = null) {
  const db = getDB()
  let anuncio
  if (autor && String(autor).trim()) {
    anuncio = db.prepare(`
      SELECT * FROM anuncios
      WHERE autor = ?
      ORDER BY actualizado_en DESC
      LIMIT 1
    `).get(String(autor).trim())
  } else {
    anuncio = db.prepare(`
      SELECT * FROM anuncios
      ORDER BY actualizado_en DESC
      LIMIT 1
    `).get()
  }
  if (!anuncio) return null
  const version = db.prepare(`
    SELECT id, creado_en, tipo, modelo, costo_usd, costo_cop, input_tokens, output_tokens, contenido_json
    FROM versiones
    WHERE anuncio_id = ?
    ORDER BY creado_en DESC, id DESC
    LIMIT 1
  `).get(anuncio.id)
  let briefing = null
  if (anuncio.briefing_json) {
    try { briefing = JSON.parse(anuncio.briefing_json) } catch {}
  }
  let contenido = null
  if (version?.contenido_json) {
    try { contenido = JSON.parse(version.contenido_json) } catch {}
  }
  return {
    ...anuncio,
    briefing,
    ultima_version: version ? { ...version, contenido } : null
  }
}

export function eliminarAnuncio(id) {
  const db = getDB()
  return db.prepare('DELETE FROM anuncios WHERE id = ?').run(id).changes > 0
}
