'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const pathname = usePathname()
  const [dueCount, setDueCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/vocab')
      .then(r => r.json())
      .then((vocab: { next_review: string }[]) => {
        const now  = new Date()
        const due  = vocab.filter(v => new Date(v.next_review) <= now).length
        setDueCount(due)
      })
      .catch(() => {})
  }, [pathname])

  const navLink = (href: string, label: string, badge?: number | null) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`
          relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
          transition-colors duration-150
          ${active
            ? 'bg-vermilion/10 text-vermilion'
            : 'text-paper/70 hover:text-paper hover:bg-white/10'}
        `}
      >
        {label}
        {badge != null && badge > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-vermilion text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <nav className="bg-navy shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

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
        <div className="flex items-center gap-1">
          {navLink('/',       'Library')}
          {navLink('/add',    'Add Word')}
          {navLink('/review', 'Review', dueCount)}
        </div>

      </div>
    </nav>
  )
}
