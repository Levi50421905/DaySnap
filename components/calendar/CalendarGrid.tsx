'use client'

import { CalendarCell } from './CalendarCell'
import type { Photo } from '@/types/database'

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

interface CalendarGridProps {
  month: Date
  photos: Photo[]
  onCellClick?: (photo: Photo) => void
}

export function CalendarGrid({ month, photos, onCellClick }: CalendarGridProps) {
  const today = new Date()

  // Hanya foto yang dipilih (pinned) muncul di kalender
  const photoMap = new Map<number, Photo>()
  for (const photo of photos) {
    if (!photo.is_pinned) continue
    const day = new Date(photo.date_taken + 'T00:00:00').getDate()
    photoMap.set(day, photo)
  }

  // Hitung offset hari pertama bulan
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

  // Buat array cell: offset kosong + hari-hari bulan
  const cells: { day: number; inMonth: boolean }[] = [
    ...Array(firstDay).fill({ day: 0, inMonth: false }),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, inMonth: true })),
  ]

  const isCurrentMonth =
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear()

  return (
    <div>
      {/* Label hari */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[9px] font-mono uppercase tracking-widest text-[#6B6A66] py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => (
          <CalendarCell
            key={idx}
            day={cell.day}
            photo={cell.inMonth ? photoMap.get(cell.day) : undefined}
            isToday={
              isCurrentMonth &&
              cell.inMonth &&
              cell.day === today.getDate()
            }
            isCurrentMonth={cell.inMonth}
            onClick={() => {
              const photo = photoMap.get(cell.day)
              if (photo) onCellClick?.(photo)
            }}
          />
        ))}
      </div>
    </div>
  )
}