import { crearAnuncio, actualizarBriefing } from '../../../lib/historial-db'

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const body = req.body || {}
    const briefing = body.briefing || {}
    if (body.autor !== undefined) briefing.autor = body.autor
    if (body.id) {
      const ok = actualizarBriefing(Number(body.id), briefing)
      if (!ok) return res.status(404).json({ error: 'Anuncio no encontrado' })
      return res.status(200).json({ id: Number(body.id), actualizado: true })
    }
    const id = crearAnuncio(briefing)
    return res.status(200).json({ id, creado: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
