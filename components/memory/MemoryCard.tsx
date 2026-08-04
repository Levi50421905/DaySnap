'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface MemoryCardProps {
  memory: {
    id: string
    title: string
    reason: string | null
    created_at: string
    photos?: {
      url: string
      thumbnail_url: string | null
      date_taken: string
    } | null
  }
  onDelete?: () => void
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [imgSrc, setImgSrc] = useState(
    memory.photos?.thumbnail_url ?? memory.photos?.url ?? null
  )

  const date = memory.photos?.date_taken
    ? new Date(memory.photos.date_taken + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : null

  async function handleDelete() {
    if (!confirm('Hapus memory ini?')) return
    setDeleting(true)
    try {
      await fetch(`/api/memories?id=${memory.id}`, { method: 'DELETE' })
      onDelete?.()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex gap-4 p-4 bg-[#141416] border border-white/8 rounded-xl group hover:border-white/12 transition-colors">
      {/* Foto thumbnail */}
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden bg-[#1C1C1F]"
        style={{ width: 64, height: 64 }}
      >
        {imgSrc && (
          <img
            src={imgSrc}
            alt=""
            onError={() => {
              const fallback = memory.photos?.url
              if (fallback && imgSrc !== fallback) setImgSrc(fallback)
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#E8E6E1] leading-tight">
          {memory.title}
        </h3>
        {memory.reason && (
          <p className="text-xs text-[#6B6A66] italic mt-1 line-clamp-2">
            "{memory.reason}"
          </p>
        )}
        {date && (
          <p className="text-[10px] font-mono text-[#4A4A4E] mt-2">{date}</p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 p-1.5 rounded-lg text-[#4A4A4E] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all self-start"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}