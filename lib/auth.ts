import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Lazy so importing this module without env vars (e.g. at build time) can't crash
function getSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Configure it in .env.local.')
  }
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export const COOKIE_NAME = 'frisbee_admin_session'

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  if (payload.role !== 'admin') throw new Error('Not admin')
  return payload
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  try {
    await verifyAdminToken(token)
    return true
  } catch {
    return false
  }
}
