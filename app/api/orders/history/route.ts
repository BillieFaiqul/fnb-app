import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all orders
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total,
        o.status,
        o.order_type,
        o.payment_method,
        o.paid_amount,
        o.change_amount,
        o.created_at,
        COALESCE(cust.name, 'Guest') AS customer_name,
        cash.name AS cashier_name,
        json_agg(
          json_build_object(
            'menu_name', oi.menu_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          ) ORDER BY oi.id
        ) AS items
      FROM orders o
      LEFT JOIN users cust ON o.customer_id = cust.id
      LEFT JOIN users cash ON o.cashier_id = cash.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, cust.name, cash.name
      ORDER BY o.created_at DESC
      LIMIT 100
    `)

    return NextResponse.json({
      success: true,
      data: ordersResult.rows
    })

  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}