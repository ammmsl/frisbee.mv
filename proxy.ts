import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'frisbee_admin_session'

export async function proxy(req: NextRequest) {
  const isAdminRoute =
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/api/admin')
  const isLoginRoute =
    req.nextUrl.pathname === '/admin/login' ||
    req.nextUrl.pathname === '/api/admin/login'

  if (!isAdminRoute || isLoginRoute) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'admin') throw new Error()
    return NextResponse.next()
  } catch {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
