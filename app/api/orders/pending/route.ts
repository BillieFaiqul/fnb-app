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

    // Get pending orders from customers
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total,
        o.created_at,
        COALESCE(u.name, 'Guest') AS customer_name,
        json_agg(
          json_build_object(
            'menu_name', oi.menu_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          ) ORDER BY oi.id
        ) AS items
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'pending' 
      AND o.order_type = 'customer'
      GROUP BY o.id, u.name
      ORDER BY o.created_at ASC
    `)

    return NextResponse.json({
      success: true,
      data: ordersResult.rows
    })

  } catch (error) {
    console.error('Error fetching pending orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}