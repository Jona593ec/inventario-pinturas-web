import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api';
import type { Product } from '../api';

// ==== Utils ====
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function fmtDate(iso?: string) {
  if (!iso) return '';
  try {
    return String(iso).slice(0, 10).split('-').reverse().join('/');
  } catch {
    return String(iso);
  }
}

function fmtMoney(n: number | string) {
  const num = Number(n ?? 0);
  return num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ==== Page ====
export default function List() {
  const nav = useNavigate();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<'todos' | 'OK' | 'POR_VENCER' | 'VENCIDO'>('todos');
  const [brand, setBrand] = useState<string>('');
  const [q, setQ] = useState<string>('');

  async function load() {
    setLoading(true);
    const s = status === 'todos' ? undefined : status.toLowerCase();
    const { data } = await getProducts(s);
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // marcas únicas (alfabético)
  const brands = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // contadores por estado
  const counts = useMemo(() => {
    let ok = 0, pv = 0, ve = 0;
    items.forEach((p) => {
      if (p.status === 'OK') ok++;
      else if (p.status === 'POR_VENCER') pv++;
      else if (p.status === 'VENCIDO') ve++;
    });
    return { ok, pv, ve, total: items.length };
  }, [items]);

  // aplicar filtros (marca + búsqueda)
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items.filter((p) => {
      if (brand && p.brand !== brand) return false;
      if (!k) return true;
      return (
        (p.code || '').toLowerCase().includes(k) ||
        (p.name || '').toLowerCase().includes(k) ||
        (p.brand || '').toLowerCase().includes(k)
      );
    });
  }, [items, brand, q]);

  // enlaces de reportes (API RailWay)
  const proformaHref = brand
    ? `${API}/reports/proforma?brand=${encodeURIComponent(brand)}`
    : undefined; // se habilita solo si hay marca elegida
  const csvHref = `${API}/reports/csv`;

  return (
    <div className="container" style={{ maxWidth: 1180, marginInline: 'auto', padding: 12 }}>
      {/* Encabezado / acción rápida */}
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0 18px' }}>
        <h2 style={{ margin: 0 }}>Productos Pinturas</h2>
        <Link to="/add" className="btn btn-primary">+ Agregar</Link>
      </div>

      {/* Filtros arriba */}
      <div className="filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {/* Tabs de estado con contadores */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`tab ${status === 'todos' ? 'active' : ''}`} onClick={() => setStatus('todos')}>
            Todos <span className="badge-count">{counts.total}</span>
          </button>
          <button className={`tab ${status === 'OK' ? 'active' : ''}`} onClick={() => setStatus('OK')}>
            OK <span className="badge-count">{counts.ok}</span>
          </button>
          <button className={`tab ${status === 'POR_VENCER' ? 'active' : ''}`} onClick={() => setStatus('POR_VENCER')}>
            Por vencer <span className="badge-count">{counts.pv}</span>
          </button>
          <button className={`tab ${status === 'VENCIDO' ? 'active' : ''}`} onClick={() => setStatus('VENCIDO')}>
            Vencido <span className="badge-count">{counts.ve}</span>
          </button>
        </div>

        {/* Select marca */}
        <select
          className="select"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={{ minWidth: 180 }}
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Búsqueda */}
        <input
          className="input"
          style={{ flex: '1 1 260px', minWidth: 220 }}
          placeholder="Buscar (código, nombre, marca)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {/* Reportes */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            className={`btn btn-ghost ${!proformaHref ? 'disabled' : ''}`}
            href={proformaHref || '#'}
            target="_blank"
            rel="noreferrer"
            title={!proformaHref ? 'Elige una marca para habilitar' : 'Abrir proforma en PDF'}
            onClick={(e) => {
              if (!proformaHref) e.preventDefault();
            }}
          >
            Proforma (PDF)
          </a>

          <a className="btn btn-ghost" href={csvHref} target="_blank" rel="noreferrer">
            Descargar CSV
          </a>

          <button className="btn btn-ghost" onClick={load}>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Cat.</th>
              <th>Present.</th>
              <th>Vence</th>
              <th>Estado</th>
              <th>Cant.</th>
              <th>$</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={10}>Cargando…</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={10}>Sin resultados</td>
              </tr>
            )}

            {!loading &&
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>{p.category}</td>
                  <td>{p.presentation}</td>
                  <td>{fmtDate(p.expiryDate)}</td>
                  <td>
                    {p.status === 'OK' && <span className="badge badge-ok">OK</span>}
                    {p.status === 'POR_VENCER' && <span className="badge badge-warn">Por vencer</span>}
                    {p.status === 'VENCIDO' && <span className="badge badge-error">Vencido</span>}
                  </td>
                  <td>{p.quantity}</td>
                  <td>{fmtMoney(p.unitPrice)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => nav(`/edit/${p.id}`)}>
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={async () => {
                          if (confirm('¿Eliminar este producto?')) {
                            await deleteProduct(p.id);
                            load();
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
