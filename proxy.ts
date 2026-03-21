import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const FRISBEE_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const LEAGUE_SECRET = new TextEncoder().encode(process.env.LEAGUE_JWT_SECRET!)

async function isValid(token: string, secret: Uint8Array): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── League admin routes ── cookie: ufa_admin_session, secret: LEAGUE_JWT_SECRET
  if (pathname.startsWith('/league/admin/') || pathname.startsWith('/api/league/admin/')) {
    const isLogin =
      pathname === '/league/admin/login' ||
      pathname === '/api/league/admin/login'
    if (isLogin) return NextResponse.next()

    const token = req.cookies.get('ufa_admin_session')?.value
    const auth = token ? await isValid(token, LEAGUE_SECRET) : false
    if (!auth) {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/league/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // ── Frisbee.mv admin routes ── cookie: frisbee_admin_session, secret: JWT_SECRET
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    const isLogin =
      pathname === '/admin/login' ||
      pathname === '/api/admin/login'
    if (isLogin) return NextResponse.next()

    const token = req.cookies.get('frisbee_admin_session')?.value
    const auth = token ? await isValid(token, FRISBEE_SECRET) : false
    if (!auth) {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/league/admin/:path*',
    '/api/league/admin/:path*',
  ],
}
