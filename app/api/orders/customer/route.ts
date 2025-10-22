import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { customer_id, customer_name, items } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama harus diisi' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumberResult = await query(`
      SELECT 
        'ORD-' || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
        '-' || 
        LPAD((COUNT(*) + 1)::TEXT, 3, '0') AS order_number
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `)
    const orderNumber = orderNumberResult.rows[0].order_number

    // Calculate total
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    // Start transaction
    await query('BEGIN')

    try {
      // Check menu availability
      for (const item of items) {
        const availabilityCheck = await query(`
          SELECT 
            CASE 
              WHEN m.is_active = false THEN false
              WHEN EXISTS (
                SELECT 1 
                FROM menu_materials mm
                JOIN materials mat ON mm.material_id = mat.id
                WHERE mm.menu_id = m.id 
                AND mat.stock < mm.quantity_needed
              ) THEN false
              ELSE true
            END AS is_available,
            m.name
          FROM menus m
          WHERE m.id = $1
        `, [item.menu_id])

        if (availabilityCheck.rows.length === 0 || !availabilityCheck.rows[0].is_available) {
          throw new Error(`Menu "${availabilityCheck.rows[0]?.name || 'Unknown'}" tidak tersedia`)
        }
      }

      // Insert order
      const orderResult = await query(`
        INSERT INTO orders (
          customer_id,
          order_number,
          total,
          status,
          order_type
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [customer_id, orderNumber, total, 'pending', 'customer'])

      const orderId = orderResult.rows[0].id

      // Insert order items
      for (const item of items) {
        // Get menu name
        const menuResult = await query(
          'SELECT name FROM menus WHERE id = $1',
          [item.menu_id]
        )
        const menuName = menuResult.rows[0]?.name || 'Unknown'

        const subtotal = item.price * item.quantity

        await query(`
          INSERT INTO order_items (
            order_id,
            menu_id,
            menu_name,
            quantity,
            price,
            subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [orderId, item.menu_id, menuName, item.quantity, item.price, subtotal])
      }

      // Commit transaction
      await query('COMMIT')

      return NextResponse.json({
        success: true,
        data: {
          order_id: orderId,
          order_number: orderNumber,
          total
        }
      })

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK')
      throw error
    }

  } catch (error: any) {
    console.error('Error creating customer order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}