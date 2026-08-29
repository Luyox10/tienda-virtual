const upload = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) throw new Error('No se recibió imagen');

    const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) throw new Error('Formato de imagen inválido');

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const allowed = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    if (!allowed.includes(ext)) throw new Error('Extensión no permitida');

    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) throw new Error('La imagen no debe superar los 5 MB');

    res.json({ image_url: image });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { upload };
