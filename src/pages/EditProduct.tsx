// src/pages/EditProduct.tsx
import React, { useEffect, useState } from 'react';
import { getProduct, updateProduct } from '../api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import { Button } from '../components/ui';

export default function EditProduct() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [showScan, setShowScan] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    code: '',
    batch: '',
    name: '',
    brand: '',
    category: 'Pintura',
    subtype: '',
    presentation: 'Galón',
    expiryDate: '',
    quantity: 0,
    unitPrice: 0,
  });

  function set<K extends keyof typeof form>(k: K, v: any) {
    setForm(s => ({ ...s, [k]: v }));
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProduct(id);
        setForm({
          code: data.code || '',
          batch: data.batch || '',
          name: data.name || '',
          brand: data.brand || '',
          category: data.category || 'Pintura',
          subtype: data.subtype || '',
          presentation: data.presentation || 'Galón',
          expiryDate: (data.expiryDate || '').slice(0,10),
          quantity: Number(data.quantity) || 0,
          unitPrice: Number(data.unitPrice) || 0,
        });
        setMsg('');
      } catch (e:any) {
        setMsg('⚠️ No se pudo cargar el producto (puede que no exista).');
      }
    })();
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Guardando…');
    try {
      const payload = {
        ...form,
        batch: form.batch || null,
        subtype: form.subtype || null,
        expiryDate: form.expiryDate,
        quantity: Number(form.quantity),
        unitPrice: Number(String(form.unitPrice).replace(',', '.')),
      };
      await updateProduct(id, payload);
      setMsg('✅ Actualizado');
      setTimeout(()=>nav('/'), 600);
    } catch (err:any) {
      setMsg('❌ Error al actualizar');
      console.error(err);
    }
  }

  return (
    <div className="container" style={{maxWidth: 900, marginInline:'auto', padding:16}}>
      <nav style={{marginBottom:12, display:'flex', gap:12}}>
        <Link to="/">Listado</Link>
        <span>Editar</span>
      </nav>

      <h1 style={{fontSize: 26, fontWeight: 700, marginBottom: 16}}>Editar producto</h1>

      <details style={{background:'#f8fafc', padding:12, borderRadius:8, marginBottom:16}}>
        <summary style={{cursor:'pointer'}} onClick={()=>setShowScan(s=>!s)}>📷 Escanear nuevo código</summary>
        {showScan && (
          <div style={{marginTop:12}}>
            <BarcodeScanner onResult={(code)=> set('code', code)} onError={(e)=> console.warn(e)} />
          </div>
        )}
      </details>

      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <Row>
          <Field label="Código"><input value={form.code} onChange={e=>set('code', e.target.value)} /></Field>
          <Field label="Lote (opcional)"><input value={form.batch} onChange={e=>set('batch', e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Nombre"><input value={form.name} onChange={e=>set('name', e.target.value)} /></Field>
          <Field label="Marca"><input value={form.brand} onChange={e=>set('brand', e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Subtipo"><input value={form.subtype} onChange={e=>set('subtype', e.target.value)} /></Field>
          <Field label="Categoría">
            <select value={form.category} onChange={e=>set('category', e.target.value)}>
              <option>Pintura</option><option>Silicona</option><option>Empaste</option><option>Accesorios</option>
            </select>
          </Field>
          <Field label="Presentación">
            <select value={form.presentation} onChange={e=>set('presentation', e.target.value)}>
              <option>Litro</option><option>Galón</option><option>Caneca</option>
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="Fecha de caducidad">
            <input type="date" value={form.expiryDate} onChange={e=>set('expiryDate', e.target.value)} />
          </Field>
          <Field label="Cantidad">
            <input type="number" value={form.quantity} onChange={e=>set('quantity', e.target.value)} />
          </Field>
          <Field label="Precio unitario (USD)">
            <input value={String(form.unitPrice)} onChange={e=>set('unitPrice', e.target.value)} />
          </Field>
        </Row>

        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <Button type="submit">💾 Guardar cambios</Button>
          <Link to="/"><Button variant="ghost">↩ Volver</Button></Link>
        </div>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}

function Row({children}:{children:React.ReactNode}) {
  return <div style={{display:'grid', gap:12, gridTemplateColumns:'1fr 1fr 1fr'}}>{children}</div>;
}
function Field({label, children}:{label:string; children:React.ReactNode}) {
  return (
    <label style={{display:'grid', gap:6}}>
      <span style={{fontSize:12, color:'#475569'}}>{label}</span>
      <div style={{display:'grid'}}>{children as any}</div>
      <style>{`
        input, select { height:40px; padding:0 12px; border:1px solid #d0d5dd; border-radius:8px; }
        input:focus, select:focus { outline: 2px solid #818cf8; border-color: #818cf8; }
      `}</style>
    </label>
  );
}
