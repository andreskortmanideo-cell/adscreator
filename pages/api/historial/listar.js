import { listarAnuncios, contarAnuncios } from '../../../lib/historial-db'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200)
    const offset = parseInt(req.query.offset || '0', 10) || 0
    const producto = (req.query.producto || '').toString()
    const items = listarAnuncios(limit, offset, producto)
    const total = contarAnuncios(producto)
    return res.status(200).json({ items, total })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
