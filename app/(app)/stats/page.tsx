'use client'

import { useEffect, useState } from 'react'
import { RARITY_CONFIG } from '@/constants/rarity'
import type { RarityTier } from '@/constants/rarity'
import { Skeleton } from '@/components/ui/Skeleton'

type Stats = {
  active_days: number
  current_streak: number
  longest_streak: number
  total_snaps: number
  rarest_rarity: string | null
  rarity_count: Record<string, number>
  top_category: string | null
  discovery_index: number
  total_memories: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍜', animal: '🐾', plant: '🌿', landmark: '🏛️',
  weather: '🌤', object: '📦', person: '👤', other: '✦',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#141416] border border-white/8 rounded-xl p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#E8E6E1] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#4A4A4E] mt-1">{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto page-enter">
        <h1 className="text-xl font-bold mb-6">Stats</h1>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#141416] border border-white/8 rounded-xl p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-xl mb-3" />
        <Skeleton className="h-20 w-full rounded-xl mb-3" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    )
  }

  if (!stats) return null

  const rarestConfig = stats.rarest_rarity
    ? RARITY_CONFIG[stats.rarest_rarity as RarityTier]
    : null

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Stats</h1>

      {/* Grid utama */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatCard
          label="Hari Aktif"
          value={stats.active_days}
          sub="total hari upload foto"
        />
        <StatCard
          label="Streak"
          value={`${stats.current_streak}🔥`}
          sub={`terpanjang ${stats.longest_streak} hari`}
        />
        <StatCard
          label="Total Snaps"
          value={stats.total_snaps}
          sub="objek unik ditemukan"
        />
        <StatCard
          label="Memories"
          value={stats.total_memories}
          sub="memory anchor"
        />
      </div>

      {/* Discovery Index */}
      <div className="bg-[#141416] border border-white/8 rounded-xl p-4 mb-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-2">
          Discovery Index — Bulan Ini
        </p>
        <p className="text-3xl font-bold text-[#4ECDC4]">{stats.discovery_index}</p>
        <p className="text-xs text-[#4A4A4E] mt-1">
          Berdasarkan rarity dan variasi snap bulan ini
        </p>
      </div>

      {/* Rarity terlangka */}
      {rarestConfig && (
        <div
          className="border rounded-xl p-4 mb-3"
          style={{
            borderColor: `${rarestConfig.color}30`,
            backgroundColor: `${rarestConfig.color}08`,
          }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest mb-2"
            style={{ color: rarestConfig.color }}>
            Rarity Terlangka
          </p>
          <p className="text-xl font-bold" style={{ color: rarestConfig.color }}>
            {rarestConfig.label}
          </p>
          <p className="text-xs mt-1" style={{ color: `${rarestConfig.color}80` }}>
            {stats.rarity_count[stats.rarest_rarity!]} snap
          </p>
        </div>
      )}

      {/* Rarity breakdown */}
      <div className="bg-[#141416] border border-white/8 rounded-xl p-4 mb-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
          Koleksi per Rarity
        </p>
        <div className="space-y-2">
          {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as RarityTier[]).map(tier => {
            const count = stats.rarity_count[tier] ?? 0
            const config = RARITY_CONFIG[tier]
            const max = Math.max(...Object.values(stats.rarity_count), 1)
            const pct = (count / max) * 100

            return (
              <div key={tier} className="flex items-center gap-3">
                <span
                  className="text-[10px] font-mono uppercase w-20 flex-shrink-0"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                <div className="flex-1 h-1.5 bg-[#2E2E32] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: config.color }}
                  />
                </div>
                <span className="text-xs font-mono text-[#6B6A66] w-6 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top category */}
      {stats.top_category && (
        <div className="bg-[#141416] border border-white/8 rounded-xl p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-2">
            Kategori Terbanyak
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {CATEGORY_EMOJI[stats.top_category] ?? '✦'}
            </span>
            <span className="text-lg font-semibold text-[#E8E6E1] capitalize">
              {stats.top_category}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}