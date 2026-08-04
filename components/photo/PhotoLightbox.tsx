'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles, Loader2, Anchor, Check, Pencil } from 'lucide-react'
import { MemoryAnchorModal } from '@/components/memory/MemoryAnchorModal'
import type { Photo } from '@/types/database'

interface PhotoLightboxProps {
  photo: Photo
  onClose: () => void
  onStatusChange?: () => void
}

type PhotoStatus = {
  has_snap: boolean
  snap?: { id: string; common_name_en: string; current_rarity: string }
  has_memory: boolean
  memory?: { id: string; title: string; reason: string | null }
}

export function PhotoLightbox({ photo, onClose, onStatusChange }: PhotoLightboxProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [status, setStatus] = useState<PhotoStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  const date = new Date(photo.date_taken + 'T00:00:00')
  const formatted = date.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  async function fetchStatus() {
    setLoadingStatus(true)
    try {
      const res = await fetch(`/api/photos/status?photo_id=${photo.id}`)
      const data = await res.json()
      if (res.ok) setStatus(data)
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    setImageLoaded(false)
    fetchStatus()
  }, [photo.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleAnalyze() {
    if (status?.has_snap) {
      const ok = confirm(
        'Foto ini sudah dianalisis. Analisis ulang akan mengganti entry di Collection.',
      )
      if (!ok) return
    }

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
        await fetchStatus()
        onStatusChange?.()
      }
    } catch {
      setAnalyzeError('Terjadi kesalahan')
    } finally {
      setAnalyzing(false)
    }
  }

  const analyzed = status?.has_snap ?? false
  const hasMemory = status?.has_memory ?? false

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col"
        onClick={onClose}
      >
        {/* Top bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-xs font-mono text-[#6B6A66] truncate pr-4">
            {formatted}
          </p>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Full image — tidak di-crop */}
        <div
          className="flex-1 flex items-center justify-center min-h-0 px-2 pb-2 overflow-auto"
          onClick={e => e.stopPropagation()}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#6B6A66]" />
            </div>
          )}
          <img
            src={photo.url}
            alt={photo.caption ?? 'Foto'}
            onLoad={() => setImageLoaded(true)}
            className="max-w-full object-contain select-none"
            style={{
              maxHeight: 'calc(100dvh - 160px)',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
            draggable={false}
          />
        </div>

        {/* Bottom panel */}
        <div
          className="flex-shrink-0 bg-[#141416]/95 backdrop-blur-sm border-t border-white/8 px-4 py-3 space-y-3"
          onClick={e => e.stopPropagation()}
        >
          {(photo.caption || (analyzed && status?.snap)) && (
            <div>
              {photo.caption && (
                <p className="text-sm text-[#E8E6E1]">{photo.caption}</p>
              )}
              {analyzed && status?.snap && (
                <p className="text-xs text-[#4ECDC4] mt-1">
                  {status.snap.common_name_en} · {status.snap.current_rarity}
                </p>
              )}
            </div>
          )}

          {!loadingStatus && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center gap-1.5 text-xs bg-[#1C1C1F] border border-white/10 rounded-lg px-3 py-2 text-[#6B6A66] hover:text-[#E8E6E1] hover:border-white/20 transition-colors disabled:opacity-50"
              >
                {analyzing
                  ? <Loader2 size={11} className="animate-spin" />
                  : analyzed
                    ? <Pencil size={11} />
                    : <Sparkles size={11} />
                }
                {analyzing
                  ? 'Menganalisis...'
                  : analyzed
                    ? 'Analisis ulang'
                    : 'Analisis foto'
                }
              </button>

              {analyzed && (
                <div className="flex items-center gap-1.5 text-xs text-[#4ECDC4] px-1">
                  <Check size={11} />
                  Di Collection
                </div>
              )}

              {hasMemory ? (
                <button
                  onClick={() => setShowMemoryModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-[#1C1C1F] border border-[#E8C547]/30 rounded-lg px-3 py-2 text-[#E8C547] hover:border-[#E8C547]/50 transition-colors"
                >
                  <Pencil size={11} />
                  Edit Anchor
                </button>
              ) : (
                <button
                  onClick={() => setShowMemoryModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-[#1C1C1F] border border-white/10 rounded-lg px-3 py-2 text-[#6B6A66] hover:text-[#E8E6E1] hover:border-white/20 transition-colors"
                >
                  <Anchor size={11} />
                  Memory Anchor
                </button>
              )}
            </div>
          )}

          {analyzeError && (
            <p className="text-xs text-red-400">{analyzeError}</p>
          )}
        </div>
      </div>

      {showMemoryModal && (
        <MemoryAnchorModal
          photoId={photo.id}
          memory={status?.memory}
          onClose={() => setShowMemoryModal(false)}
          onSuccess={() => {
            setShowMemoryModal(false)
            fetchStatus()
            onStatusChange?.()
          }}
        />
      )}
    </>
  )
}
