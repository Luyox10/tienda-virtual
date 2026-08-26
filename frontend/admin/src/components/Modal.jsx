export default function Modal({ title, children, onClose, onConfirm, confirmText = 'Confirmar', confirmClass = 'btn', cancelText = 'Cancelar' }) {
  if (!title && !children) return null
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3 id="modal-title" className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>{cancelText}</button>
          {onConfirm && (
            <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
          )}
        </div>
      </div>
    </div>
  )
}
