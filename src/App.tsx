import { Routes, Route } from 'react-router-dom'
import List from './pages/List'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Header from './components/Header'
import './App.css'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="container">{children}</div>
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
