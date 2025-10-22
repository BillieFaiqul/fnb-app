import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Menu } from '@/lib/types'

export async function GET() {
  try {
    // Query untuk cek menu yang available dengan informasi stok
    const result = await query(`
      SELECT 
        m.*,
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
        COALESCE(
          json_agg(
            json_build_object(
              'material_id', mat.id,
              'material_name', mat.name,
              'quantity_needed', mm.quantity_needed,
              'current_stock', mat.stock,
              'unit', mat.unit,
              'max_servings', FLOOR(mat.stock / NULLIF(mm.quantity_needed, 0))
            )
          ) FILTER (WHERE mat.id IS NOT NULL),
          '[]'
        ) as materials
      FROM menus m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN menu_materials mm ON m.id = mm.menu_id
      LEFT JOIN materials mat ON mm.material_id = mat.id
      WHERE m.is_active = true
      GROUP BY m.id, c.name
      ORDER BY m.name
    `)

    // Calculate max servings untuk setiap menu
    const menusWithStock = result.rows.map((menu: any) => {
      const materials = menu.materials || []
      
      // Cari material dengan max_servings terkecil (bottleneck)
      const maxServings = materials.length > 0
        ? Math.min(...materials.map((m: any) => m.max_servings || 0))
        : 0

      return {
        ...menu,
        max_servings: maxServings,
        is_available: menu.is_available && maxServings > 0
      }
    })

    return NextResponse.json({
      success: true,
      data: menusWithStock
    })
  } catch (error) {
    console.error('Error fetching available menus:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}