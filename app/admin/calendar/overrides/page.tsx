'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LogoutButton from '../../LogoutButton'
import Button from '@/app/_components/Button'

interface Override {
  override_id: string
  session_date: string
  status: 'cancelled' | 'special'
  note: string | null
  created_at: string
}

export default function CalendarOverridesPage() {
  const [overrides, setOverrides] = useState<Override[]>([])
  const [loadingList, setLoadingList] = useState(true)

  // Form state
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<'cancelled' | 'special'>('cancelled')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchOverrides() {
    setLoadingList(true)
    const res = await fetch('/api/admin/overrides')
    const data = await res.json() as Override[]
    setOverrides(data)
    setLoadingList(false)
  }

  useEffect(() => { void fetchOverrides() }, [])

  async function addOverride() {
    setError('')
    if (!date) { setError('Date is required.'); return }
    setSaving(true)
    const res = await fetch('/api/admin/overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_date: date, status, note: note.trim() || null }),
    })
    if (res.ok) {
      setDate('')
      setNote('')
      await fetchOverrides()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Could not add override.')
    }
    setSaving(false)
  }

  async function deleteOverride(id: string) {
    await fetch(`/api/admin/overrides/${id}`, { method: 'DELETE' })
    await fetchOverrides()
  }

  const inputClass =
    'px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900">Session Overrides</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">

        {/* Add override form */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Add Override</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass + ' w-full'}
                />
              </div>
              <div>
                <label className={labelClass}>Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'cancelled' | 'special')}
                  className={inputClass + ' w-full'}
                >
                  <option value="cancelled">Cancelled</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputClass + ' w-full'}
                  placeholder="e.g. Public holiday"
                />
              </div>
            </div>
            <Button variant="primary" loading={saving} onClick={addOverride}>
              Add Override
            </Button>
          </div>
        </section>

        {/* Existing overrides list */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Existing Overrides</h2>
          {loadingList ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : overrides.length === 0 ? (
            <p className="text-gray-500 text-sm">No overrides yet.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Note</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overrides.map((o) => (
                    <tr key={o.override_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{o.session_date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                            ${o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.note ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteOverride(o.override_id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
