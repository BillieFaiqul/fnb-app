'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">F&B System</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/materials"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Materials
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Categories
          </Link>
          <Link
            href="/admin/menus"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            Menus
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-3">
            <p className="font-medium">{session.user?.name}</p>
            <p className="text-xs text-gray-500">{session.user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">
              Role: {session.user?.role as string}
            </p>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/login' })}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}