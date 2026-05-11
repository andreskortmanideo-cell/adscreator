import { obtenerUltimaSesion } from '../../../lib/historial-db'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const autor = req.query.autor ? String(req.query.autor) : null
    const sesion = obtenerUltimaSesion(autor)
    if (!sesion) return res.status(200).json({ sesion: null })
    return res.status(200).json({ sesion })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
