import type { Metadata } from 'next'
import { Cinzel, Inconsolata, EB_Garamond } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inconsolata',
  display: 'swap',
})

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AURILIX.IO — Real-Time Symbolic Notation',
  description: 'Speak in any language. Watch your thoughts crystallise into timeless symbolic notation — live, as you speak.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inconsolata.variable} ${garamond.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
