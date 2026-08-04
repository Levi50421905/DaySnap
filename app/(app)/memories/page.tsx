'use client'

import { useEffect, useState, useCallback } from 'react'
import { Anchor } from 'lucide-react'
import { MemoryLightbox } from '@/components/memory/MemoryLightbox'
import { Skeleton } from '@/components/ui/Skeleton'

type Memory = {
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

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Memory | null>(null)

  const fetchMemories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/memories')
    const data = await res.json()
    setMemories(data.memories ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMemories() }, [fetchMemories])

  const grouped = memories.reduce<Record<string, Memory[]>>((acc, m) => {
    const year = new Date(m.created_at).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(m)
    return acc
  }, {})

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Memories</h1>
          {!loading && (
            <p className="text-xs text-[#6B6A66] mt-0.5 font-mono">
              {memories.length} memory anchor
            </p>
          )}
        </div>
        <Anchor size={16} className="text-[#6B6A66]" />
      </div>

      {/* Info */}
      <div className="bg-[#141416] border border-white/6 rounded-xl p-3 mb-5">
        <p className="text-xs text-[#6B6A66] leading-relaxed">
          Momen yang kamu pilih secara sadar. Tambahkan dari foto manapun dengan menekan{' '}
          <span className="text-[#E8E6E1]">Memory Anchor</span> di lightbox foto.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-[#141416] border border-white/6 rounded-xl">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <Anchor size={28} className="text-[#2E2E32]" />
          <div className="text-center">
            <p className="text-[#6B6A66] text-sm">Belum ada memory anchor</p>
            <p className="text-[#4A4A4E] text-xs mt-1">
              Klik foto → tekan "Memory Anchor"
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {years.map(year => (
            <div key={year}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
                {year}
              </p>
              <div className="space-y-2">
                {grouped[year].map(memory => (
                  <MemoryCardItem
                    key={memory.id}
                    memory={memory}
                    onClick={() => setSelected(memory)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <MemoryLightbox
          memory={selected}
          onClose={() => setSelected(null)}
          onDelete={() => {
            setSelected(null)
            fetchMemories()
          }}
        />
      )}
    </div>
  )
}

function MemoryCardItem({
  memory,
  onClick,
}: {
  memory: Memory
  onClick: () => void
}) {
  const [imgSrc, setImgSrc] = useState(
    memory.photos?.thumbnail_url ?? memory.photos?.url ?? null
  )

  const date = memory.photos?.date_taken
    ? new Date(memory.photos.date_taken + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : null

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-4 p-4 bg-[#141416] border border-white/7 rounded-xl hover:border-white/15 hover:bg-[#1C1C1F] active:scale-[0.99] transition-all"
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden bg-[#1C1C1F]"
        style={{ width: 64, height: 64 }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            onError={() => {
              const fallback = memory.photos?.url
              if (fallback && imgSrc !== fallback) setImgSrc(fallback)
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Anchor size={20} className="text-[#2E2E32]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-[#E8E6E1] leading-tight line-clamp-1">
          {memory.title}
        </h3>
        {memory.reason && (
          <p className="text-xs text-[#6B6A66] italic mt-1 line-clamp-1">
            "{memory.reason}"
          </p>
        )}
        {date && (
          <p className="text-[10px] font-mono text-[#4A4A4E] mt-1.5">{date}</p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center flex-shrink-0">
        <span className="text-[#2E2E32] text-lg">›</span>
      </div>
    </button>
  )
}