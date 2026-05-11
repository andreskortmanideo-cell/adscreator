import { agregarVersion } from '../../../lib/historial-db'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const b = req.body || {}
    const anuncioId = Number(b.anuncioId)
    if (!anuncioId) return res.status(400).json({ error: 'anuncioId requerido' })
    const versionId = agregarVersion(anuncioId, {
      tipo: b.tipo,
      modelo: b.modelo,
      costoUsd: b.costoUsd,
      costoCop: b.costoCop,
      inputTokens: b.inputTokens,
      outputTokens: b.outputTokens,
      contenido: b.contenido
    })
    return res.status(200).json({ versionId, ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
