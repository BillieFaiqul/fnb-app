import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, payment_method, paid_amount, cashier_id } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items tidak boleh kosong' },
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

    // Calculate change (for cash payment)
    const changeAmount = payment_method === 'cash' 
      ? Math.max(0, paid_amount - total) 
      : 0

    // Start transaction
    await query('BEGIN')

    try {
      // Insert order
      const orderResult = await query(`
        INSERT INTO orders (
          cashier_id,
          order_number,
          total,
          status,
          order_type,
          payment_method,
          paid_amount,
          change_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        cashier_id,
        orderNumber,
        total,
        'completed',
        'cashier',
        payment_method,
        paid_amount,
        changeAmount
      ])

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

      // Reduce stock materials
      for (const item of items) {
        // Get materials needed for this menu
        const materialsResult = await query(`
          SELECT mm.material_id, mm.quantity_needed, mat.stock, mat.name
          FROM menu_materials mm
          JOIN materials mat ON mm.material_id = mat.id
          WHERE mm.menu_id = $1
        `, [item.menu_id])

        for (const material of materialsResult.rows) {
          const totalNeeded = material.quantity_needed * item.quantity
          const stockBefore = material.stock
          const stockAfter = stockBefore - totalNeeded

          // Update material stock
          await query(`
            UPDATE materials 
            SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [totalNeeded, material.material_id])

          // Get menu name for stock history
          const menuNameResult = await query(
            'SELECT name FROM menus WHERE id = $1',
            [item.menu_id]
          )
          const menuName = menuNameResult.rows[0]?.name || 'Unknown'

          // Insert stock history
          await query(`
            INSERT INTO stock_history (
              material_id,
              order_id,
              quantity_change,
              stock_before,
              stock_after,
              type,
              notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            material.material_id,
            orderId,
            -totalNeeded,
            stockBefore,
            stockAfter,
            'out',
            `Order ${orderNumber} - ${menuName}`
          ])
        }
      }

      // Commit transaction
      await query('COMMIT')

      return NextResponse.json({
        success: true,
        data: {
          order_id: orderId,
          order_number: orderNumber,
          total,
          change: changeAmount
        }
      })

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error processing cashier order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    )
  }
}