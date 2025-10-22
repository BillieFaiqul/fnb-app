import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { Menu } from '@/lib/types'

interface MenuMaterial {
  material_id: number
  quantity_needed: number
}

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get menu by ID with materials
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {

    // Get menu data with materials using JOIN
    const menuResult = await query(
      `SELECT 
        m.*,
        c.name as category_name,
        COALESCE(
          json_agg(
            json_build_object(
              'material_id', mat.id,
              'material_name', mat.name,
              'quantity_needed', mm.quantity_needed,
              'current_stock', mat.stock,
              'unit', mat.unit
            )
          ) FILTER (WHERE mat.id IS NOT NULL),
          '[]'
        ) as materials
      FROM menus m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN menu_materials mm ON m.id = mm.menu_id
      LEFT JOIN materials mat ON mm.material_id = mat.id
      WHERE m.id = $1
      GROUP BY m.id, c.name`,
      [params.id]
    )

    if (menuResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Cek availability
    const menu = menuResult.rows[0] as any
    const materials = menu.materials || []
    const isAvailable = materials.every((mat: any) => 
      mat.current_stock >= mat.quantity_needed
    )

    return NextResponse.json({
      ...menu,
      is_available: isAvailable && menu.is_active
    })
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

// PUT - Update menu with materials
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {

    const body = await request.json()
    const { name, description, price, category_id, image, is_active, materials } = body

    // Validasi
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // Update menu
    const menuResult = await query<Menu>(
      `UPDATE menus 
       SET name = $1, description = $2, price = $3, category_id = $4, 
           image = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 
       RETURNING *`,
      [name, description, price, category_id || null, image, is_active, params.id]
    )

    if (menuResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Delete existing menu materials
    await query(
      'DELETE FROM menu_materials WHERE menu_id = $1',
      [params.id]
    )

    // Insert updated menu materials
    if (materials && Array.isArray(materials) && materials.length > 0) {
      for (const material of materials as MenuMaterial[]) {
        if (material.material_id && material.quantity_needed > 0) {
          await query(
            `INSERT INTO menu_materials (menu_id, material_id, quantity_needed) 
             VALUES ($1, $2, $3)`,
            [params.id, material.material_id, material.quantity_needed]
          )
        }
      }
    }

    return NextResponse.json({
      message: 'Menu updated successfully',
      menu: menuResult.rows[0]
    })
  } catch (error: any) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete menu (cascade will delete menu_materials)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Cek apakah menu sedang digunakan di order
    const checkUsage = await query(
      'SELECT COUNT(*) as count FROM order_items WHERE menu_id = $1',
      [params.id]
    )

    if (parseInt(checkUsage.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete menu that has been ordered. Consider deactivating it instead.' },
        { status: 400 }
      )
    }

    const result = await query(
      'DELETE FROM menus WHERE id = $1 RETURNING *',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Menu deleted successfully',
      deleted: result.rows[0]
    })
  } catch (error: any) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu', details: error.message },
      { status: 500 }
    )
  }
}