import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('memories')
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
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memories: data })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { photo_id, title, reason } = await req.json()

  if (!photo_id || !title) {
    return NextResponse.json({ error: 'photo_id dan title wajib ada' }, { status: 400 })
  }

  const supabase = createClient()

  // Cek apakah foto ini sudah jadi memory
  const { data: existing } = await supabase
    .from('memories')
    .select('id')
    .eq('user_id', userId)
    .eq('photo_id', photo_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Foto ini sudah jadi Memory Anchor' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      photo_id,
      title,
      reason: reason ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data })
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, title, reason } = await req.json()

  if (!id || !title) {
    return NextResponse.json({ error: 'id dan title wajib ada' }, { status: 400 })
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('memories')
    .update({
      title: title.trim(),
      reason: reason?.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ memory: data })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id wajib ada' }, { status: 400 })
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}