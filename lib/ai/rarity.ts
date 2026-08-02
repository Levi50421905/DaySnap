import type { RarityTier } from '@/constants/rarity'
import { RARITY_ORDER, degradeRarity } from '@/constants/rarity'

interface RarityInput {
  global_rarity: RarityTier
  encounter_count: number  // berapa kali objek ini sudah difoto sebelumnya
  confidence: number
}

export function calculateFinalRarity(input: RarityInput): RarityTier {
  let rarity = input.global_rarity

  // Degradation kalau sudah pernah difoto sebelumnya
  for (let i = 0; i < input.encounter_count; i++) {
    rarity = degradeRarity(rarity)
  }

  // Kalau confidence rendah, turunkan satu tier
  if (input.confidence < 0.6) {
    rarity = degradeRarity(rarity)
  }

  return rarity
}

export function getAccessibilityLevel(
  nativeRegion: string | null,
  photoCountry: string | null
): string {
  if (!nativeRegion || !photoCountry) return 'unknown'

  const native = nativeRegion.toLowerCase()
  const photo = photoCountry.toLowerCase()

  if (native === 'global') return 'standard'
  if (photo.includes(native) || native.includes(photo)) return 'very_high'

  // Negara yang berdekatan — simplified
  const regions: Record<string, string[]> = {
    'indonesia': ['malaysia', 'singapore', 'brunei', 'timor-leste'],
    'france': ['belgium', 'switzerland', 'luxembourg', 'monaco'],
    'italy': ['france', 'switzerland', 'austria', 'slovenia'],
    'japan': ['south korea', 'china'],
  }

  const neighbors = regions[native] ?? []
  if (neighbors.some(n => photo.includes(n))) return 'high'

  return 'very_low'
}