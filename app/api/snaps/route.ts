import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { groupSnapsByPhoto } from '@/lib/snaps/collection'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const rarity = searchParams.get('rarity')
  const category = searchParams.get('category')
  const mainOnly = searchParams.get('main_only') === 'true'

  const supabase = createClient()

  let query = supabase
    .from('snaps')
    .select(`
      *,
      photos (
        id,
        url,
        thumbnail_url,
        date_taken,
        caption
      )
    `)
    .eq('user_id', userId)
    .order('first_discovered_at', { ascending: false })

  if (rarity) query = query.eq('current_rarity', rarity)
  if (category) query = query.eq('category', category)
  if (mainOnly) query = query.eq('is_main', true)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by photo_id — satu entry per foto yang dianalisis
  const grouped = groupSnapsByPhoto(data ?? [])

  return NextResponse.json({
    snaps: grouped,
    total: grouped.length,
  })
}