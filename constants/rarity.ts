export const RARITY_CONFIG = {
    common:    { label: 'Common',    color: '#7A7A7A', bg: '#F5F5F5' },
    uncommon:  { label: 'Uncommon',  color: '#4CAF6E', bg: '#F0FAF4' },
    rare:      { label: 'Rare',      color: '#4A9EE8', bg: '#EFF6FD' },
    epic:      { label: 'Epic',      color: '#9B6DD6', bg: '#F5F0FD' },
    legendary: { label: 'Legendary', color: '#E8C547', bg: '#FDF9EC' },
  } as const
  
  export type RarityTier = keyof typeof RARITY_CONFIG
  
  export const RARITY_ORDER: RarityTier[] = [
    'common', 'uncommon', 'rare', 'epic', 'legendary'
  ]
  
  // Turunkan rarity satu tier (untuk degradation)
  export function degradeRarity(current: RarityTier): RarityTier {
    const idx = RARITY_ORDER.indexOf(current)
    return idx > 0 ? RARITY_ORDER[idx - 1] : 'common'
  }