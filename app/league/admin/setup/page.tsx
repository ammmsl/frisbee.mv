import { redirect } from 'next/navigation'

// Setup wizard not yet implemented on this branch.
// Redirects to admin dashboard.
export default function SetupPage() {
  redirect('/league/admin/dashboard')
}
