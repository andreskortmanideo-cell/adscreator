import { listarAdvertoriales, contarAdvertoriales } from '../../../lib/advertoriales-db'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 500)
    const offset = parseInt(req.query.offset || '0', 10) || 0
    const items = listarAdvertoriales(limit, offset)
    const total = contarAdvertoriales()
    return res.status(200).json({ items, total })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
