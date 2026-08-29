const IMAGES_PREFIX = '/imagenes/productos/'

function normalizeImageUrl(url) {
  if (url.startsWith('http') || url.startsWith('data:')) return url
  const relative = url.replace(/^\/?imagenes\/productos\//, '')
  if (relative === url) {
    if (url.startsWith('/')) return url
    return `${IMAGES_PREFIX}${url}`
  }
  return `${IMAGES_PREFIX}${relative}`
}

export function productImage(p) {
  if (p.image_url) {
    return normalizeImageUrl(p.image_url)
  }
  const name = p.name?.toLowerCase() || ''
  if (name.includes('causa')) return `${IMAGES_PREFIX}causa-pollo.jpg`
  if (name.includes('papa')) return `${IMAGES_PREFIX}papa-rellena.jpg`
  return ''
}
