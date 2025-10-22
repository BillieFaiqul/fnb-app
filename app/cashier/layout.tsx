'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user.role !== 'cashier') {
      if (session?.user.role === 'admin') {
        router.push('/admin')
      } else if (session?.user.role === 'customer') {
        router.push('/customer')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'cashier') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kasir</h1>
            <p className="text-sm text-gray-500">F&B Management System</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: '/login' })}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}