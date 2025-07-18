import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/components/providers/ReduxProvider'

export const metadata: Metadata = {
  title: 'Apple Notes Clone',
  description: 'A web-based Apple Notes clone built with Next.js and Redux',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}