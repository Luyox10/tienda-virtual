const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const upload = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) throw new Error('No se recibió imagen');

    const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) throw new Error('Formato de imagen inválido');

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.promises.writeFile(filePath, buffer);

    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const origin = `${protocol}://${req.get('host')}`;
    res.json({ image_url: `${origin}/uploads/${filename}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { upload };
