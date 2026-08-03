'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { RarityBadge } from './RarityBadge'
import { DiscoveryJournal } from './DiscoveryJournal'
import type { RarityTier } from '@/constants/rarity'

interface SnapDetailProps {
  snap: {
    id: string
    common_name_en: string
    common_name_id: string | null
    scientific_name: string | null
    category: string | null
    current_rarity: string
    global_rarity: string
    accessibility: string | null
    discovery_context: string | null
    encounter_count: number
    first_discovered_at: string
    condition_note: string | null
    context_note: string | null
    photo_location: Record<string, string> | null
    photos?: {
      url: string
      thumbnail_url: string | null
      date_taken: string
    } | null
  }
  onClose: () => void
}

export function SnapDetail({ snap, onClose }: SnapDetailProps) {
  const photoUrl = snap.photos?.url ?? snap.photos?.thumbnail_url

  const locationStr = snap.photo_location
    ? [snap.photo_location.city, snap.photo_location.country].filter(Boolean).join(', ')
    : null

  // Simulasi encounters dari data yang ada
  const encounters = Array.from({ length: snap.encounter_count }, (_, i) => ({
    rarity: i === 0 ? snap.global_rarity : snap.current_rarity,
    date: snap.first_discovered_at,
    condition: i === 0 ? snap.condition_note : null,
  }))

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-sm bg-[#141416] rounded-t-2xl md:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Foto header */}
        {photoUrl && (
          <div className="relative h-48 w-full flex-shrink-0">
            <Image
              src={photoUrl}
              alt={snap.common_name_en}
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141416] to-transparent" />
          </div>
        )}

        {/* Tombol tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <X size={16} />
        </button>

        {/* Content — scrollable */}
        <div className="overflow-y-auto flex-1 p-4">

          {/* Nama & rarity */}
          <div className="mb-4">
            <RarityBadge rarity={snap.current_rarity as RarityTier} />
            <h2 className="text-xl font-bold text-[#E8E6E1] mt-2">
              {snap.common_name_en}
            </h2>
            {snap.common_name_id && (
              <p className="text-sm text-[#6B6A66]">{snap.common_name_id}</p>
            )}
            {snap.scientific_name && (
              <p className="text-xs text-[#6B6A66] italic mt-0.5">{snap.scientific_name}</p>
            )}
          </div>

          {/* Detail rows */}
          <div className="space-y-0 border border-white/8 rounded-lg overflow-hidden mb-4">
            {[
              ['Global Rarity', snap.global_rarity],
              ['Accessibility', snap.accessibility ?? '—'],
              ['Context', snap.discovery_context ?? '—'],
              ['Location', locationStr ?? '—'],
              ['Encounters', `${snap.encounter_count}×`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center px-3 py-2.5 border-b border-white/6 last:border-0"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B6A66]">
                  {label}
                </span>
                <span className="text-sm text-[#E8E6E1] capitalize">{value}</span>
              </div>
            ))}
          </div>

          {/* Condition & context notes */}
          {(snap.condition_note || snap.context_note) && (
            <div className="bg-[#1C1C1F] rounded-lg p-3 mb-4 space-y-1">
              {snap.condition_note && (
                <p className="text-xs text-[#9A9792]">{snap.condition_note}</p>
              )}
              {snap.context_note && (
                <p className="text-xs text-[#6B6A66] italic">{snap.context_note}</p>
              )}
            </div>
          )}

          {/* Discovery Journal */}
          <DiscoveryJournal
            encounters={encounters}
            firstDiscovered={snap.first_discovered_at}
          />
        </div>
      </div>
    </div>
  )
}