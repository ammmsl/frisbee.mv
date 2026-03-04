import { SignJWT, importPKCS8 } from 'jose'
import { unstable_cache } from 'next/cache'

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

async function getGoogleAccessToken(): Promise<string> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!
  const now = Math.floor(Date.now() / 1000)

  const jwt = await new SignJWT({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(await importPKCS8(privateKey, 'RS256'))

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json()
  return data.access_token as string
}

// Parse DD/MM/YYYY or M/D/YYYY → 'YYYY-MM-DD'. Returns null if unparseable.
function parseSheetDate(raw: string): string | null {
  const parts = raw.trim().split('/')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Returns array of session dates in 'YYYY-MM-DD' format from the Session Input tab.
export const getSessionDates = unstable_cache(
  async (): Promise<string[]> => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('[sheets] Missing Google credentials — getSessionDates returning []')
      return []
    }
    const sheetId = process.env.GOOGLE_SHEETS_ID
    if (!sheetId) {
      console.warn('[sheets] GOOGLE_SHEETS_ID not set — getSessionDates returning []')
      return []
    }

    try {
      const token = await getGoogleAccessToken()
      const url = `${SHEETS_API_BASE}/${sheetId}/values/Session%20Input`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        console.warn(`[sheets] Sheets API error ${res.status} — getSessionDates returning []`)
        return []
      }
      const data = await res.json()
      const rows: string[][] = data.values ?? []
      const dates: string[] = []
      for (const row of rows) {
        const raw = row[0] ?? ''
        const parsed = parseSheetDate(raw)
        if (parsed) dates.push(parsed)
      }
      return dates
    } catch (err) {
      console.warn('[sheets] getSessionDates error:', err)
      return []
    }
  },
  ['google-sheets-session-dates'],
  { revalidate: 300 }
)

// Returns payment status for all players from the Summary Sheet tab.
export const getPaymentStatus = unstable_cache(
  async (): Promise<{ name: string; pending: number; prepay: number }[]> => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('[sheets] Missing Google credentials — getPaymentStatus returning []')
      return []
    }
    const sheetId = process.env.GOOGLE_SHEETS_ID
    if (!sheetId) {
      console.warn('[sheets] GOOGLE_SHEETS_ID not set — getPaymentStatus returning []')
      return []
    }

    try {
      const token = await getGoogleAccessToken()
      const url = `${SHEETS_API_BASE}/${sheetId}/values/Summary%20Sheet`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        console.warn(`[sheets] Sheets API error ${res.status} — getPaymentStatus returning []`)
        return []
      }
      const data = await res.json()
      const rows: string[][] = data.values ?? []
      const result: { name: string; pending: number; prepay: number }[] = []
      // Skip row 0 (header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const name = (row[1] ?? '').trim()
        if (!name) continue
        const pending = parseFloat(row[2] ?? '0') || 0
        const prepay = parseFloat(row[3] ?? '0') || 0
        result.push({ name, pending, prepay })
      }
      return result
    } catch (err) {
      console.warn('[sheets] getPaymentStatus error:', err)
      return []
    }
  },
  ['google-sheets-payment-status'],
  { revalidate: 300 }
)
