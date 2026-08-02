'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import type { Photo } from '@/types/database'

interface CalendarCellProps {
  day: number
  photo?: Photo
  isToday: boolean
  isCurrentMonth: boolean
  onClick?: () => void
}

export function CalendarCell({
  day,
  photo,
  isToday,
  isCurrentMonth,
  onClick,
}: CalendarCellProps) {
  if (!isCurrentMonth) {
    return <div />
  }

  return (
    <div
      onClick={photo ? onClick : undefined}
      className={cn(
        'flex items-center justify-center aspect-square',
        photo && 'cursor-pointer'
      )}
    >
      <div
        className={cn(
          'relative w-full aspect-square rounded-full overflow-hidden',
          'flex items-center justify-center',
          // hari dengan foto
          photo && 'border-2',
          photo && isToday && 'border-[#4ECDC4] shadow-[0_0_0_2px_rgba(78,205,196,0.2)]',
          photo && !isToday && 'border-white/15',
          // hari kosong
          !photo && 'border border-dashed border-white/10',
        )}
      >
        {photo?.thumbnail_url || photo?.url ? (
          <Image
            src={photo.thumbnail_url ?? photo.url}
            alt={`Foto ${day}`}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : null}

        {/* nomor tanggal */}
        <span
          className={cn(
            'absolute bottom-1 right-1 text-[9px] font-mono leading-none px-1 py-0.5 rounded',
            photo
              ? 'text-white bg-black/40'
              : 'text-[#333337]'
          )}
        >
          {day}
        </span>
      </div>
    </div>
  )
}