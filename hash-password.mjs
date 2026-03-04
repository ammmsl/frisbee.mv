// Temporary script — delete after use.
// Usage: node hash-password.mjs
// Then copy the output into .env.local as ADMIN_PASSWORD_HASH=<hash>

import bcrypt from 'bcryptjs'

const PASSWORD = 'YOUR_PASSWORD_HERE' // ← replace with your actual password
const hash = await bcrypt.hash(PASSWORD, 12)
console.log(hash)
