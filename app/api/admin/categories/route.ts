import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface Category {
  id: number
  name: string
  created_at: Date
}

// GET - List all categories
export async function GET() {
  try {
    const result = await query<Category>(
      'SELECT * FROM categories ORDER BY id ASC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const result = await query<Category>(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}