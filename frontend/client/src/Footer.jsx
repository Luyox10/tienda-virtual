export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="inner footer-inner">
        <p className="footer-brand">SaborDelicioso</p>
        <nav className="footer-links" aria-label="Enlaces del pie">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Subir</button>
          <span>·</span>
          <span>Lima, Perú</span>
          <span>·</span>
          <span>© {new Date().getFullYear()}</span>
        </nav>
      </div>
    </footer>
  )
}
