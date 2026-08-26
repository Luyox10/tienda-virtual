import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { getProducts } from './services/productsService'
import { getShifts, getCurrentShift } from './services/shiftsService'
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
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([getProducts(), getShifts(), getCurrentShift()])
      .then(([p, s, c]) => {
        setProducts(p)
        setShifts(s)
        setCurrent(c)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = () => {
    setView(returnTo || 'home')
    setReturnTo(null)
  }
  const handleRegister = () => {
    setView(returnTo || 'home')
    setReturnTo(null)
  }
  const handleLogout = () => {
    logout()
    setView('home')
    setCurrentOrder(null)
  }
  const navigateTo = (v) => {
    setView(v)
    setCurrentOrder(null)
  }
  const requireAuth = (v) => {
    if (isAuthenticated) {
      setView(v)
    } else {
      setReturnTo(v)
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
          current={current}
          onAdd={addToCart}
          setView={setView}
        />
      )
    }

    if (view === 'products') {
      return <ProductsPage products={products} current={current} onAdd={addToCart} />
    }

    if (view === 'contact') {
      return (
        <main className="page contact-page card">
          <h1 className="page-title center">Contacto</h1>
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
        <main className="page card auth-message">
          <h2>Mis pedidos</h2>
          <p>Inicia sesión para ver el registro de tus pedidos.</p>
          <button className="btn" onClick={() => setView('login')}>
            Iniciar sesión
          </button>
          <button className="btn secondary" onClick={() => setView('home')}>
            Volver al inicio
          </button>
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
