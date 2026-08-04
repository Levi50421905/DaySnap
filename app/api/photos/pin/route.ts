import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { photo_id } = await req.json()
  if (!photo_id) {
    return NextResponse.json({ error: 'photo_id wajib ada' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .select('id, date_taken, exif_raw')
    .eq('id', photo_id)
    .eq('user_id', userId)
    .single()

  if (photoError || !photo) {
    return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]
  if (photo.date_taken !== today) {
    return NextResponse.json(
      { error: 'Hanya foto hari ini yang bisa dipilih sebagai Daily' },
      { status: 400 },
    )
  }

  await supabase
    .from('photos')
    .update({ is_pinned: false })
    .eq('user_id', userId)
    .eq('date_taken', photo.date_taken)

  const { data: pinned, error: pinError } = await supabase
    .from('photos')
    .update({ is_pinned: true })
    .eq('id', photo_id)
    .eq('user_id', userId)
    .select()
    .single()

  if (pinError) {
    return NextResponse.json({ error: pinError.message }, { status: 500 })
  }

  return NextResponse.json({ photo: pinned })
}
