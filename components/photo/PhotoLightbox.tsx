'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import type { Photo } from '@/types/database'

interface PhotoLightboxProps {
  photo: Photo
  onClose: () => void
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  const date = new Date(photo.date_taken + 'T00:00:00')
  const formatted = date.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141416] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Foto */}
        <div className="relative aspect-square w-full">
          <Image
            src={photo.url}
            alt={photo.caption ?? 'Foto'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-mono text-[#6B6A66] mb-1">{formatted}</p>
          {photo.caption && (
            <p className="text-sm text-[#E8E6E1]">{photo.caption}</p>
          )}
        </div>

        {/* Tombol tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}