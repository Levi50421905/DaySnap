import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const photoId = searchParams.get('photo_id')
  if (!photoId) {
    return NextResponse.json({ error: 'photo_id wajib ada' }, { status: 400 })
  }

  const supabase = createClient()

  const [snapRes, memoryRes] = await Promise.all([
    supabase
      .from('snaps')
      .select('id, common_name_en, current_rarity')
      .eq('user_id', userId)
      .eq('photo_id', photoId)
      .eq('is_main', true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('memories')
      .select('id, title, reason')
      .eq('user_id', userId)
      .eq('photo_id', photoId)
      .maybeSingle(),
  ])

  return NextResponse.json({
    has_snap: !!snapRes.data,
    snap: snapRes.data,
    has_memory: !!memoryRes.data,
    memory: memoryRes.data,
  })
}
