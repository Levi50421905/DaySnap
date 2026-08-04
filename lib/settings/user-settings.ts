import { createClient } from '@/lib/supabase/server'

export type UserSettings = {
  auto_ai_detection: boolean
  show_secondary_snap: boolean
  allow_unknown_discovery: boolean
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  auto_ai_detection: true,
  show_secondary_snap: false,
  allow_unknown_discovery: true,
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_settings')
    .select('auto_ai_detection, show_secondary_snap, allow_unknown_discovery')
    .eq('user_id', userId)
    .single()

  if (error?.code === 'PGRST116') {
    const { data: created } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select('auto_ai_detection, show_secondary_snap, allow_unknown_discovery')
      .single()

    return { ...DEFAULT_USER_SETTINGS, ...created }
  }

  return { ...DEFAULT_USER_SETTINGS, ...data }
}
