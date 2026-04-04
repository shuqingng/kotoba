import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const notoJP = Noto_Sans_JP({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '700'],
  variable: '--font-noto-jp',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       '言葉 · Kotoba',
  description: 'Your personal Japanese vocabulary companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoJP.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <NavBar />
        <div className="relative max-w-4xl mx-auto">
          {/* Image anchored to the left edge of the content column.
              translateX(-70%) pushes 70% of the image outside the column,
              so exactly 30% always overlaps the content regardless of window size. */}
          <img
            src="/kotoba_bg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute top-16 left-0"
            style={{
              width:     '350px',
              opacity:   0.25,
              transform: 'translateX(-70%)',
            }}
          />
          <main className="relative px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
