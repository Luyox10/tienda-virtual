import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { getProducts } from './services/productsService'
import { getShifts, getCurrentShift } from './services/shiftsService'
import { createOrder } from './services/api'
import Loading from './Loading'
import Header from './Header'
import Footer from './Footer'
import Login from './Login'
import Register from './Register'
import Home from './Home'
import ProductsPage from './ProductsPage'
import Cart from './Cart'
import Orders from './Orders'
import Checkout from './Checkout'
import Profile from './Profile'
import MobileNav from './MobileNav'
import './styles.css'

function App() {
  const { isAuthenticated, user, token, logout } = useAuth()
  const [view, setView] = useState('home')
  const [returnTo, setReturnTo] = useState(null)
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [current, setCurrent] = useState(null)
  const [error, setError] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [postLoginAction, setPostLoginAction] = useState(null)
  const [cart, setCart] = useState(() => {
    const saved = sessionStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!isAuthenticated || !postLoginAction || !token) return
    if (postLoginAction.type === 'orders') {
      if (cart.length > 0) {
        const items = cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        }))
        createOrder(items, token)
          .then(() => {
            setCart([])
            setPostLoginAction(null)
            setView('orders')
          })
          .catch((err) => {
            setError(err.message)
            setPostLoginAction(null)
            setView('orders')
          })
      } else {
        setPostLoginAction(null)
        setView('orders')
      }
    }
  }, [isAuthenticated, postLoginAction, token, cart])

  const loadData = (silent = false) => {
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    Promise.all([getProducts(), getShifts(), getCurrentShift()])
      .then(([p, s, c]) => {
        setProducts(p)
        setShifts(s)
        setCurrent(c)
      })
      .catch((e) => {
        if (!silent) setError(e.message)
      })
      .finally(() => {
        if (!silent) setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    if (!postLoginAction) {
      setView(returnTo || 'home')
    }
    setReturnTo(null)
  }
  const handleRegister = () => {
    const target = returnTo || 'orders'
    setReturnTo(null)
    if (target === 'orders') {
      setPostLoginAction({ type: 'orders' })
    } else {
      setView(target)
    }
  }
  const handleLogout = () => {
    logout()
    setCart([])
    setCurrentOrder(null)
    setReturnTo(null)
    setPostLoginAction(null)
    sessionStorage.removeItem('cart')
    localStorage.removeItem('cart')
    setView('home')
  }
  const navigateTo = (v) => {
    if ((v === 'orders' || v === 'profile') && !isAuthenticated) {
      requireAuth(v)
      return
    }
    setView(v)
    setCurrentOrder(null)
  }
  const requireAuth = (v) => {
    if (isAuthenticated) {
      setView(v)
    } else {
      setReturnTo(v)
      setPostLoginAction(v === 'orders' ? { type: 'orders' } : null)
      setView('login')
    }
    setCurrentOrder(null)
  }

  const addToCart = (product, quantity) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          quantity,
          name: product.name,
          price: product.price,
        },
      ]
    })
  }

  const updateCart = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product_id !== productId))
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product_id === productId ? { ...i, quantity } : i
        )
      )
    }
  }

  const clearCart = () => setCart([])

  const renderMain = () => {
    if (view === 'login' || view === 'register') {
      return (
        <div className="auth-wrapper">
          {view === 'login' ? (
            <Login onToggle={() => setView('register')} onSuccess={handleLogin} />
          ) : (
            <Register onToggle={() => setView('login')} onSuccess={handleRegister} />
          )}
        </div>
      )
    }

    if (view === 'home') {
      return (
        <Home
          products={products}
          shifts={shifts}
          current={current}
          onAdd={addToCart}
          setView={setView}
        />
      )
    }

    if (view === 'products') {
      return <ProductsPage products={products} shifts={shifts} current={current} onAdd={addToCart} />
    }

    if (view === 'contact') {
      return (
        <main className="page contact-page">
          <section className="page-hero" aria-label="Contacto">
            <div className="page-hero-content">
              <span className="page-hero-eyebrow">CONTÁCTANOS</span>
              <h1 className="page-hero-title">Contacto</h1>
              <p className="page-hero-subtitle">Pronto podrás contactarnos directamente desde aquí.</p>
            </div>

            <div className="page-hero-visual" aria-hidden="true">
              <img src="/imagenes/hero-home.svg" alt="Sabor Delicioso" className="page-hero-img" />
            </div>
          </section>

          <p className="empty">Pronto podrás contactarnos directamente desde aquí.</p>
        </main>
      )
    }

    if (view === 'cart') {
      return (
        <Cart
          cart={cart}
          products={products}
          isAuthenticated={isAuthenticated}
          token={token}
          shifts={shifts}
          onUpdate={updateCart}
          onClear={clearCart}
          onBack={() => setView('home')}
          onLogin={() => requireAuth('cart')}
          onOrder={(o) => {
            setCurrentOrder(o)
            setView('checkout')
          }}
        />
      )
    }

    if (view === 'orders') {
      if (isAuthenticated) {
        return (
          <Orders
            token={token}
            onBack={() => setView('home')}
            onPay={(o) => {
              setCurrentOrder(o)
              setView('checkout')
            }}
          />
        )
      }
      return (
        <main className="page auth-message">
          <h2 className="page-title center">Mis pedidos</h2>
          <p className="empty">Inicia sesión para ver el registro de tus pedidos.</p>
          <div className="auth-actions">
            <button className="btn" onClick={() => setView('login')}>
              Iniciar sesión
            </button>
            <button className="btn secondary" onClick={() => setView('home')}>
              Volver al inicio
            </button>
          </div>
        </main>
      )
    }

    if (view === 'checkout') {
      return currentOrder && isAuthenticated ? (
        <Checkout
          order={currentOrder}
          token={token}
          onDone={() => {
            setView('orders')
            setCurrentOrder(null)
          }}
          onBack={() => setView('orders')}
        />
      ) : null
    }

    if (view === 'profile') {
      if (isAuthenticated) {
        return <Profile user={user} onLogout={handleLogout} />
      }
      return (
        <main className="page auth-message">
          <h2 className="page-title center">Mi cuenta</h2>
          <p className="empty">Inicia sesión para ver tu perfil.</p>
          <button className="btn" onClick={() => setView('login')}>
            Iniciar sesión
          </button>
        </main>
      )
    }

    return null
  }

  return (
    <div className="app-container">
      <Header
        view={view}
        onNavigate={navigateTo}
        isAuthenticated={isAuthenticated}
        user={user}
        cartCount={cart.reduce((a, i) => a + i.quantity, 0)}
        onLogout={handleLogout}
      />

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <Loading message="Cargando productos..." />}

      {!loading && renderMain()}

      <Footer />

      <MobileNav
        view={view}
        onNavigate={navigateTo}
        isAuthenticated={isAuthenticated}
        cartCount={cart.reduce((a, i) => a + i.quantity, 0)}
        onLogin={() => setView('login')}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App
