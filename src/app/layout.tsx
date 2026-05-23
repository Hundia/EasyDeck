import type { Metadata } from 'next'
import { SkipToContent } from '@/components/SkipToContent'
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
        <SkipToContent targetId="main-content" />
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
