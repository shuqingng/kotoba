'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
          ${active
            ? 'bg-vermilion/10 text-vermilion'
            : 'text-paper/70 hover:text-paper hover:bg-white/10'}
        `}
      >
        {label}
      </Link>
    )
  }

  const reviewLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href)
    return (
      <Link
        href={href}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
          border
          ${active
            ? 'border-gold/60 text-gold bg-gold/10'
            : 'border-gold/20 text-gold/60 hover:border-gold/50 hover:text-gold hover:bg-gold/10'}
        `}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="relative bg-navy shadow-md overflow-hidden">
      {/* Background image — anchored left-centre, slight leftward offset */}
      <div
        className="pointer-events-none absolute inset-0 -left-16"
        style={{
          backgroundImage:    'url(/nav-bg.svg)',
          backgroundRepeat:   'no-repeat',
          backgroundPosition: 'left center',
          backgroundSize:     'auto 100%',
        }}
      />
      <div className="relative max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="font-jp text-2xl text-gold font-medium leading-none
                           group-hover:text-gold/80 transition-colors">
            言葉
          </span>
          <span className="text-paper/50 text-sm tracking-widest uppercase font-light hidden sm:block">
            Kotoba
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2">
          {navLink('/', 'Library')}
          <span className="text-paper/20">|</span>
          {reviewLink('/review',  'Meaning')}
          {reviewLink('/reading', 'Reading')}
        </div>

      </div>
    </nav>
  )
}
