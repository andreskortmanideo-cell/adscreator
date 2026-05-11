import { obtenerAnuncio, eliminarAnuncio } from '../../../lib/historial-db'

export default function handler(req, res) {
  const id = parseInt(req.query.id, 10)
  if (!id || isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

  try {
    if (req.method === 'GET') {
      const row = obtenerAnuncio(id)
      if (!row) return res.status(404).json({ error: 'No encontrado' })
      return res.status(200).json(row)
    }
    if (req.method === 'DELETE') {
      const ok = eliminarAnuncio(id)
      if (!ok) return res.status(404).json({ error: 'No encontrado' })
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
