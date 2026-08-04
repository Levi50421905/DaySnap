'use client'

import { X, Anchor, Trash2 } from 'lucide-react'

interface MemoryLightboxProps {
  memory: {
    id: string
    title: string
    reason: string | null
    created_at: string
    photos?: {
      url: string
      thumbnail_url: string | null
      date_taken: string
      caption: string | null
    } | null
  }
  onClose: () => void
  onDelete?: () => void
}

export function MemoryLightbox({ memory, onClose, onDelete }: MemoryLightboxProps) {
  const photoUrl = memory.photos?.url ?? memory.photos?.thumbnail_url

  const date = memory.photos?.date_taken
    ? new Date(memory.photos.date_taken + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : null

  const savedDate = new Date(memory.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  async function handleDelete() {
    if (!confirm('Hapus memory anchor ini?')) return
    await fetch(`/api/memories?id=${memory.id}`, { method: 'DELETE' })
    onDelete?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: 'pageEnter 0.2s ease both' }}
    >
      <div
        className="relative w-full max-w-md bg-[#141416] rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Foto */}
        {photoUrl ? (
          <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
            <img
              src={photoUrl}
              alt={memory.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(20,20,22,0.95), transparent)',
            }} />
          </div>
        ) : (
          <div className="w-full bg-[#1C1C1F]" style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Anchor size={40} className="text-[#2E2E32]" />
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Anchor badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <Anchor size={11} className="text-[#E8C547]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8C547]">
              Memory Anchor
            </span>
          </div>

          {/* Judul */}
          <h2 className="text-lg font-bold text-[#E8E6E1] leading-tight mb-2">
            {memory.title}
          </h2>

          {/* Reason */}
          {memory.reason && (
            <p className="text-sm text-[#9A9792] italic mb-3 leading-relaxed">
              "{memory.reason}"
            </p>
          )}

          {/* Caption foto */}
          {memory.photos?.caption && (
            <p className="text-sm text-[#6B6A66] mb-3">
              {memory.photos.caption}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-col gap-1 pt-3 border-t border-white/6">
            {date && (
              <p className="text-xs font-mono text-[#4A4A4E]">
                📅 {date}
              </p>
            )}
            <p className="text-xs font-mono text-[#4A4A4E]">
              ⚓ Ditandai {savedDate}
            </p>
          </div>
        </div>

        {/* Tombol tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Tombol hapus */}
        <button
          onClick={handleDelete}
          className="absolute top-3 left-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}