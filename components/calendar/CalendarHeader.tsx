'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarHeaderProps {
  month: Date
  onPrev: () => void
  onNext: () => void
}

export function CalendarHeader({ month, onPrev, onNext }: CalendarHeaderProps) {
  const label = month.toLocaleDateString('id-ID', {
    month: 'long', year: 'numeric'
  })

  const isCurrentMonth =
    month.getMonth() === new Date().getMonth() &&
    month.getFullYear() === new Date().getFullYear()

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg hover:bg-white/8 text-[#6B6A66] hover:text-[#E8E6E1] transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="text-center">
        <h2 className="font-bold text-lg capitalize">{label}</h2>
      </div>

      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className="p-2 rounded-lg hover:bg-white/8 text-[#6B6A66] hover:text-[#E8E6E1] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}