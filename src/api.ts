// src/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // toma el valor del .env
  headers: { 'Content-Type': 'application/json' },
})

export type Product = {
  id: string
  code: string
  batch?: string | null
  name: string
  brand: string
  category: string
  subtype?: string | null
  presentation: string
  color?: string | null
  expiryDate: string
  entryDate?: string
  location?: string | null
  quantity: number
  unitPrice: number | string
  currency: string
  comment?: string
  createdAt?: string
  updatedAt?: string
  daysLeft?: number
  status?: 'OK' | 'POR_VENCER' | 'VENCIDO'
}

export const getProducts = (status?: string) =>
  api.get<Product[]>(status ? `/products?status=${status}` : '/products')

export const getProduct = (id: string) =>
  api.get<Product>(`/products/${id}`)

export const createProduct = (p: Partial<Product>) =>
  api.post('/products', p)

export const updateProduct = (id: string, p: Partial<Product>) =>
  api.put(`/products/${id}`, p)

export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`)
