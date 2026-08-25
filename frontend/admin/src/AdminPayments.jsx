import { useState, useEffect } from 'react'
import { getPayments, approvePayment, rejectPayment } from './api'

export default function AdminPayments({ token }) {
  const [payments, setPayments] = useState([])
  const [reason, setReason] = useState({})
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const load = () => {
    getPayments(token)
      .then(setPayments)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    load()
  }, [token])

  const approve = async (id) => {
    try {
      await approvePayment(id, token)
      setMessage(`Pago #${id} aprobado`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const reject = async (id) => {
    try {
      await rejectPayment(id, token, reason[id] || '')
      setMessage(`Pago #${id} rechazado`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Pagos</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pedido</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.order_id}</td>
              <td>{p.method}</td>
              <td>S/ {p.amount}</td>
              <td>{p.status}</td>
              <td>
                {p.voucher_url ? (
                  <a href={p.voucher_url} target="_blank" rel="noreferrer">
                    Ver
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>
                {p.status === 'PENDING' ? (
                  <>
                    <button className="btn small" onClick={() => approve(p.id)}>
                      Aprobar
                    </button>
                    <input
                      type="text"
                      className="small-input"
                      placeholder="Motivo"
                      value={reason[p.id] || ''}
                      onChange={(e) =>
                        setReason({ ...reason, [p.id]: e.target.value })
                      }
                    />
                    <button className="btn small" onClick={() => reject(p.id)}>
                      Rechazar
                    </button>
                  </>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
