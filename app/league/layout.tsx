import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './league.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'UFA League', template: '%s | UFA League' },
  description: 'UFA 5v5 Mixed Ultimate Frisbee League — Malé, Maldives',
}

export default function LeagueLayout({ children }: { children: React.ReactNode }) {
  // Nested layout — no <html> or <body>, those come from the frisbee.mv root layout.
  // .league-root applies Geist fonts scoped to /league/* pages.
  return (
    <div className={`league-root ${geistSans.variable} ${geistMono.variable}`}>
      {children}
    </div>
  )
}
