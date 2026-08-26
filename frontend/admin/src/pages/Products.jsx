import { useEffect, useState } from 'react'
import { getProducts, getShifts, createProduct, updateProduct } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { productImage } from '../utils/productImage'

export default function Products({ token }) {
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    image_url: '',
    shift_id: '',
    is_active: true,
  })

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getProducts(), getShifts()])
      .then(([p, s]) => {
        setProducts(p)
        setShifts(s)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const reset = () => {
    setForm({ id: null, name: '', description: '', price: '', image_url: '', shift_id: '', is_active: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image_url: form.image_url,
      shift_id: Number(form.shift_id),
      is_active: form.is_active,
    }
    try {
      if (form.id) {
        await updateProduct(form.id, body, token)
        setMessage('Producto actualizado')
      } else {
        await createProduct(body, token)
        setMessage('Producto creado')
      }
      reset()
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const edit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      image_url: p.image_url || '',
      shift_id: p.shift_id,
      is_active: p.is_active,
    })
  }

  const doToggleActive = async () => {
    if (!confirm) return
    try {
      await updateProduct(confirm.product.id, { is_active: confirm.nextActive }, token)
      setMessage(`Producto ${confirm.nextActive ? 'activado' : 'desactivado'}`)
      setConfirm(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const shiftName = (id) => shifts.find((s) => s.id === Number(id))?.name || '-'

  if (loading) return <p className="loading-message">Cargando productos...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Productos" subtitle="Gestiona los productos disponibles en tu tienda." />
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <section className="dashboard-section">
        <h2 className="section-title">{form.id ? 'Editar producto' : 'Crear producto'}</h2>
        <form onSubmit={handleSubmit} className="form product-form">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre"
            required
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción"
          />
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Precio"
            required
          />
          <select
            value={form.shift_id}
            onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
            required
          >
            <option value="">Seleccionar turno</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="URL o ruta de imagen"
          />
          <label className="form-check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span>Activo</span>
          </label>
          <div>
            <button type="submit" className="btn">
              {form.id ? 'Guardar cambios' : 'Guardar producto'}
            </button>
            {form.id && (
              <button type="button" className="btn secondary" onClick={reset}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Lista de productos</h2>
        <DataTable headers={['Imagen', 'Nombre', 'Precio', 'Turno', 'Estado', 'Acciones']}>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-cell">No hay productos registrados.</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={productImage(p)} alt={p.name} className="product-thumb" />
                </td>
                <td>
                  <strong>{p.name}</strong>
                  {p.description && <p className="product-desc">{p.description}</p>}
                </td>
                <td>S/ {p.price}</td>
                <td>{shiftName(p.shift_id)}</td>
                <td><StatusBadge status={p.is_active ? 'active' : 'inactive'} /></td>
                <td>
                  <button className="btn small" onClick={() => edit(p)}>Editar</button>
                  <button
                    className="btn small"
                    onClick={() =>
                      setConfirm({ product: p, nextActive: !p.is_active })
                    }
                  >
                    {p.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      {confirm && (
        <Modal
          title={`¿Deseas ${confirm.nextActive ? 'activar' : 'desactivar'} "${confirm.product.name}"?`}
          onClose={() => setConfirm(null)}
          onConfirm={doToggleActive}
          confirmText="Confirmar"
        >
          Esta acción cambiará la visibilidad del producto en la tienda.
        </Modal>
      )}
    </div>
  )
}
