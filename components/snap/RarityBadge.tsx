import { RARITY_CONFIG } from '@/constants/rarity'
import type { RarityTier } from '@/constants/rarity'
import { cn } from '@/lib/utils/cn'

interface RarityBadgeProps {
  rarity: RarityTier
  size?: 'sm' | 'md'
}

export function RarityBadge({ rarity, size = 'md' }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.common

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded-full border',
        size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'
      )}
      style={{
        color: config.color,
        borderColor: `${config.color}40`,
        backgroundColor: `${config.color}10`,
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: size === 'sm' ? 4 : 5,
          height: size === 'sm' ? 4 : 5,
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  )
}