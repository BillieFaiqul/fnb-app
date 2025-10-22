import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'cashier') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orderId = parseInt(params.id)
    const body = await request.json()
    const { payment_method, paid_amount, change_amount, cashier_id } = body

    // Check if order exists and is pending
    const orderCheck = await query(
      'SELECT * FROM orders WHERE id = $1 AND status = $2',
      [orderId, 'pending']
    )

    if (orderCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order tidak ditemukan atau sudah diproses' },
        { status: 404 }
      )
    }

    // Start transaction
    await query('BEGIN')

    try {
      // Update order status
      await query(`
        UPDATE orders 
        SET 
          status = 'completed',
          cashier_id = $1,
          payment_method = $2,
          paid_amount = $3,
          change_amount = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [cashier_id, payment_method, paid_amount, change_amount, orderId])

      // Get order items
      const orderItems = await query(`
        SELECT oi.*, m.id as menu_id
        FROM order_items oi
        LEFT JOIN menus m ON oi.menu_id = m.id
        WHERE oi.order_id = $1
      `, [orderId])

      // Get order number for stock history
      const orderResult = await query(
        'SELECT order_number FROM orders WHERE id = $1',
        [orderId]
      )
      const orderNumber = orderResult.rows[0].order_number

      // Reduce stock materials
      for (const item of orderItems.rows) {
        if (!item.menu_id) continue

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
            `Order ${orderNumber} - ${item.menu_name}`
          ])
        }
      }

      // Commit transaction
      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Order berhasil diproses'
      })

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    )
  }
}