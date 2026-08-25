export function productImage(p) {
  if (p.image_url) {
    if (p.image_url.startsWith('http')) return p.image_url
    return `/imagenes/productos/${p.image_url}`
  }
  const name = p.name?.toLowerCase() || ''
  if (name.includes('causa')) return '/imagenes/productos/causa-pollo.jpg'
  if (name.includes('papa')) return '/imagenes/productos/papa-rellena.jpg'
  return ''
}
