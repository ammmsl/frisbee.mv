'use client'

import { useRouter } from 'next/navigation'
import Button from '@/app/_components/Button'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/admin/logout', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <Button variant="ghost" loading={loading} onClick={handleLogout}>
      Log out
    </Button>
  )
}
