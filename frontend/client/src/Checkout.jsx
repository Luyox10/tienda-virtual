import { useState } from 'react'
import { createPayment } from './services/api'
import { YAPE_NUMBER } from './config'

export default function Checkout({ order, token, onDone, onBack }) {
  const [preview, setPreview] = useState(null)
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
    setFile(f)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const submit = async () => {
    if (!preview) {
      setError('Selecciona el comprobante de pago')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await createPayment(
        {
          order_id: order.id,
          amount: order.total,
          proof_image_url: preview,
          method: 'YAPE',
        },
        token
      )
      setMessage('Comprobante enviado. Tu pago está siendo revisado.')
      setTimeout(onDone, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">
        <span>Pagar con Yape</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {message ? (
        <div className="card detail message-card">
          <p className="message">{message}</p>
        </div>
      ) : (
        <div className="card checkout-card">
          <div className="checkout-section">
            <div className="qr-placeholder">
              <span>QR Yape</span>
            </div>
          </div>

          <div className="checkout-info">
            <p className="checkout-label">Número Yape</p>
            <p className="checkout-value">{YAPE_NUMBER}</p>

            <p className="checkout-label">Monto a pagar</p>
            <p className="checkout-amount">S/ {order.total}</p>

            <ol className="checkout-steps">
              <li>Escanea el QR.</li>
              <li>Realiza el pago por S/ {order.total}.</li>
              <li>Guarda la captura del comprobante.</li>
              <li>Selecciona y envía la imagen.</li>
            </ol>
          </div>

          <div className="proof-section">
            <p className="checkout-label">Comprobante</p>
            {error && <p className="error">{error}</p>}

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
              <div className="proof-preview">
                <img src={preview} alt="Comprobante" />
              </div>
            )}

            <button
              className="btn"
              onClick={submit}
              disabled={!preview || loading}
            >
              {loading ? 'Enviando...' : 'Enviar comprobante'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
