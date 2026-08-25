import { useState, useEffect } from 'react'
import { getOrders, getOrder, createPayment, getPayment } from './services/api'

export default function Orders({ token, onBack }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [paying, setPaying] = useState(null)
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const loadOrders = () => {
    getOrders(token)
      .then(setOrders)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    loadOrders()
  }, [token])

  const viewDetail = (id) => {
    getOrder(id, token)
      .then((o) => {
        setSelected(o)
        if (o.payment_id) {
          getPayment(o.payment_id, token)
            .then(setPayment)
            .catch(() => setPayment(null))
        }
      })
      .catch((e) => setError(e.message))
  }

  const submitPayment = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      const p = await createPayment(
        {
          order_id: paying.id,
          amount: paying.total,
          proof_image_url: form.get('proof_image_url'),
          method: 'YAPE',
        },
        token
      )
      setMessage(`Pago #${p.id} registrado. Espera aprobación.`)
      setPaying(null)
      loadOrders()
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Mis pedidos</h2>
      <button className="btn secondary" onClick={onBack}>
        Volver al catálogo
      </button>
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      {paying ? (
        <div className="card detail">
          <h3>Pagar pedido #{paying.id}</h3>
          <p>Total: S/ {paying.total}</p>
          <p>Realiza el pago por Yape y pega la URL del comprobante.</p>
          <form onSubmit={submitPayment} className="form">
            <input type="text" name="proof_image_url" placeholder="URL del comprobante" required />
            <button type="submit" className="btn">Registrar pago</button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setPaying(null)}
            >
              Cancelar
            </button>
          </form>
        </div>
      ) : selected ? (
        <div className="card detail">
          <h3>Pedido #{selected.id}</h3>
          <p>Total: S/ {selected.total}</p>
          <p>Estado del pedido: {selected.status}</p>
          <p>Estado del pago: {selected.payment_status}</p>
          {payment && (
            <>
              <p>Método: {payment.method}</p>
              {payment.voucher_url ? (
                <a href={payment.voucher_url} target="_blank" rel="noreferrer">
                  Ver comprobante
                </a>
              ) : (
                <p>Sin comprobante</p>
              )}
            </>
          )}
          <h4>Productos</h4>
          <ul>
            {selected.items?.map((i) => (
              <li key={i.id}>
                {i.product_name} x {i.quantity} - S/ {i.subtotal}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={() => setSelected(null)}>
            Volver al historial
          </button>
        </div>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id} className="order-item">
              <span>
                Pedido #{o.id} - S/ {o.total} - {o.status}
              </span>
              <span>
                {o.status === 'PENDING_PAYMENT' && (
                  <button className="btn small" onClick={() => setPaying(o)}>
                    Pagar
                  </button>
                )}
                <button className="btn small" onClick={() => viewDetail(o.id)}>
                  Ver
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
