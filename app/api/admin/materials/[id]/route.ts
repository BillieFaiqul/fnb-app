import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface Material {
  id: number
  name: string
  stock: number
  unit: string
  min_stock: number
  created_at: Date
  updated_at: Date
}

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get material by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const result = await query<Material>(
      'SELECT * FROM materials WHERE id = $1',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching material:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material' },
      { status: 500 }
    )
  }
}

// PUT - Update material
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json()
    const { name, stock, unit, min_stock } = body

    const result = await query<Material>(
      `UPDATE materials 
       SET name = $1, stock = $2, unit = $3, min_stock = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
      [name, stock, unit, min_stock, params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating material:', error)
    return NextResponse.json(
      { error: 'Failed to update material' },
      { status: 500 }
    )
  }
}

// DELETE - Delete material
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const result = await query(
      'DELETE FROM materials WHERE id = $1 RETURNING id',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Material deleted successfully' })
  } catch (error) {
    console.error('Error deleting material:', error)
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}