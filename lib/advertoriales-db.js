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
    db.exec(`
      CREATE TABLE IF NOT EXISTS advertoriales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creado_en TEXT NOT NULL,
        disenador_nombre TEXT NOT NULL DEFAULT 'desconocido',
        producto TEXT NOT NULL,
        avatar TEXT,
        mercado TEXT,
        modelo TEXT,
        costo_usd REAL DEFAULT 0,
        costo_cop REAL DEFAULT 0,
        operaciones INTEGER DEFAULT 0,
        datos_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_adv_creado ON advertoriales(creado_en DESC);
      CREATE INDEX IF NOT EXISTS idx_adv_disenador ON advertoriales(disenador_nombre);
    `)
    // Migración: añadir disenador_nombre si la tabla existía sin esa columna
    const cols = db.prepare("PRAGMA table_info(advertoriales)").all()
    if (!cols.some(c => c.name === 'disenador_nombre')) {
      db.exec(`ALTER TABLE advertoriales ADD COLUMN disenador_nombre TEXT NOT NULL DEFAULT 'desconocido'`)
      db.exec(`UPDATE advertoriales SET disenador_nombre = 'desconocido' WHERE disenador_nombre IS NULL OR disenador_nombre = ''`)
    }
  }
  return db
}

export function guardarAdvertorial(datos) {
  const db = getDB()
  const stmt = db.prepare(`
    INSERT INTO advertoriales (creado_en, disenador_nombre, producto, avatar, mercado, modelo, costo_usd, costo_cop, operaciones, datos_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const res = stmt.run(
    new Date().toISOString(),
    (datos.disenador_nombre || '').toString().trim() || 'desconocido',
    (datos.producto || '').toString(),
    (datos.avatar || '').toString(),
    (datos.mercado || '').toString(),
    (datos.modelo || '').toString(),
    Number(datos.costoUsd || 0),
    Number(datos.costoCop || 0),
    Number(datos.operaciones || 0),
    JSON.stringify(datos.payload || {})
  )
  return res.lastInsertRowid
}

export function actualizarAdvertorial(id, datos) {
  const db = getDB()
  const stmt = db.prepare(`
    UPDATE advertoriales SET
      producto = ?, avatar = ?, mercado = ?, modelo = ?,
      costo_usd = ?, costo_cop = ?, operaciones = ?, datos_json = ?
    WHERE id = ?
  `)
  const res = stmt.run(
    (datos.producto || '').toString(),
    (datos.avatar || '').toString(),
    (datos.mercado || '').toString(),
    (datos.modelo || '').toString(),
    Number(datos.costoUsd || 0),
    Number(datos.costoCop || 0),
    Number(datos.operaciones || 0),
    JSON.stringify(datos.payload || {}),
    Number(id)
  )
  return res.changes > 0
}

export function listarAdvertoriales(limit = 100, offset = 0) {
  const db = getDB()
  const stmt = db.prepare(`
    SELECT id, creado_en, disenador_nombre, producto, avatar, mercado, modelo, costo_usd, costo_cop, operaciones
    FROM advertoriales
    ORDER BY creado_en DESC
    LIMIT ? OFFSET ?
  `)
  return stmt.all(limit, offset)
}

export function contarAdvertoriales() {
  const db = getDB()
  return db.prepare('SELECT COUNT(*) AS n FROM advertoriales').get().n
}

export function obtenerAdvertorial(id) {
  const db = getDB()
  const row = db.prepare('SELECT * FROM advertoriales WHERE id = ?').get(id)
  if (row && row.datos_json) {
    try { row.datos = JSON.parse(row.datos_json) } catch {}
  }
  return row
}

export function eliminarAdvertorial(id) {
  const db = getDB()
  return db.prepare('DELETE FROM advertoriales WHERE id = ?').run(id).changes > 0
}
