import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface Category {
  id: number
  name: string
  created_at: Date
}

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const result = await query<Category>(
      'SELECT * FROM categories WHERE id = $1',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json()
    const { name } = body

    const result = await query<Category>(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const result = await query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}