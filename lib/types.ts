export interface User {
  id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'cashier' | 'customer'
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Material {
  id: number
  name: string
  stock: number
  unit: string
  min_stock: number
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: number
  name: string
  created_at: Date
}

export interface Menu {
  id: number
  category_id: number | null
  name: string
  description: string | null
  price: number
  image: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface MenuMaterial {
  id: number
  menu_id: number
  material_id: number
  quantity_needed: number
  created_at: Date
}

export interface Order {
  id: number
  customer_id: number | null
  cashier_id: number | null
  order_number: string
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  order_type: 'customer' | 'cashier'
  payment_method: 'cash' | 'card' | 'e-wallet' | null
  paid_amount: number | null
  change_amount: number | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: number
  order_id: number
  menu_id: number | null
  menu_name: string
  quantity: number
  price: number
  subtotal: number
  created_at: Date
}

export interface StockHistory {
  id: number
  material_id: number
  order_id: number | null
  quantity_change: number
  stock_before: number
  stock_after: number
  type: 'in' | 'out' | 'adjustment'
  notes: string | null
  created_at: Date
}