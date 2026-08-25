import { useState, useEffect } from 'react'
import { register, login } from './services/api'
import { getProducts } from './services/productsService'
import { getShifts, getCurrentShift } from './services/shiftsService'
import Home from './Home'
import Cart from './Cart'
import Orders from './Orders'
import './styles.css'

function App() {
  const [view, setView] = useState('login')
  const [auth, setAuth] = useState(null)
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
    const saved = localStorage.getItem('customer')
    if (saved) setAuth(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!auth) return
    Promise.all([getProducts(), getShifts(), getCurrentShift()])
      .then(([p, s, c]) => {
        setProducts(p)
        setShifts(s)
        setCurrent(c)
      })
      .catch((e) => setError(e.message))
  }, [auth])

  const handleLogin = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      const data = await login({
        email: form.get('email'),
        password: form.get('password'),
      })
      localStorage.setItem('customer', JSON.stringify(data))
      setAuth(data)
      setView('home')
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      const data = await register({
        full_name: form.get('full_name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
      })
      localStorage.setItem('customer', JSON.stringify(data))
      setAuth(data)
      setView('home')
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('customer')
    setAuth(null)
    setProducts([])
    setShifts([])
    setCurrent(null)
    setCart([])
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

  if (auth) {
    return (
      <div className="container">
        <header className="app-header">
          <div className="inner">
            <div className="brand">
              <span className="brand-dot" />
              DeliTurnos
            </div>
            <nav className="nav">
              <span className="user-pill">{auth.user.email}</span>
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
              <button onClick={logout} className="btn secondary">Salir</button>
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
            token={auth.token}
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
            token={auth.token}
            onBack={() => setView('home')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="brand"><span className="brand-dot" />DeliTurnos</h1>
      {error && <p className="error">{error}</p>}

      {view === 'login' ? (
        <form onSubmit={handleLogin} className="form">
          <h2>Iniciar sesión</h2>
          <input name="email" type="email" placeholder="Correo" required />
          <input name="password" type="password" placeholder="Contraseña" required />
          <button type="submit" className="btn">Ingresar</button>
          <p>
            ¿No tienes cuenta?{' '}
            <button type="button" className="link" onClick={() => setView('register')}>
              Regístrate
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form">
          <h2>Crear cuenta</h2>
          <input name="full_name" placeholder="Nombre completo" required />
          <input name="email" type="email" placeholder="Correo" required />
          <input name="phone" placeholder="Teléfono" />
          <input name="password" type="password" placeholder="Contraseña" required />
          <button type="submit" className="btn">Registrarse</button>
          <p>
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="link" onClick={() => setView('login')}>
              Inicia sesión
            </button>
          </p>
        </form>
      )}
    </div>
  )
}

export default App
