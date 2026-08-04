'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, Anchor, Check } from 'lucide-react'
import { MemoryAnchorModal } from '@/components/memory/MemoryAnchorModal'
import type { Photo } from '@/types/database'

interface PhotoLightboxProps {
  photo: Photo
  onClose: () => void
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [memorySaved, setMemorySaved] = useState(false)

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
    <>
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md bg-[#141416] rounded-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Foto */}
          <div className="relative w-full bg-[#1C1C1F]" style={{ aspectRatio: '1' }}>
            <img
              src={photo.url}
              alt={photo.caption ?? 'Foto'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Info */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-mono text-[#6B6A66]">{formatted}</p>
              {photo.caption && (
                <p className="text-sm text-[#E8E6E1] mt-1">{photo.caption}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Analisis */}
              {!analyzed ? (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 text-xs bg-[#1C1C1F] border border-white/10 rounded-lg px-3 py-2 text-[#6B6A66] hover:text-[#E8E6E1] hover:border-white/20 transition-colors disabled:opacity-50"
                >
                  {analyzing
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Sparkles size={11} />
                  }
                  {analyzing ? 'Menganalisis...' : 'Analisis foto'}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#4ECDC4]">
                  <Check size={11} />
                  Tersimpan di Collection
                </div>
              )}

              {/* Memory Anchor */}
              {!memorySaved ? (
                <button
                  onClick={() => setShowMemoryModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-[#1C1C1F] border border-white/10 rounded-lg px-3 py-2 text-[#6B6A66] hover:text-[#E8E6E1] hover:border-white/20 transition-colors"
                >
                  <Anchor size={11} />
                  Memory Anchor
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#E8C547]">
                  <Anchor size={11} />
                  Memory tersimpan
                </div>
              )}
            </div>

            {analyzeError && (
              <p className="text-xs text-red-400">{analyzeError}</p>
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

      {/* Memory Anchor Modal */}
      {showMemoryModal && (
        <MemoryAnchorModal
          photoId={photo.id}
          onClose={() => setShowMemoryModal(false)}
          onSuccess={() => {
            setShowMemoryModal(false)
            setMemorySaved(true)
          }}
        />
      )}
    </>
  )
}