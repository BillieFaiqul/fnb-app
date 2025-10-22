import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

interface CountResult {
  count: string
}

interface StatsResponse {
  materials: number
  menus: number
  orders: number
  users: number
}

export async function GET() {
  try {
    const materialsResult = await query<CountResult>('SELECT COUNT(*) FROM materials')
    const menusResult = await query<CountResult>('SELECT COUNT(*) FROM menus')
    const ordersResult = await query<CountResult>('SELECT COUNT(*) FROM orders')
    const usersResult = await query<CountResult>('SELECT COUNT(*) FROM users')

    const stats: StatsResponse = {
      materials: parseInt(materialsResult.rows[0].count),
      menus: parseInt(menusResult.rows[0].count),
      orders: parseInt(ordersResult.rows[0].count),
      users: parseInt(usersResult.rows[0].count),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' }, 
      { status: 500 }
    )
  }
}