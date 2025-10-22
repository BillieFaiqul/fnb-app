'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface Menu {
  id: number
  name: string
  price: number
  category_name: string
  is_available: boolean
  image: string | null
}

interface CartItem {
  menu: Menu
  quantity: number
}

export default function DirectOrder() {
  const { data: session } = useSession()
  const [menus, setMenus] = useState<Menu[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'e-wallet'>('cash')
  const [paidAmount, setPaidAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch available menus
  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/menus/available')
      const data = await res.json()
      
      if (data.success) {
        setMenus(data.data)
      }
    } catch (error) {
      toast.error('Gagal memuat menu')
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (menu: Menu) => {
    const existingItem = cart.find(item => item.menu.id === menu.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menu.id === menu.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { menu, quantity: 1 }])
    }
    
    toast.success(`${menu.name} ditambahkan`)
  }

  const updateQuantity = (menuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId)
      return
    }
    
    setCart(cart.map(item =>
      item.menu.id === menuId
        ? { ...item, quantity }
        : item
    ))
  }

  const removeFromCart = (menuId: number) => {
    setCart(cart.filter(item => item.menu.id !== menuId))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.menu.price * item.quantity), 0)
  }

  const calculateChange = () => {
    if (paymentMethod !== 'cash') return 0
    const paid = parseInt(paidAmount) || 0
    const total = calculateTotal()
    return Math.max(0, paid - total)
  }

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }

    const total = calculateTotal()
    
    if (paymentMethod === 'cash') {
      const paid = parseInt(paidAmount) || 0
      if (paid < total) {
        toast.error('Jumlah bayar kurang')
        return
      }
    }

    setIsProcessing(true)

    try {
      const res = await fetch('/api/orders/cashier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            menu_id: item.menu.id,
            quantity: item.quantity,
            price: item.menu.price
          })),
          payment_method: paymentMethod,
          paid_amount: paymentMethod === 'cash' ? parseInt(paidAmount) : total,
          cashier_id: session?.user.id
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Pembayaran berhasil!')
        
        // Reset form
        setCart([])
        setPaidAmount('')
        setPaymentMethod('cash')
        
        // Refresh menus (untuk update stok)
        fetchMenus()
      } else {
        toast.error(data.error || 'Pembayaran gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsProcessing(false)
    }
  }

  const groupedMenus = menus.reduce((acc, menu) => {
    const category = menu.category_name || 'Lainnya'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(menu)
    return acc
  }, {} as Record<string, Menu[]>)

  const total = calculateTotal()
  const change = calculateChange()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu List */}
      <div className="lg:col-span-2 space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Memuat menu...</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedMenus).map(([category, categoryMenus]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryMenus.map(menu => (
                    <button
                      key={menu.id}
                      onClick={() => menu.is_available && addToCart(menu)}
                      disabled={!menu.is_available}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        menu.is_available
                          ? 'border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">
                        {menu.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </div>
                      {!menu.is_available && (
                        <Badge variant="destructive" className="text-xs">
                          Habis
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cart & Payment */}
      <div className="space-y-4">
        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Keranjang</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Belum ada item
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.menu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.menu.name}</p>
                      <p className="text-xs text-gray-600">
                        Rp {item.menu.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.menu.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.menu.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.menu.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment */}
        {cart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Metode Pembayaran
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Kartu</SelectItem>
                    <SelectItem value="e-wallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>

                {paymentMethod === 'cash' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Jumlah Bayar
                      </label>
                      <Input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {paidAmount && (
                      <div className="flex justify-between text-sm">
                        <span>Kembalian:</span>
                        <span className="font-semibold text-green-600">
                          Rp {change.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}