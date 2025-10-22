'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface Order {
  id: number
  order_number: string
  customer_name: string
  total: number
  created_at: string
  items: Array<{
    menu_name: string
    quantity: number
    subtotal: number
  }>
}

export default function OrderQueue() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'e-wallet'>('cash')
  const [paidAmount, setPaidAmount] = useState<string>('')

  useEffect(() => {
    fetchPendingOrders()
    
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchPendingOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/orders/pending')
      const data = await res.json()
      
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessOrder = (order: Order) => {
    setSelectedOrder(order)
    setPaidAmount(order.total.toString())
  }

  const calculateChange = () => {
    if (!selectedOrder || paymentMethod !== 'cash') return 0
    const paid = parseInt(paidAmount) || 0
    return Math.max(0, paid - selectedOrder.total)
  }

  const handlePayment = async () => {
    if (!selectedOrder) return

    const paid = parseInt(paidAmount) || 0
    if (paymentMethod === 'cash' && paid < selectedOrder.total) {
      toast.error('Jumlah bayar kurang')
      return
    }

    setIsProcessing(true)

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: paymentMethod,
          paid_amount: paymentMethod === 'cash' ? paid : selectedOrder.total,
          change_amount: paymentMethod === 'cash' ? calculateChange() : 0,
          cashier_id: session?.user.id
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Pembayaran berhasil!')
        setSelectedOrder(null)
        setPaidAmount('')
        setPaymentMethod('cash')
        fetchPendingOrders()
      } else {
        toast.error(data.error || 'Pembayaran gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && orders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Memuat order...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Tidak ada order pending</p>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{order.order_number}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                  </div>
                  <Badge>Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.menu_name}</span>
                      <span className="font-medium">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">
                    Rp {order.total.toLocaleString('id-ID')}
                  </span>
                </div>

                <Button
                  onClick={() => handleProcessOrder(order)}
                  className="w-full"
                >
                  Proses Pembayaran
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Pembayaran</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order:</span>
                  <span className="font-medium">{selectedOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

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
                    <div className="flex justify-between bg-green-50 p-3 rounded-lg">
                      <span className="font-medium">Kembalian:</span>
                      <span className="font-bold text-green-600">
                        Rp {calculateChange().toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Memproses...' : 'Konfirmasi'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}