import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customerId = session.user.id

    // Get customer orders
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total,
        o.status,
        o.payment_method,
        o.created_at,
        json_agg(
          json_build_object(
            'menu_name', oi.menu_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          ) ORDER BY oi.id
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [customerId])

    return NextResponse.json({
      success: true,
      data: ordersResult.rows
    })

  } catch (error) {
    console.error('Error fetching my orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}