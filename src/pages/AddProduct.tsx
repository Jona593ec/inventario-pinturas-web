// src/pages/AddProduct.tsx
import React, { useState } from 'react';
import { createProduct } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import { Button } from '../components/ui';

export default function AddProduct() {
  const [showScan, setShowScan] = useState(false);
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const [form, setForm] = useState({
    code: '',
    batch: '',
    name: '',
    brand: '',
    category: 'Pintura',
    subtype: '',
    presentation: 'Galón',
    expiryDate: '',
    quantity: 1,
    unitPrice: 0,
  });

  function set<K extends keyof typeof form>(k: K, v: any) {
    setForm(s => ({ ...s, [k]: v }));
  }

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
      await createProduct(payload);
      setMsg('✅ Guardado');
      setTimeout(()=>nav('/'), 600);
    } catch (err:any) {
      setMsg('❌ Error al guardar');
      console.error(err);
    }
  }

  return (
    <div className="container" style={{maxWidth: 900, marginInline:'auto', padding:16}}>
      <nav style={{marginBottom:12, display:'flex', gap:12}}>
        <Link to="/">Listado</Link>
        <span>Agregar</span>
      </nav>

      <h1 style={{fontSize: 26, fontWeight: 700, marginBottom: 16}}>Agregar producto</h1>

      <details style={{background:'#f8fafc', padding:12, borderRadius:8, marginBottom:16}} open={false}>
        <summary style={{cursor:'pointer'}} onClick={()=>setShowScan(s=>!s)}>📷 Escanear código</summary>
        {showScan && (
          <div style={{marginTop:12}}>
            <small>Apunta la cámara al código de barras.</small>
            <BarcodeScanner
              onResult={(code)=> set('code', code)}
              onError={(e)=> console.warn(e)}
            />
          </div>
        )}
      </details>

      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <Row>
          <Field label="Código">
            <input value={form.code} onChange={e=>set('code', e.target.value)} />
          </Field>
          <Field label="Lote (opcional)">
            <input value={form.batch} onChange={e=>set('batch', e.target.value)} />
          </Field>
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
          <Button type="submit">💾 Guardar</Button>
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
      <div style={{display:'grid'}}>
        {children as any}
      </div>
      <style>{`
        input, select { height:40px; padding:0 12px; border:1px solid #d0d5dd; border-radius:8px; }
        input:focus, select:focus { outline: 2px solid #818cf8; border-color: #818cf8; }
      `}</style>
    </label>
  );
}
