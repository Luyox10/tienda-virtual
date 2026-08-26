const IMAGES_PREFIX = '/imagenes/productos/'

export function productImage(p) {
  if (p.image_url) {
    if (p.image_url.startsWith('http')) return p.image_url
    const clean = p.image_url.startsWith(IMAGES_PREFIX) ? p.image_url : `${IMAGES_PREFIX}${p.image_url}`
    return clean
  }
  const name = p.name?.toLowerCase() || ''
  if (name.includes('causa')) return `${IMAGES_PREFIX}causa-pollo.jpg`
  if (name.includes('papa')) return `${IMAGES_PREFIX}papa-rellena.jpg`
  return ''
}
