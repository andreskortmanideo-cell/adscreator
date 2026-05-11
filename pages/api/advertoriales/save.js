import { guardarAdvertorial, actualizarAdvertorial } from '../../../lib/advertoriales-db'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const body = req.body || {}
    const disenador = (body.disenador_nombre || '').toString().trim()
    if (!disenador) return res.status(400).json({ error: 'disenador_nombre es obligatorio' })

    if (body.id) {
      const ok = actualizarAdvertorial(body.id, body)
      if (!ok) return res.status(404).json({ error: 'No encontrado' })
      return res.status(200).json({ id: Number(body.id), ok: true, updated: true })
    }
    const id = guardarAdvertorial(body)
    return res.status(200).json({ id: Number(id), ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
