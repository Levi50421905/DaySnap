import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // format: YYYY-MM
  const pinned = searchParams.get('pinned') // 'true' untuk hanya yang pinned

  const supabase = createClient()

  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('date_taken', { ascending: false })
    .order('created_at', { ascending: true })

  if (month) {
    query = query
      .gte('date_taken', `${month}-01`)
      .lte('date_taken', `${month}-31`)
  }

  if (pinned === 'true') {
    query = query.eq('is_pinned', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ photos: data })
}