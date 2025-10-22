import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Menu } from '@/lib/types'

export async function GET() {
  try {
    // Query untuk cek menu yang available dengan max servings
    const result = await query(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.image,
        m.is_active,
        c.name AS category_name,
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
        -- Hitung max servings berdasarkan material paling sedikit
        COALESCE(
          (
            SELECT MIN(FLOOR(mat.stock / mm.quantity_needed))
            FROM menu_materials mm
            JOIN materials mat ON mm.material_id = mat.id
            WHERE mm.menu_id = m.id
          ), 0
        ) AS max_servings
      FROM menus m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_active = true
      ORDER BY c.name, m.name
    `)

    // Get materials detail for each menu
    const menusWithMaterials = await Promise.all(
      result.rows.map(async (menu) => {
        const materialsResult = await query(`
          SELECT 
            mat.name AS material_name,
            mm.quantity_needed,
            mat.stock AS current_stock,
            mat.unit,
            FLOOR(mat.stock / mm.quantity_needed) AS max_servings
          FROM menu_materials mm
          JOIN materials mat ON mm.material_id = mat.id
          WHERE mm.menu_id = $1
        `, [menu.id])

        return {
          ...menu,
          materials: materialsResult.rows
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: menusWithMaterials
    })
  } catch (error) {
    console.error('Error fetching available menus:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}