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

// GET - List all materials
export async function GET() {
  try {
    const result = await query<Material>(
      'SELECT * FROM materials ORDER BY name ASC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

// POST - Create new material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, stock, unit, min_stock } = body

    if (!name || stock === undefined || !unit) {
      return NextResponse.json(
        { error: 'Name, stock, and unit are required' },
        { status: 400 }
      )
    }

    const result = await query<Material>(
      `INSERT INTO materials (name, stock, unit, min_stock, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [name, stock, unit, min_stock || 10]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating material:', error)
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    )
  }
}