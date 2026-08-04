'use client'

import { cn } from '@/lib/utils/cn'
import type { Photo } from '@/types/database'

interface DailyPhotoPickerProps {
  photos: Photo[]
  pinnedId: string | null
  onSelect: (photoId: string) => void
  loading?: boolean
}

export function DailyPhotoPicker({
  photos,
  pinnedId,
  onSelect,
  loading,
}: DailyPhotoPickerProps) {
  if (photos.length === 0) return null

  return (
    <div className="mb-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-2">
        Pilih Foto Daily Hari Ini
      </p>
      <p className="text-xs text-[#4A4A4E] mb-3">
        Tap foto untuk tampil di kalender. Bisa diganti kapan saja sebelum hari berganti.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {photos.map(photo => {
          const isSelected = photo.id === pinnedId
          return (
            <button
              key={photo.id}
              onClick={() => onSelect(photo.id)}
              disabled={loading}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                isSelected
                  ? 'border-[#4ECDC4] shadow-[0_0_0_2px_rgba(78,205,196,0.25)]'
                  : 'border-white/10 hover:border-white/25',
                loading && 'opacity-50 cursor-not-allowed',
              )}
            >
              <img
                src={photo.thumbnail_url ?? photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-x-0 bottom-0 bg-[#4ECDC4]/90 text-[#0E0E10] text-[9px] font-mono font-bold py-0.5 text-center">
                  DAILY
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
