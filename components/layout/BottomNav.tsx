'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/daily',      label: 'Daily',      icon: '📅' },
  { href: '/gallery',    label: 'Gallery',    icon: '🖼️' },
  { href: '/collection', label: 'Collection', icon: '✦'  },
  { href: '/memories',   label: 'Memories',   icon: '☀'  },
  { href: '/stats',      label: 'Stats',      icon: '📊' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/7 bg-[#141416] px-2 py-2">
      <div className="flex justify-around">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors',
              pathname === item.href
                ? 'text-[#4ECDC4]'
                : 'text-[#6B6A66]'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}