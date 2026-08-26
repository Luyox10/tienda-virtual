import { useEffect, useState } from 'react'
import { getPayments, approvePayment, rejectPayment } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

export default function Payments({ token }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [reason, setReason] = useState({})
  const [rejectModal, setRejectModal] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getPayments(token)
      .then((data) => {
        setPayments(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [token])

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
      setReason({ ...reason, [id]: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="loading-message">Cargando pagos...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Pagos" subtitle="Revisa y valida los pagos realizados por los clientes." />
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <section className="dashboard-section">
        <h2 className="section-title">Pagos</h2>
        <DataTable headers={['ID', 'Pedido', 'Método', 'Monto', 'Estado', 'Comprobante', 'Acciones']}>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">No hay pagos registrados.</td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>#{p.order_id}</td>
                <td>{p.method}</td>
                <td>S/ {p.amount}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  {p.voucher_url ? (
                    <a href={p.voucher_url} target="_blank" rel="noreferrer" className="btn small secondary">
                      Ver comprobante
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {p.status === 'PENDING' ? (
                    <div className="payment-row-actions">
                      <button className="btn small" onClick={() => approve(p.id)}>
                        Aprobar
                      </button>
                      <button
                        className="btn small secondary"
                        onClick={() => setRejectModal({ id: p.id, amount: p.amount })}
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      {rejectModal && (
        <Modal
          title={`¿Deseas rechazar el pago #${rejectModal.id}?`}
          onClose={() => setRejectModal(null)}
          onConfirm={() => {
            reject(rejectModal.id)
            setRejectModal(null)
          }}
          confirmText="Rechazar pago"
          confirmClass="btn danger"
        >
          <div className="reject-modal">
            <p>Monto: S/ {rejectModal.amount}</p>
            <label htmlFor="reject-reason">Motivo del rechazo</label>
            <input
              id="reject-reason"
              value={reason[rejectModal.id] || ''}
              onChange={(e) =>
                setReason({ ...reason, [rejectModal.id]: e.target.value })
              }
              placeholder="Escribe el motivo"
              className="small-input full"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
