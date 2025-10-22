'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { RefreshCw, Search, Calendar } from 'lucide-react'

interface OrderItem {
  menu_name: string
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  id: number
  order_number: string
  customer_name: string | null
  cashier_name: string | null
  total: number
  status: string
  order_type: 'customer' | 'cashier'
  payment_method: string | null
  paid_amount: number | null
  change_amount: number | null
  created_at: string
  items: OrderItem[]
}

export default function CashierHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, filterStatus, filterDate])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/orders/history')
      const data = await res.json()
      
      if (data.success) {
        setOrders(data.data)
      } else {
        toast.error('Gagal memuat history')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Filter by search term (order number or customer name)
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus)
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        return orderDate === filterDate
      })
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getOrderTypeBadge = (type: string) => {
    return type === 'cashier' 
      ? <Badge variant="secondary">Direct</Badge>
      : <Badge variant="outline">Customer</Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const calculateTotalRevenue = () => {
    return filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">History Order</h1>
            <p className="text-gray-600 mt-1">Riwayat transaksi</p>
          </div>
          <Button onClick={fetchHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Order</p>
              <p className="text-2xl font-bold">{filteredOrders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredOrders.filter(o => o.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredOrders.filter(o => o.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {calculateTotalRevenue().toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari order number atau nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">Memuat history...</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">Tidak ada order</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      {getOrderTypeBadge(order.order_type)}
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Tanggal: {formatDate(order.created_at)}</p>
                      {order.customer_name && (
                        <p>Customer: {order.customer_name}</p>
                      )}
                      {order.cashier_name && (
                        <p>Kasir: {order.cashier_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Items */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.menu_name}
                          </span>
                          <span className="font-medium text-gray-900">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Payment */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-xl text-gray-900">
                        Rp {order.total.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {order.status === 'completed' && (
                      <>
                        {order.payment_method && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Metode Pembayaran:</span>
                            <span className="capitalize font-medium">{order.payment_method}</span>
                          </div>
                        )}
                        {order.payment_method === 'cash' && order.paid_amount && (
                          <>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Dibayar:</span>
                              <span>Rp {order.paid_amount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Kembalian:</span>
                              <span>Rp {(order.change_amount || 0).toLocaleString('id-ID')}</span>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}