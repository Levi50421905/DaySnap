import type { SupabaseClient } from '@supabase/supabase-js'

export async function deleteUserStorage(
  supabase: SupabaseClient,
  userId: string,
) {
  const paths: string[] = []

  const { data: dateFolders } = await supabase.storage.from('photos').list(userId)
  for (const folder of dateFolders ?? []) {
    const folderPath = `${userId}/${folder.name}`
    const { data: files } = await supabase.storage.from('photos').list(folderPath)
    for (const file of files ?? []) {
      paths.push(`${folderPath}/${file.name}`)
    }
  }

  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100)
    if (batch.length > 0) {
      await supabase.storage.from('photos').remove(batch)
    }
  }
}

export async function deleteUserData(
  supabase: SupabaseClient,
  userId: string,
) {
  await deleteUserStorage(supabase, userId)

  await supabase.from('memories').delete().eq('user_id', userId)
  await supabase.from('snaps').delete().eq('user_id', userId)
  await supabase.from('photos').delete().eq('user_id', userId)
  await supabase.from('user_settings').delete().eq('user_id', userId)
}
