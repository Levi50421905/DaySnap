'use client'

import { useEffect, useState, useCallback } from 'react'
import { SnapCard } from '@/components/snap/SnapCard'
import { SnapDetail } from '@/components/snap/SnapDetail'
import { RARITY_CONFIG } from '@/constants/rarity'
import type { RarityTier } from '@/constants/rarity'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'

type Snap = any

const RARITY_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'legendary', label: 'Legendary' },
  { value: 'epic', label: 'Epic' },
  { value: 'rare', label: 'Rare' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'common', label: 'Common' },
]

export default function CollectionPage() {
  const [snaps, setSnaps] = useState<Snap[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Snap | null>(null)

  const fetchSnaps = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ main_only: 'true' })
    if (filter !== 'all') params.set('rarity', filter)

    const res = await fetch(`/api/snaps?${params}`)
    const data = await res.json()
    setSnaps(data.snaps ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchSnaps() }, [fetchSnaps])

  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Collection</h1>
          <p className="text-xs text-[#6B6A66] mt-0.5 font-mono">
            {snaps.length} discovered
          </p>
        </div>
      </div>

      {/* Filter rarity */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {RARITY_FILTERS.map((f) => {
          const config = f.value !== 'all'
            ? RARITY_CONFIG[f.value as RarityTier]
            : null

          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border transition-all',
                filter === f.value
                  ? 'bg-[#4ECDC4] text-[#0E0E10] border-[#4ECDC4]'
                  : 'text-[#6B6A66] border-white/10 hover:border-white/20'
              )}
              style={
                filter === f.value && config
                  ? { background: config.color, borderColor: config.color, color: '#0E0E10' }
                  : {}
              }
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-[#141416] border border-white/8 rounded-xl overflow-hidden">
        <Skeleton className="w-full" style={{ aspectRatio: '1' }} />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {snaps.map((snap) => (
            <SnapCard
              key={snap.id}
              snap={snap}
              onClick={() => setSelected(snap)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <SnapDetail
          snap={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}