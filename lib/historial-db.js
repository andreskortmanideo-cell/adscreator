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
      CREATE TABLE IF NOT EXISTS anuncios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creado_en TEXT NOT NULL,
        autor TEXT,
        producto TEXT NOT NULL,
        avatar TEXT,
        formato TEXT NOT NULL,
        nivel TEXT,
        motivo TEXT,
        angulo TEXT,
        modelo TEXT,
        costo_usd REAL DEFAULT 0,
        costo_cop REAL DEFAULT 0,
        operaciones INTEGER DEFAULT 0,
        datos_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_creado ON anuncios(creado_en DESC);
      CREATE INDEX IF NOT EXISTS idx_producto ON anuncios(producto);
    `)
  }
  return db
}

export function guardarAnuncio(datos) {
  const db = getDB()
  const stmt = db.prepare(`
    INSERT INTO anuncios (creado_en, autor, producto, avatar, formato, nivel, motivo, angulo, modelo, costo_usd, costo_cop, operaciones, datos_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const res = stmt.run(
    new Date().toISOString(),
    datos.autor || 'Anónimo',
    datos.producto || '',
    datos.avatar || '',
    datos.formato || '',
    datos.nivel || '',
    datos.motivo || '',
    datos.angulo || '',
    datos.modelo || '',
    datos.costoUsd || 0,
    datos.costoCop || 0,
    datos.operaciones || 0,
    JSON.stringify(datos.payload || {})
  )
  return res.lastInsertRowid
}

export function listarAnuncios(limit = 50, offset = 0, producto = '') {
  const db = getDB()
  if (producto && producto.trim()) {
    const stmt = db.prepare(`
      SELECT id, creado_en, autor, producto, avatar, formato, nivel, motivo, angulo, modelo, costo_usd, costo_cop, operaciones
      FROM anuncios
      WHERE producto LIKE ?
      ORDER BY creado_en DESC
      LIMIT ? OFFSET ?
    `)
    return stmt.all('%' + producto.trim() + '%', limit, offset)
  }
  const stmt = db.prepare(`
    SELECT id, creado_en, autor, producto, avatar, formato, nivel, motivo, angulo, modelo, costo_usd, costo_cop, operaciones
    FROM anuncios
    ORDER BY creado_en DESC
    LIMIT ? OFFSET ?
  `)
  return stmt.all(limit, offset)
}

export function contarAnuncios(producto = '') {
  const db = getDB()
  if (producto && producto.trim()) {
    return db.prepare('SELECT COUNT(*) AS n FROM anuncios WHERE producto LIKE ?').get('%' + producto.trim() + '%').n
  }
  return db.prepare('SELECT COUNT(*) AS n FROM anuncios').get().n
}

export function obtenerAnuncio(id) {
  const db = getDB()
  const stmt = db.prepare('SELECT * FROM anuncios WHERE id = ?')
  const row = stmt.get(id)
  if (row && row.datos_json) {
    try { row.datos = JSON.parse(row.datos_json) } catch {}
  }
  return row
}

export function eliminarAnuncio(id) {
  const db = getDB()
  return db.prepare('DELETE FROM anuncios WHERE id = ?').run(id).changes > 0
}
