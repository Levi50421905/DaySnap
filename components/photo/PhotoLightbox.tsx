'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import Image from 'next/image'
import type { Photo } from '@/types/database'

interface PhotoLightboxProps {
  photo: Photo
  onClose: () => void
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const date = new Date(photo.date_taken + 'T00:00:00')
  const formatted = date.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  async function handleAnalyze() {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnalyzeError(data.error ?? 'Gagal analisis')
      } else {
        setAnalyzed(true)
      }
    } catch {
      setAnalyzeError('Terjadi kesalahan')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#141416] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
<div className="relative aspect-square w-full bg-[#1C1C1F]">
  <img
    src={photo.url}
    alt={photo.caption ?? 'Foto'}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none'
    }}
  />
</div>

        <div className="p-4">
          <p className="text-xs font-mono text-[#6B6A66] mb-1">{formatted}</p>
          {photo.caption && (
            <p className="text-sm text-[#E8E6E1] mb-3">{photo.caption}</p>
          )}

          {/* Tombol analyze */}
          {!analyzed ? (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 text-xs bg-[#1C1C1F] border border-white/10 rounded-lg px-3 py-2 text-[#6B6A66] hover:text-[#E8E6E1] hover:border-white/20 transition-colors disabled:opacity-50"
            >
              {analyzing
                ? <Loader2 size={12} className="animate-spin" />
                : <Sparkles size={12} />
              }
              {analyzing ? 'Menganalisis...' : 'Analisis foto ini'}
            </button>
          ) : (
            <p className="text-xs text-[#4ECDC4]">
              ✓ Selesai — buka Collection untuk lihat hasilnya
            </p>
          )}

          {analyzeError && (
            <p className="text-xs text-red-400 mt-2">{analyzeError}</p>
          )}
        </div>

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