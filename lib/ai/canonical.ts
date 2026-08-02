import { createClient } from '@/lib/supabase/server'
import type { DetectionResult } from '@/types/snap'
import type { RarityTier } from '@/constants/rarity'
import { calculateFinalRarity } from './rarity'

export async function resolveAndSaveSnap(
  userId: string,
  photoId: string,
  detection: DetectionResult & { model_version: string; prompt_version: string },
  isMain: boolean,
  photoLocation: Record<string, string> | null
) {
  const supabase = createClient()

  // Cek sudah pernah ditemukan sebelumnya
  const { data: existing } = await supabase
    .from('snaps')
    .select('id, encounter_count, global_rarity')
    .eq('user_id', userId)
    .eq('canonical_key', detection.main?.canonical_key ?? (detection as DetectionResult).canonical_key)
    .single()

  const encounterCount = existing ? existing.encounter_count : 0

  const finalRarity = calculateFinalRarity({
    global_rarity: (detection as DetectionResult).global_rarity as RarityTier,
    encounter_count: encounterCount,
    confidence: (detection as DetectionResult).confidence,
  })

  if (existing) {
    // Update encounter count dan rarity
    await supabase
      .from('snaps')
      .update({
        encounter_count: encounterCount + 1,
        current_rarity: finalRarity,
      })
      .eq('id', existing.id)

    return existing.id
  }

  // Insert snap baru
  const det = detection as unknown as DetectionResult
  const { data: newSnap, error } = await supabase
    .from('snaps')
    .insert({
      user_id: userId,
      photo_id: photoId,
      canonical_key: det.canonical_key,
      scientific_name: det.scientific_name ?? null,
      common_name_en: det.common_name_en,
      common_name_id: det.common_name_id ?? null,
      category: det.category,
      global_rarity: det.global_rarity,
      current_rarity: finalRarity,
      native_region: det.native_region ?? null,
      condition_note: det.condition_note ?? null,
      context_note: det.context_note ?? null,
      confidence: det.confidence,
      photo_location: photoLocation,
      is_main: isMain,
      model_version: (detection as any).model_version,
      prompt_version: (detection as any).prompt_version,
      encounter_count: 1,
    })
    .select()
    .single()

  if (error) throw error
  return newSnap.id
}