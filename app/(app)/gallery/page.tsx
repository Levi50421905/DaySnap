'use client'

import { useEffect, useState } from 'react'
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

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold mb-6">Gallery</h1>
        <div className="h-64 flex items-center justify-center text-[#6B6A66] text-sm">
          Memuat...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Gallery</h1>
        <span className="text-xs font-mono text-[#6B6A66]">{photos.length} foto</span>
      </div>

      {photos.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🖼️</span>
          <p className="text-[#6B6A66] text-sm">Belum ada foto</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
          }}
        >
          {photos.map(photo => (
            <GalleryItem
              key={photo.id}
              photo={photo}
              onClick={() => setSelected(photo)}
            />
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

function GalleryItem({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const [src, setSrc] = useState<string>(photo.thumbnail_url ?? photo.url)
  const [failed, setFailed] = useState(false)

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        paddingBottom: '100%',
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#1C1C1F',
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt=""
          onError={() => {
            if (src !== photo.url) {
              setSrc(photo.url)
            } else {
              setFailed(true)
            }
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          🖼️
        </div>
      )}

      {photo.is_pinned && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#4ECDC4',
          }}
        />
      )}
    </div>
  )
}