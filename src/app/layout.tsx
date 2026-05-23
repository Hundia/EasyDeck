import type { Metadata } from 'next'
import { LenisProvider } from '@/lib/lenis'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScrollyTelling Presentation Framework',
  description: 'A scrollytelling presentation engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
