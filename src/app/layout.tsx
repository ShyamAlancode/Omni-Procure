import type { Metadata } from 'next'
import './globals.css'
import Preloader from '@/components/ui/Preloader'

export const metadata: Metadata = {
  title: 'OmniProcure — Autonomous Enterprise Procurement',
  description: 'AI-driven procurement orchestration. Compliance, budget verification, and supplier actuation in one pipeline.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise">
        <Preloader />
        {children}
      </body>
    </html>
  )
}
