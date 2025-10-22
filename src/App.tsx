// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom'
import List from './pages/List'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import './App.css'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="header">
        <div className="brand">
          <img src="/ferrisariato.png" alt="Ferrisariato" className="logo" />
          <h1>Productos Pinturas</h1>
        </div>

        {/* Solo un botón global de acción */}
        <div className="actions">
          <Link to="/add" className="btn btn-primary">+ Agregar</Link>
        </div>
      </header>

      <main className="container">{children}</main>
    </>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/edit/:id" element={<EditProduct />} />
      </Routes>
    </Layout>
  )
}
