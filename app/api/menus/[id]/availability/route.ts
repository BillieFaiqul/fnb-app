import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = parseInt(params.id)

    // Cek ketersediaan material untuk menu ini
    const result = await query(`
      SELECT 
        mm.menu_id,
        mm.material_id,
        mat.name AS material_name,
        mm.quantity_needed,
        mat.stock AS current_stock,
        mat.unit,
        CASE 
          WHEN mat.stock >= mm.quantity_needed THEN true
          ELSE false
        END AS is_sufficient
      FROM menu_materials mm
      JOIN materials mat ON mm.material_id = mat.id
      WHERE mm.menu_id = $1
    `, [menuId])

    // Cek apakah semua material cukup
    const allSufficient = result.rows.every(row => row.is_sufficient)

    return NextResponse.json({
      success: true,
      is_available: allSufficient,
      materials: result.rows
    })
  } catch (error) {
    console.error('Error checking menu availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}