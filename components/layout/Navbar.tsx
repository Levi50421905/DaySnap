'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils/cn'


const NAV_ITEMS = [
  { href: '/daily',      label: 'Daily',      icon: '📅' },
  { href: '/gallery',    label: 'Gallery',    icon: '🖼️' },
  { href: '/collection', label: 'Collection', icon: '✦'  },
  { href: '/memories',   label: 'Memories',   icon: '☀'  },
  { href: '/stats',      label: 'Stats',      icon: '📊' },
  { href: '/settings',   label: 'Settings',   icon: '⚙️' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col border-r border-white/7 bg-[#141416] px-4 py-8">
      <div className="mb-8 px-2">
        <span className="font-bold text-xl tracking-tight">
          Day<span className="text-[#4ECDC4]">snap</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href
                ? 'bg-white/8 text-[#E8E6E1]'
                : 'text-[#6B6A66] hover:text-[#E8E6E1] hover:bg-white/5'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-2">
        <UserButton afterSignOutUrl="/login" />
      </div>
    </aside>
  )
}