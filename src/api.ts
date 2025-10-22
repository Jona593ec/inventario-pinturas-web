import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export type Product = {
  id: string;
  code: string;
  batch?: string | null;
  name: string;
  brand: string;
  category: string;
  subtype?: string | null;
  presentation: string;
  color?: string | null;
  expiryDate: string;
  entryDate?: string;
  location?: string | null;
  quantity: number;
  unitPrice: number | string;
  currency: string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  daysLeft?: number;
  status?: 'OK' | 'POR_VENCER' | 'VENCIDO';
};

export const getProducts = (status?: string) =>
  api.get<Product[]>(status ? `/products?status=${status}` : '/products');

export const getProduct = (id: string) =>
  api.get<Product>(`/products/${id}`);

export const createProduct = (p: Partial<Product>) =>
  api.post('/products', p);

export const updateProduct = (id: string, p: Partial<Product>) =>
  api.put(`/products/${id}`, p);

export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`);

// URL para Proforma (PDF) por marca + filtro de estado
export const proformaUrl = (brand: string, status?: 'todos'|'OK'|'POR_VENCER'|'VENCIDO') => {
  const base = api.defaults.baseURL!;
  const params = new URLSearchParams();
  params.set('brand', brand);
  if (status && status !== 'todos') params.set('status', status.toLowerCase());
  return `${base}/reports/proforma?${params.toString()}`;
};
