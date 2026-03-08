import type { Metadata } from 'next'
import './globals.css'
import Preloader from '@/components/ui/Preloader'
import AmplifyProvider from '@/components/AmplifyProvider'

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
        <AmplifyProvider>
          <Preloader />
          {children}
        </AmplifyProvider>
      </body>
    </html>
  )
}
