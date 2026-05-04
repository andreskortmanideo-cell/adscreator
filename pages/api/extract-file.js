import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const form = formidable({ maxFileSize: 15 * 1024 * 1024 }) // 15 MB
    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) return res.status(400).json({ error: 'No se recibió archivo' })

    const ext = (file.originalFilename || '').toLowerCase().split('.').pop()
    const mime = file.mimetype || ''
    let text = ''
    let kind = 'text'

    // ── PDF ────────────────────────────────────────────────────────
    if (ext === 'pdf' || mime === 'application/pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default
        const buf = fs.readFileSync(file.filepath)
        const data = await pdfParse(buf)
        text = (data.text || '').trim()
      } catch (e) {
        return res.status(500).json({ error: 'Error procesando PDF: ' + e.message })
      }
    }
    // ── DOCX ───────────────────────────────────────────────────────
    else if (ext === 'docx' || mime.includes('wordprocessingml')) {
      try {
        const mammoth = (await import('mammoth')).default
        const result = await mammoth.extractRawText({ path: file.filepath })
        text = (result.value || '').trim()
      } catch (e) {
        return res.status(500).json({ error: 'Error procesando DOCX: ' + e.message })
      }
    }
    // ── TXT / MD ───────────────────────────────────────────────────
    else if (['txt', 'md', 'markdown'].includes(ext) || mime.startsWith('text/')) {
      try {
        text = fs.readFileSync(file.filepath, 'utf8').trim()
      } catch (e) {
        return res.status(500).json({ error: 'Error leyendo archivo de texto: ' + e.message })
      }
    }
    // ── Imágenes (devolvemos base64 para vision) ──────────────────
    else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) || mime.startsWith('image/')) {
      try {
        const buf = fs.readFileSync(file.filepath)
        const b64 = buf.toString('base64')
        const mt = mime || 'image/png'
        kind = 'image'
        text = `data:${mt};base64,${b64}`
      } catch (e) {
        return res.status(500).json({ error: 'Error leyendo imagen: ' + e.message })
      }
    }
    else {
      return res.status(400).json({ error: `Formato no soportado: .${ext}. Usa PDF, DOCX, TXT, MD o imágenes.` })
    }

    // Limpiar archivo temporal
    try { fs.unlinkSync(file.filepath) } catch {}

    if (kind === 'text' && !text) {
      return res.status(400).json({ error: 'El archivo está vacío o no se pudo extraer texto.' })
    }

    return res.status(200).json({
      ok: true,
      kind,
      text,
      filename: file.originalFilename,
      size: file.size,
      chars: kind === 'text' ? text.length : 0,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Error general: ' + e.message })
  }
}
