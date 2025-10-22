import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'cashier' | 'customer'
    }
  }

  interface User {
    role: 'admin' | 'cashier' | 'customer'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: 'admin' | 'cashier' | 'customer'
    id: string
  }
}