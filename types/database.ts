export type Photo = {
    id: string
    user_id: string
    url: string
    thumbnail_url: string | null
    date_taken: string        // format: YYYY-MM-DD
    date_uploaded: string
    caption: string | null
    is_pinned: boolean
    exif_raw: Record<string, unknown> | null
    location: PhotoLocation | null
    created_at: string
  }
  
  export type PhotoLocation = {
    country?: string
    region?: string
    city?: string
    lat?: number
    lng?: number
  }
  
  export type Snap = {
    id: string
    user_id: string
    photo_id: string
    canonical_key: string
    scientific_name: string | null
    common_name_en: string
    common_name_id: string | null
    category: string | null
    global_rarity: string
    current_rarity: string
    accessibility: string | null
    discovery_context: string | null
    photo_location: PhotoLocation | null
    native_region: string | null
    condition_note: string | null
    context_note: string | null
    confidence: number | null
    model_version: string | null
    prompt_version: string | null
    is_main: boolean
    encounter_count: number
    first_discovered_at: string
    created_at: string
  }
  
  export type Memory = {
    id: string
    user_id: string
    photo_id: string
    title: string
    reason: string | null
    created_at: string
  }