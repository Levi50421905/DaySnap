import type { RarityTier } from '@/constants/rarity'
import { RARITY_ORDER, degradeRarity, boostRarity } from '@/constants/rarity'

export type AccessibilityLevel =
  | 'very_high'
  | 'high'
  | 'standard'
  | 'very_low'
  | 'unknown'

interface RarityInput {
  global_rarity: RarityTier
  encounter_count: number
  confidence: number
  native_region?: string | null
  photo_country?: string | null
}

const CONFIDENCE_UNKNOWN_THRESHOLD = 0.5

export function isLowConfidenceDiscovery(confidence: number): boolean {
  return confidence < CONFIDENCE_UNKNOWN_THRESHOLD
}

export function getAccessibilityLevel(
  nativeRegion: string | null,
  photoCountry: string | null
): AccessibilityLevel {
  if (!nativeRegion || !photoCountry) return 'unknown'

  const native = nativeRegion.toLowerCase()
  const photo = photoCountry.toLowerCase()

  if (native === 'global') return 'standard'
  if (photo.includes(native) || native.includes(photo)) return 'very_high'

  const regions: Record<string, string[]> = {
    indonesia: ['malaysia', 'singapore', 'brunei', 'timor-leste'],
    france: ['belgium', 'switzerland', 'luxembourg', 'monaco'],
    italy: ['france', 'switzerland', 'austria', 'slovenia'],
    japan: ['south korea', 'china', 'taiwan'],
  }

  const neighbors = regions[native] ?? []
  if (neighbors.some(n => photo.includes(n))) return 'high'

  return 'very_low'
}

export function getDiscoveryContext(accessibility: AccessibilityLevel): string | null {
  switch (accessibility) {
    case 'very_low':
      return 'Ditemukan jauh dari asal-usulnya'
    case 'high':
      return 'Ditemukan di region terdekat'
    case 'very_high':
      return 'Ditemukan di habitat aslinya'
    case 'standard':
      return 'Objek global, tidak terikat region'
    default:
      return null
  }
}

export function calculateFinalRarity(input: RarityInput): RarityTier {
  let rarity = input.global_rarity

  const accessibility = getAccessibilityLevel(
    input.native_region ?? null,
    input.photo_country ?? null,
  )
  if (accessibility === 'very_low') rarity = boostRarity(rarity, 2)
  else if (accessibility === 'high') rarity = boostRarity(rarity, 1)

  // Soft degradation: 1 tier per 2 encounters, max 2 tiers total
  const encounterPenalty = Math.min(Math.floor(input.encounter_count / 2), 2)
  for (let i = 0; i < encounterPenalty; i++) {
    rarity = degradeRarity(rarity)
  }

  let idx = RARITY_ORDER.indexOf(rarity)

  // Confidence penalty — gradual, not a hard cliff
  if (input.confidence < 0.4) idx = Math.max(idx - 2, 0)
  else if (input.confidence < 0.6) idx = Math.max(idx - 1, 0)

  // Floor: epic/legendary objects stay at least uncommon for you
  const globalIdx = RARITY_ORDER.indexOf(input.global_rarity)
  const minIdx = globalIdx >= 3 ? 1 : 0
  idx = Math.max(idx, minIdx)

  return RARITY_ORDER[idx]
}
