import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { getProducts } from './services/productsService'
import { getShifts, getCurrentShift } from './services/shiftsService'
import Login from './Login'
import Register from './Register'
import Home from './Home'
import Cart from './Cart'
import Orders from './Orders'
import './styles.css'

function App() {
  const { isAuthenticated, user, token, logout } = useAuth()
  const [view, setView] = useState('login')
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [current, setCurrent] = useState(null)
  const [error, setError] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!isAuthenticated) {
      setProducts([])
      setShifts([])
      setCurrent(null)
      return
    }
    Promise.all([getProducts(), getShifts(), getCurrentShift()])
      .then(([p, s, c]) => {
        setProducts(p)
        setShifts(s)
        setCurrent(c)
      })
      .catch((e) => setError(e.message))
  }, [isAuthenticated])

  const handleLogin = () => setView('home')
  const handleRegister = () => setView('home')
  const handleLogout = () => {
    logout()
    setView('login')
    setLastOrder(null)
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

  if (isAuthenticated) {
    return (
      <div className="container">
        <header className="app-header">
          <div className="inner">
            <div className="brand">
              <span className="brand-dot" />
              DeliTurnos
            </div>
            <nav className="nav">
              <span className="user-pill">{user.email}</span>
              <button
                className={view === 'home' ? 'btn active' : 'btn'}
                onClick={() => { setView('home'); setLastOrder(null) }}
              >
                Inicio
              </button>
              <button
                className={view === 'cart' ? 'btn active' : 'btn'}
                onClick={() => { setView('cart'); setLastOrder(null) }}
              >
                Carrito ({cart.reduce((a, i) => a + i.quantity, 0)})
              </button>
              <button
                className={view === 'orders' ? 'btn active' : 'btn'}
                onClick={() => { setView('orders'); setLastOrder(null) }}
              >
                Pedidos
              </button>
              <button onClick={handleLogout} className="btn secondary">Salir</button>
            </nav>
          </div>
        </header>

        {error && <p className="error">{error}</p>}
        {lastOrder && (
          <div className="message">
            <p>Pedido #{lastOrder.id} creado. Total: S/ {lastOrder.total}</p>
          </div>
        )}

        {view === 'home' && (
          <Home
            products={products}
            shifts={shifts}
            current={current}
            cart={cart}
            onAdd={addToCart}
            setView={setView}
          />
        )}

        {view === 'cart' && (
          <Cart
            cart={cart}
            products={products}
            token={token}
            onUpdate={updateCart}
            onClear={clearCart}
            onBack={() => setView('home')}
            onOrder={(o) => {
              setLastOrder(o)
              setView('orders')
            }}
          />
        )}

        {view === 'orders' && (
          <Orders
            token={token}
            onBack={() => setView('home')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="container auth-container">
      <div className="brand auth-brand">
        <span className="brand-dot" />
        DeliTurnos
      </div>

      {view === 'orders' ? (
        <div className="card auth-message">
          <h2>Mis pedidos</h2>
          <p>Regístrate o inicia sesión para consultar tus pedidos.</p>
          <button className="btn" onClick={() => setView('login')}>
            Iniciar sesión
          </button>
        </div>
      ) : view === 'login' ? (
        <Login onToggle={() => setView('register')} onSuccess={handleLogin} />
      ) : (
        <Register onToggle={() => setView('login')} onSuccess={handleRegister} />
      )}
    </div>
  )
}

export default App
