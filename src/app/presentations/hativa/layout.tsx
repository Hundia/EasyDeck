import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intelligence Software Department — Operational Story',
  description: 'A cinematic scrollytelling presentation showcasing operational capabilities.',
}

export default function XPresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
