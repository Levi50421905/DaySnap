import { createClient } from '@/lib/supabase/server'
import type { DetectionResult } from '@/types/snap'
import type { RarityTier } from '@/constants/rarity'
import {
  calculateFinalRarity,
  getAccessibilityLevel,
  getDiscoveryContext,
} from './rarity'

type SnapDetection = DetectionResult & {
  model_version: string
  prompt_version: string
}

export async function resolveAndSaveSnap(
  userId: string,
  photoId: string,
  detection: SnapDetection,
  isMain: boolean,
  photoLocation: Record<string, string> | null
) {
  const supabase = createClient()
  const photoCountry = photoLocation?.country ?? null

  const { data: existing } = await supabase
    .from('snaps')
    .select('id, encounter_count, global_rarity')
    .eq('user_id', userId)
    .eq('photo_id', photoId)
    .eq('is_main', isMain)
    .maybeSingle()

  const { data: priorCanonical } = await supabase
    .from('snaps')
    .select('encounter_count')
    .eq('user_id', userId)
    .eq('canonical_key', detection.canonical_key)
    .eq('is_main', true)
    .order('encounter_count', { ascending: false })
    .limit(1)
    .maybeSingle()

  const encounterCount = priorCanonical?.encounter_count ?? 0
  const globalRarity = (existing?.global_rarity ?? detection.global_rarity) as RarityTier

  const accessibility = getAccessibilityLevel(
    detection.native_region ?? null,
    photoCountry,
  )
  const discoveryContext = getDiscoveryContext(accessibility)

  const finalRarity = calculateFinalRarity({
    global_rarity: globalRarity,
    encounter_count: encounterCount,
    confidence: detection.confidence,
    native_region: detection.native_region,
    photo_country: photoCountry,
  })

  if (existing) {
    await supabase
      .from('snaps')
      .update({
        canonical_key: detection.canonical_key,
        common_name_en: detection.common_name_en,
        common_name_id: detection.common_name_id ?? null,
        scientific_name: detection.scientific_name ?? null,
        category: detection.category,
        encounter_count: encounterCount + 1,
        current_rarity: finalRarity,
        accessibility,
        discovery_context: discoveryContext,
        photo_location: photoLocation,
        condition_note: detection.condition_note ?? null,
        context_note: detection.context_note ?? null,
        confidence: detection.confidence,
      })
      .eq('id', existing.id)

    return existing.id
  }

  const { data: newSnap, error } = await supabase
    .from('snaps')
    .insert({
      user_id: userId,
      photo_id: photoId,
      canonical_key: detection.canonical_key,
      scientific_name: detection.scientific_name ?? null,
      common_name_en: detection.common_name_en,
      common_name_id: detection.common_name_id ?? null,
      category: detection.category,
      global_rarity: detection.global_rarity,
      current_rarity: finalRarity,
      native_region: detection.native_region ?? null,
      accessibility,
      discovery_context: discoveryContext,
      condition_note: detection.condition_note ?? null,
      context_note: detection.context_note ?? null,
      confidence: detection.confidence,
      photo_location: photoLocation,
      is_main: isMain,
      model_version: detection.model_version,
      prompt_version: detection.prompt_version,
      encounter_count: encounterCount + 1,
    })
    .select()
    .single()

  if (error) throw error
  return newSnap.id
}
