import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'


interface Menu {
  id: number
  category_id: number | null
  name: string
  description: string | null
  price: number
  image: string | null
  is_active: boolean
  is_available: boolean
  category_name?: string
  created_at: Date
}

interface MenuMaterial {
  material_id: number
  quantity_needed: number
}

// GET - List all menus with availability check
export async function GET() {
  try {
    // Query menu dengan cek ketersediaan berdasarkan stok material
    const result = await query<Menu>(`
      SELECT 
        m.*,
        c.name as category_name,
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM menu_materials mm
            JOIN materials mat ON mm.material_id = mat.id
            WHERE mm.menu_id = m.id 
            AND mat.stock = 0
          ) THEN false
          ELSE true
        END as is_available
      FROM menus m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.id DESC
    `)
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

// POST - Create new menu with materials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category_id, name, description, price, image, is_active, materials } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // Insert menu
    const menuResult = await query<Menu>(
      `INSERT INTO menus (category_id, name, description, price, image, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [category_id, name, description, price, image, is_active]
    )

    const newMenu = menuResult.rows[0]

    // Insert menu materials jika ada
    if (materials && Array.isArray(materials) && materials.length > 0) {
      for (const material of materials as MenuMaterial[]) {
        await query(
          `INSERT INTO menu_materials (menu_id, material_id, quantity_needed) 
           VALUES ($1, $2, $3)
           ON CONFLICT (menu_id, material_id) 
           DO UPDATE SET quantity_needed = $3`,
          [newMenu.id, material.material_id, material.quantity_needed]
        )
      }
    }

    return NextResponse.json(newMenu, { status: 201 })
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}