'use client'

import Image from 'next/image'
import { RarityBadge } from './RarityBadge'
import type { RarityTier } from '@/constants/rarity'

interface SnapCardProps {
  snap: {
    id: string
    canonical_key: string
    common_name_en: string
    common_name_id: string | null
    scientific_name: string | null
    category: string | null
    current_rarity: string
    global_rarity: string
    encounter_count: number
    first_discovered_at: string
    accessibility: string | null
    condition_note: string | null
    photos?: {
      url: string
      thumbnail_url: string | null
    } | null
  }
  onClick?: () => void
  language?: 'en' | 'id'
}

export function SnapCard({ snap, onClick, language = 'en' }: SnapCardProps) {
  const name = language === 'id' && snap.common_name_id
    ? snap.common_name_id
    : snap.common_name_en

  const photoUrl = snap.photos?.thumbnail_url ?? snap.photos?.url

  const discoveredDate = new Date(snap.first_discovered_at)
    .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <button
      onClick={onClick}
      className="bg-[#141416] border border-white/8 rounded-xl overflow-hidden text-left hover:border-white/15 transition-all hover:-translate-y-0.5 group w-full"
    >
      {/* Foto */}
      <div className="relative aspect-square w-full bg-[#1C1C1F] overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {getCategoryEmoji(snap.category)}
          </div>
        )}

        {/* Encounter badge kalau lebih dari 1 */}
        {snap.encounter_count > 1 && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
            ×{snap.encounter_count}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <RarityBadge rarity={snap.current_rarity as RarityTier} size="sm" />
        <p className="text-sm font-semibold text-[#E8E6E1] mt-2 leading-tight line-clamp-1">
          {name}
        </p>
        {snap.scientific_name && (
          <p className="text-[11px] text-[#6B6A66] italic mt-0.5 line-clamp-1">
            {snap.scientific_name}
          </p>
        )}
        <p className="text-[10px] font-mono text-[#4A4A4E] mt-2">
          {discoveredDate}
        </p>
      </div>
    </button>
  )
}

function getCategoryEmoji(category: string | null): string {
  const map: Record<string, string> = {
    food: '🍜', animal: '🐾', plant: '🌿',
    landmark: '🏛️', weather: '🌤', object: '📦',
    person: '👤', other: '✦',
  }
  return map[category ?? 'other'] ?? '✦'
}