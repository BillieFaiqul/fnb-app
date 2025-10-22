'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { ShoppingCart, Plus, Minus, Trash2, Package, ChefHat } from 'lucide-react'
import Image from 'next/image'

interface Menu {
  id: number
  name: string
  description: string | null
  price: number
  category_name: string
  is_available: boolean
  image: string | null
  max_servings: number
  materials: Array<{
    material_name: string
    quantity_needed: number
    current_stock: number
    unit: string
    max_servings: number
  }>
}

interface CartItem {
  menu: Menu
  quantity: number
}

export default function CustomerPage() {
  const { data: session } = useSession()
  const [menus, setMenus] = useState<Menu[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    fetchMenus()
    if (session?.user?.name) {
      setCustomerName(session.user.name)
    }
  }, [session])

  const fetchMenus = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/menus/available')
      const data = await res.json()
      
      if (data.success) {
        setMenus(data.data.filter((m: Menu) => m.is_available))
      }
    } catch (error) {
      toast.error('Gagal memuat menu')
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (menu: Menu) => {
    const existingItem = cart.find(item => item.menu.id === menu.id)
    const currentQty = existingItem ? existingItem.quantity : 0
    const availableQty = menu.max_servings - currentQty

    if (availableQty <= 0) {
      toast.error(`Stok ${menu.name} tidak cukup`)
      return
    }
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menu.id === menu.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { menu, quantity: 1 }])
    }
    
    toast.success(`${menu.name} ditambahkan ke keranjang`)
  }

  const updateQuantity = (menuId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(menuId)
      return
    }

    const item = cart.find(i => i.menu.id === menuId)
    if (!item) return

    const menu = menus.find(m => m.id === menuId)
    if (!menu) return

    const currentCartQty = item.quantity
    const availableQty = menu.max_servings - currentCartQty

    if (newQuantity > currentCartQty && availableQty <= 0) {
      toast.error(`Stok ${menu.name} tidak cukup`)
      return
    }
    
    setCart(cart.map(item =>
      item.menu.id === menuId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (menuId: number) => {
    setCart(cart.filter(item => item.menu.id !== menuId))
    toast.success('Item dihapus dari keranjang')
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.menu.price * item.quantity), 0)
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }

    if (!customerName.trim()) {
      toast.error('Nama harus diisi')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/orders/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: session?.user.id,
          customer_name: customerName,
          items: cart.map(item => ({
            menu_id: item.menu.id,
            quantity: item.quantity,
            price: item.menu.price
          }))
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Order berhasil! No. Order: ${data.data.order_number}`)
        setCart([])
        setShowCart(false)
        fetchMenus()
      } else {
        toast.error(data.error || 'Order gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <ChefHat className="h-6 w-6 text-orange-600" />
              <h1 className="text-xl font-bold text-gray-900">Restaurant Menu</h1>
            </div>

            {/* User Info & Cart */}
            <div className="flex items-center gap-4">
              {session?.user?.name && (
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hi, {session.user.name}
                </span>
              )}
              
              {/* Cart Button in Navbar */}
              <Button
                onClick={() => setShowCart(true)}
                variant="outline"
                size="sm"
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
                <span className="ml-2 hidden sm:inline">Keranjang</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {isLoading ? (
            <Card className="bg-white">
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Memuat menu...</p>
              </CardContent>
            </Card>
          ) : Object.keys(groupedMenus).length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Tidak ada menu tersedia saat ini</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedMenus).map(([category, categoryMenus]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryMenus.map(menu => {
                    const cartQty = cart.find(item => item.menu.id === menu.id)?.quantity || 0
                    const availableQty = menu.max_servings - cartQty

                    return (
                      <Card key={menu.id} className="hover:shadow-lg transition-shadow overflow-hidden bg-white">
                        <div className="aspect-video bg-gray-200 relative">
                          {menu.image ? (
                            <Image
                              src={menu.image}
                              alt={menu.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 bg-white">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {menu.name}
                          </h3>
                          {menu.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {menu.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs mb-3">
                            <Package className="h-3 w-3 text-gray-500" />
                            <span className={availableQty > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              Stok: {availableQty}
                            </span>
                            {cartQty > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Di keranjang: {cartQty}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              Rp {menu.price.toLocaleString('id-ID')}
                            </span>
                            <Button
                              onClick={() => addToCart(menu)}
                              size="sm"
                              disabled={availableQty <= 0}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tambah
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Keranjang Belanja</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="bg-white p-4 rounded-lg border">
              <label className="text-sm font-medium mb-2 block">
                Nama Pemesan
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama"
                className="bg-white"
              />
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map(item => {
                const menu = menus.find(m => m.id === item.menu.id)
                const availableQty = menu ? menu.max_servings - item.quantity : 0

                return (
                  <div key={item.menu.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{item.menu.name}</p>
                      <p className="text-sm text-gray-600">
                        Rp {item.menu.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stok tersisa: {availableQty + item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.menu.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.menu.id, item.quantity + 1)}
                        disabled={availableQty <= 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="w-24 text-right font-semibold">
                      Rp {(item.menu.price * item.quantity).toLocaleString('id-ID')}
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromCart(item.menu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="border-t pt-4 bg-white">
              <div className="flex justify-between items-center text-xl font-bold mb-4">
                <span>Total:</span>
                <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCart(false)}
                  className="flex-1"
                >
                  Lanjut Belanja
                </Button>
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1"
                >
                  {isSubmitting ? 'Memproses...' : 'Submit Order'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Order akan dikirim ke kasir untuk pembayaran
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}