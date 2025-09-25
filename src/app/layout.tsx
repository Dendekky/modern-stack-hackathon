import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexClientProvider } from '@/components/ConvexProvider'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthGate } from '@/components/auth/AuthGate'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Support Ticketing System',
  description: 'Modern AI-powered customer support ticketing system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <div className="min-h-screen bg-background">
            <AuthHeader />
            <AuthGate>
              <Navigation />
              {children}
            </AuthGate>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
