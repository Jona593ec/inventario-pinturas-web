import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, deleteProduct } from '../api'
import type { Product } from '../api'

type StatusTab = 'todos' | 'OK' | 'POR_VENCER' | 'VENCIDO'

export default function List() {
  const [items, setItems] = useState<Product[]>([])
  const [status, setStatus] = useState<StatusTab>('todos')
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState<string>('') // filtro por marca
  const [loading, setLoading] = useState<boolean>(true)
  const nav = useNavigate()

  // Mapeo correcto para la API (usa guion)
  function mapStatus(s: StatusTab) {
    if (s === 'todos') return undefined
    if (s === 'POR_VENCER') return 'por-vencer'
    return s.toLowerCase() // 'ok' | 'vencido'
  }

  async function load() {
    setLoading(true)
    const apiStatus = mapStatus(status)
    const { data } = await getProducts(apiStatus)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  // marcas únicas
  const brands = useMemo(() => {
    const set = new Set(items.map(i => (i.brand || '').trim()).filter(Boolean))
    return Array.from(set).sort((a,b)=>a.localeCompare(b))
  }, [items])

  // búsqueda + filtro marca
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    return items.filter(p => {
      const byQuery = !k || [p.code, p.name, p.brand].some(v => (v||'').toLowerCase().includes(k))
      const byBrand = !brand || (p.brand || '') === brand
      return byQuery && byBrand
    })
  }, [items, q, brand])

  return (
    <>
      <div className="section-title">
        <h2>Productos Pinturas</h2>
        <a className="btn btn-primary" href="/add">+ Agregar</a>
      </div>

      <div className="filters">
        <button className={`tab ${status==='todos'?'active':''}`} onClick={()=>setStatus('todos')}>Todos</button>
        <button className={`tab ${status==='OK'?'active':''}`} onClick={()=>setStatus('OK')}>OK</button>
        <button className={`tab ${status==='POR_VENCER'?'active':''}`} onClick={()=>setStatus('POR_VENCER')}>Por vencer</button>
        <button className={`tab ${status==='VENCIDO'?'active':''}`} onClick={()=>setStatus('VENCIDO')}>Vencido</button>
      </div>

      <div style={{display:'flex', gap:8, flexWrap:'wrap', margin:'10px 0'}}>
        <select className="select" value={brand} onChange={e=>setBrand(e.target.value)}>
          <option value="">Todas las marcas</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <input
          className="input"
          style={{flex:'1 1 260px'}}
          placeholder="Buscar (código, nombre, marca)"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />

        <a
          className="btn btn-ghost"
          href={`/reports/proforma${brand ? `?brand=${encodeURIComponent(brand)}` : ''}`}
          target="_blank"
          rel="noreferrer"
        >
          Proforma (PDF)
        </a>

        <a className="btn btn-ghost" href="/reports/csv" target="_blank" rel="noreferrer">Descargar CSV</a>
        <button className="btn btn-ghost" onClick={load}>Actualizar</button>
      </div>

      {/* Desktop: tabla */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Nombre</th><th>Marca</th><th>Cat.</th>
              <th>Present.</th><th>Vence</th><th>Estado</th><th>Cant.</th><th>$</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10}>Cargando…</td></tr>
            )}
            {!loading && filtered.length===0 && (
              <tr><td colSpan={10}>Sin resultados</td></tr>
            )}
            {!loading && filtered.map(p=>(
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>{p.category}</td>
                <td>{p.presentation}</td>
                <td>{String(p.expiryDate).slice(0,10).split('-').reverse().join('/')}</td>
                <td>
                  {p.status==='OK' && <span className="badge badge-ok">OK</span>}
                  {p.status==='POR_VENCER' && <span className="badge badge-warn">Por vencer</span>}
                  {p.status==='VENCIDO' && <span className="badge badge-error">Vencido</span>}
                </td>
                <td>{p.quantity}</td>
                <td>{Number(p.unitPrice).toFixed(2)}</td>
                <td>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    <button className="btn btn-primary" onClick={()=>nav(`/edit/${p.id}`)}>Editar</button>
                    <button className="btn btn-danger" onClick={async ()=>{ if(confirm('¿Eliminar este producto?')) { await deleteProduct(p.id); load(); } }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: cards */}
      <div className="cards">
        {filtered.map(p=>(
          <div className="card" key={p.id}>
            <div className="card-header">
              <div className="card-title">{p.name}</div>
              <div className="badge">{p.code}</div>
            </div>

            <div className="card-row"><b>Marca:</b><span>{p.brand}</span></div>
            <div className="card-row"><b>Vence:</b><span>{String(p.expiryDate).slice(0,10).split('-').reverse().join('/')}</span></div>
            <div className="card-row"><b>Presentación:</b><span>{p.presentation}</span></div>
            <div className="card-row"><b>Estado:</b>
              <span>
                {p.status==='OK' && <span className="badge badge-ok">OK</span>}
                {p.status==='POR_VENCER' && <span className="badge badge-warn">Por vencer</span>}
                {p.status==='VENCIDO' && <span className="badge badge-error">Vencido</span>}
              </span>
            </div>
            <div className="card-row"><b>Cant:</b><span>{p.quantity}</span></div>
            <div className="card-row"><b>$</b><span>{Number(p.unitPrice).toFixed(2)}</span></div>

            <div className="card-actions">
              <button className="btn btn-primary" onClick={()=>nav(`/edit/${p.id}`)}>Editar</button>
              <button className="btn btn-danger" onClick={async ()=>{ if(confirm('¿Eliminar este producto?')) { await deleteProduct(p.id); load(); } }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
