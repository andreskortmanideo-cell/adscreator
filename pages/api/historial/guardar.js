import { guardarAnuncio } from '../../../lib/historial-db'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const id = guardarAnuncio(req.body || {})
    return res.status(200).json({ id: Number(id), ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
