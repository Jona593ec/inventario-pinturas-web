import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProduct } from '../api';

type Form = {
  code: string;
  batch?: string | null;
  name: string;
  brand: string;
  category: 'Pintura' | 'Empaste' | 'Silicona' | 'Accesorios' | '';
  subtype?: string | null;
  presentation: string;
  color?: string | null;
  expiryDate: string;        // yyyy-mm-dd
  quantity: number;
  unitPrice: number | string;
  currency: 'USD' | 'PEN' | 'COP' | 'EUR';
  comment?: string;
};

const CATEGORY_OPTIONS = ['Pintura', 'Empaste', 'Silicona', 'Accesorios'] as const;

const PRESENTATION_BY_CATEGORY: Record<string, string[]> = {
  Pintura: ['Caneca', 'Galón', 'Litro', '1/8'],
  Empaste: ['20 kg', '10 kg', '5 kg'],
  Silicona: ['Tubo', 'Cartucho', 'Otro'],
  Accesorios: ['Unidad', 'Paquete'],
};

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span>{props.label}</span>
      {props.children}
    </label>
  );
}
function Row(props: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
      {props.children}
    </div>
  );
}

export default function AddProduct() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState<Form>({
    code: '',
    batch: '',
    name: '',
    brand: '',
    category: '',
    subtype: '',
    presentation: '',
    color: '',
    expiryDate: '',
    quantity: 1,
    unitPrice: 0,
    currency: 'USD',
    comment: '',
  });

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm(s => ({ ...s, [k]: v }));
  }

  // Cuando cambia categoría, setear una presentación por defecto válida
  function handleCategoryChange(next: Form['category']) {
    const list = PRESENTATION_BY_CATEGORY[next] ?? [];
    setForm(s => ({
      ...s,
      category: next,
      presentation: list[0] ?? '',
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg('Guardando…');

      // Normalizaciones mínimas
      const payload = {
        ...form,
        batch: (form.batch ?? '').toString().trim() || null,
        subtype: (form.subtype ?? '').toString().trim() || null,
        color: (form.color ?? '').toString().trim() || null,
        quantity: Number(form.quantity) || 0,
        unitPrice: String(form.unitPrice).replace(',', '.'),
      };

      await createProduct(payload);
      setMsg('✅ Guardado');
      setTimeout(() => nav('/'), 500);
    } catch (err: any) {
      console.error(err);
      setMsg('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const presentationOptions =
    PRESENTATION_BY_CATEGORY[form.category || ''] ?? [];

  return (
    <div className="container">
      <nav style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
        <Link to="/" className="btn btn-ghost">Listado</Link>
        <span>Agregar</span>
      </nav>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Agregar producto</h1>

      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <Row>
          <Field label="Código">
            <input
              value={form.code}
              onChange={e => set('code', e.target.value)}
              required
            />
          </Field>
          <Field label="Lote (opcional)">
            <input
              value={form.batch ?? ''}
              onChange={e => set('batch', e.target.value)}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Nombre">
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </Field>
          <Field label="Marca">
            <input
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              required
            />
          </Field>
        </Row>

        <Row>
          <Field label="Subtipo">
            <input
              value={form.subtype ?? ''}
              onChange={e => set('subtype', e.target.value)}
              placeholder="Mate / Brillante / etc."
            />
          </Field>

          <Field label="Categoría">
            <select
              value={form.category}
              onChange={e => handleCategoryChange(e.target.value as Form['category'])}
              required
            >
              <option value="">Selecciona…</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="Presentación">
            <select
              value={form.presentation}
              onChange={e => set('presentation', e.target.value)}
              required
              disabled={!form.category}
            >
              {presentationOptions.length === 0 && (
                <option value="">Selecciona categoría primero</option>
              )}
              {presentationOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="Color (opcional)">
            <input
              value={form.color ?? ''}
              onChange={e => set('color', e.target.value)}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Fecha de caducidad">
            <input
              type="date"
              value={form.expiryDate}
              onChange={e => set('expiryDate', e.target.value)}
              required
            />
          </Field>

          <Field label="Cantidad">
            <input
              type="number"
              min={0}
              value={form.quantity}
              onChange={e => set('quantity', Number(e.target.value))}
              required
            />
          </Field>
        </Row>

        <Row>
          <Field label="Precio unitario (USD)">
            <input
              inputMode="decimal"
              value={form.unitPrice}
              onChange={e => set('unitPrice', e.target.value)}
              required
              placeholder="17.25"
            />
          </Field>

          <Field label="Moneda">
            <select
              value={form.currency}
              onChange={e => set('currency', e.target.value as Form['currency'])}
            >
              <option>USD</option>
              <option>PEN</option>
              <option>COP</option>
              <option>EUR</option>
            </select>
          </Field>
        </Row>

        <Field label="Comentario (opcional)">
          <textarea
            rows={2}
            value={form.comment ?? ''}
            onChange={e => set('comment', e.target.value)}
          />
        </Field>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <Link to="/" className="btn btn-ghost">Volver</Link>
        </div>

        {msg && <small style={{ color: '#64748b' }}>{msg}</small>}
      </form>
    </div>
  );
}
