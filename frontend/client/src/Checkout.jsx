import { useState } from 'react'
import { createPortal } from 'react-dom'
import { createPayment } from './services/api'
import { YAPE_NUMBER } from './config'

const METHOD = 'YAPE'

export default function Checkout({ order, token, onDone, onBack }) {
  const [method, setMethod] = useState(METHOD)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [viewProof, setViewProof] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Selecciona una imagen válida')
      return
    }
    setError(null)
    setUploading(true)
    setPreview(null)
    setViewProof(false)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      setUploading(false)
    }
    reader.readAsDataURL(f)
  }

  const submit = async () => {
    if (method === 'YAPE' && !preview) {
      setError('Selecciona el comprobante de pago')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const body = {
        order_id: order.id,
        amount: order.total,
        method,
      }
      body.proof_image_url = preview
      await createPayment(body, token)
      setMessage('Comprobante enviado. Tu pago está siendo revisado.')
      setTimeout(onDone, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page checkout-page">
      <h2 className="page-title">
        <span>Finalizar pedido</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {message ? (
        <div className="card detail message-card">
          <p className="message">{message}</p>
        </div>
      ) : (
        <div className="checkout-grid">
          <section className="card payment-card">
            <h3>Método de pago</h3>
            <div className="yape-section">
              <div className="qr-placeholder">
                <span>QR Yape</span>
              </div>
              <p className="checkout-label">Número Yape</p>
              <p className="checkout-value">{YAPE_NUMBER}</p>
              <ol className="checkout-steps">
                <li>Abre Yape</li>
                <li>Escanea el QR</li>
                <li>Realiza el pago por S/ {order.total}</li>
                <li>Envía el comprobante</li>
              </ol>

              <div className="proof-section">
                <p className="checkout-label">Comprobante</p>
                {error && <p className="error">{error}</p>}

                {uploading ? (
                  <p className="upload-status">Cargando comprobante...</p>
                ) : preview ? (
                  <p className="upload-status success">Comprobante subido</p>
                ) : null}

                <label className="file-label">
                  {preview ? 'Cambiar comprobante' : 'Subir comprobante'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="file-input"
                  />
                </label>

                {preview && (
                  <button className="btn small secondary" onClick={() => setViewProof(true)}>
                    Ver comprobante
                  </button>
                )}

                {viewProof &&
                  createPortal(
                    <div className="proof-overlay" onClick={() => setViewProof(false)}>
                      <div className="proof-modal" onClick={(e) => e.stopPropagation()}>
                        <img src={preview} alt="Comprobante" />
                        <button className="btn small" onClick={() => setViewProof(false)}>
                          Cerrar
                        </button>
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            </div>

            <button className="btn full" onClick={submit} disabled={loading || uploading || !preview}>
              {loading ? 'Procesando...' : 'Confirmar pago'}
            </button>
          </section>

          <section className="card order-confirm">
            <h3>Pedido #{order.id}</h3>
            <p className="checkout-label">Total a pagar</p>
            <p className="checkout-amount">S/ {order.total}</p>
            <p className="checkout-label">Productos</p>
            <ul className="checkout-items">
              {(order.items || []).map((i) => (
                <li key={i.id || i.product_id}>
                  {i.product_name} × {i.quantity} — S/ {i.subtotal}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  )
}
