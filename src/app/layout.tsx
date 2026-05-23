import type { Metadata } from 'next'
import { SkipToContent } from '@/components/SkipToContent'
import './globals.css'

export const metadata: Metadata = {
  title: 'EasyDeck — Build stories that scroll.',
  description:
    'Three transition modes. One <Stage> component. Canvas-driven image sequences with GSAP, Lenis, and full accessibility baked in.',
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
