'use client'

import { useEffect, useState, useCallback } from 'react'
import { Anchor } from 'lucide-react'
import { MemoryCard } from '@/components/memory/MemoryCard'

type Memory = {
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

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMemories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/memories')
    const data = await res.json()
    setMemories(data.memories ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMemories() }, [fetchMemories])

  // Group by year
  const grouped = memories.reduce<Record<string, Memory[]>>((acc, m) => {
    const year = new Date(m.created_at).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(m)
    return acc
  }, {})

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Memories</h1>
          <p className="text-xs text-[#6B6A66] mt-0.5 font-mono">
            {memories.length} memory anchor
          </p>
        </div>
        <Anchor size={18} className="text-[#6B6A66]" />
      </div>

      {/* Info box */}
      <div className="bg-[#141416] border border-white/6 rounded-xl p-4 mb-6">
        <p className="text-xs text-[#6B6A66] leading-relaxed">
          Memory Anchor adalah momen yang kamu pilih secara sadar — bukan yang dianggap langka oleh AI.
          Tambahkan dari foto manapun dengan menekan tombol{' '}
          <span className="text-[#E8E6E1]">Anchor</span> di lightbox foto.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-[#6B6A66] text-sm">
          Memuat...
        </div>
      ) : memories.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <Anchor size={28} className="text-[#2E2E32]" />
          <div className="text-center">
            <p className="text-[#6B6A66] text-sm">Belum ada memory anchor</p>
            <p className="text-[#4A4A4E] text-xs mt-1">
              Klik foto di Daily atau Gallery → tekan "Memory Anchor"
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {years.map(year => (
            <div key={year}>
              <p className="text-xs font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
                {year}
              </p>
              <div className="space-y-2">
                {grouped[year].map(memory => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onDelete={fetchMemories}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}