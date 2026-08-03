import { RarityBadge } from './RarityBadge'
import type { RarityTier } from '@/constants/rarity'

interface Encounter {
  rarity: string
  date: string
  condition?: string | null
}

interface DiscoveryJournalProps {
  encounters: Encounter[]
  firstDiscovered: string
}

export function DiscoveryJournal({ encounters, firstDiscovered }: DiscoveryJournalProps) {
  if (encounters.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-[9px] font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
        Discovery Journal
      </p>
      <div className="space-y-2">
        {encounters.map((enc, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center mt-1">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: i === 0 ? '#4ECDC4' : '#2E2E32' }}
              />
              {i < encounters.length - 1 && (
                <div className="w-px flex-1 bg-white/6 mt-1 min-h-4" />
              )}
            </div>

            {/* Content */}
            <div className="pb-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-[#6B6A66]">
                  {new Date(enc.date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
                <RarityBadge rarity={enc.rarity as RarityTier} size="sm" />
                {i === 0 && (
                  <span className="text-[9px] font-mono text-[#4ECDC4]">
                    first discovery
                  </span>
                )}
              </div>
              {enc.condition && (
                <p className="text-[11px] text-[#6B6A66] mt-1 line-clamp-1">
                  {enc.condition}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}