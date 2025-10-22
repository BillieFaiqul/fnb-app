import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')
    
    // Jika user sudah login tapi akses halaman auth, redirect ke dashboard
    if (isAuthPage && isAuth) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (token.role === 'cashier') {
        return NextResponse.redirect(new URL('/cashier', req.url))
      } else if (token.role === 'customer') {
        return NextResponse.redirect(new URL('/customer', req.url))
      }
    }

    // Jika belum login dan akses halaman protected
    if (!isAuth && !isAuthPage && req.nextUrl.pathname !== '/') {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Role-based access control
    if (isAuth && token.role) {
      const pathname = req.nextUrl.pathname

      if (token.role === 'admin' && !pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }

      if (token.role === 'cashier' && !pathname.startsWith('/cashier')) {
        return NextResponse.redirect(new URL('/cashier', req.url))
      }


      if (token.role === 'customer' && !pathname.startsWith('/customer')) {
        return NextResponse.redirect(new URL('/customer', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/cashier/:path*',
    '/customer/:path*',
    '/login',
  ],
}