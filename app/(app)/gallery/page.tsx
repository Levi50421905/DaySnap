'use client'

import { useEffect, useState } from 'react'
import { PhotoLightbox } from '@/components/photo/PhotoLightbox'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Photo } from '@/types/database'

function GalleryItem({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const [src, setSrc] = useState(photo.thumbnail_url ?? photo.url)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        paddingBottom: '100%',
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#1C1C1F',
      }}
    >
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0 }} className="skeleton" />
      )}
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== photo.url) setSrc(photo.url)
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
      {photo.is_pinned && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 7, height: 7, borderRadius: '50%',
          backgroundColor: '#4ECDC4',
          boxShadow: '0 0 0 2px rgba(78,205,196,0.3)',
        }} />
      )}
    </div>
  )
}

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
    <div className="p-4 md:p-6 page-enter">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Gallery</h1>
        <span className="text-xs font-mono text-[#6B6A66]">
          {loading ? '—' : `${photos.length} foto`}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ paddingBottom: '100%', position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0 }} className="skeleton" />
            </div>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">🖼️</span>
          <p className="text-[#6B6A66] text-sm">Belum ada foto</p>
          <p className="text-[#4A4A4E] text-xs">Upload foto dari halaman Daily</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
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
        <PhotoLightbox photo={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}