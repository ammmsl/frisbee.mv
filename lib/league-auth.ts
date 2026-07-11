import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Lazy so importing this module without env vars (e.g. at build time) can't crash
function getSecret(): Uint8Array {
  if (!process.env.LEAGUE_JWT_SECRET) {
    throw new Error('LEAGUE_JWT_SECRET is not set. Configure it in .env.local.')
  }
  return new TextEncoder().encode(process.env.LEAGUE_JWT_SECRET)
}

const COOKIE_NAME = 'ufa_admin_session'
const EXPIRY = '7d'

export async function signAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME
