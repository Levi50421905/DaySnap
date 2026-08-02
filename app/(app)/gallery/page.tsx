'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PhotoLightbox } from '@/components/photo/PhotoLightbox'
import type { Photo } from '@/types/database'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Photo | null>(null)

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(d => setPhotos(d.photos ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Gallery</h1>
        <span className="text-xs font-mono text-[#6B6A66]">
          {photos.length} foto
        </span>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-[#6B6A66] text-sm">
          Memuat...
        </div>
      ) : photos.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🖼️</span>
          <p className="text-[#6B6A66] text-sm">Belum ada foto</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <Image
                src={photo.thumbnail_url ?? photo.url}
                alt={photo.caption ?? 'Foto'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 33vw, 25vw"
              />
              {photo.is_pinned && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4ECDC4]" />
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <PhotoLightbox
          photo={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}