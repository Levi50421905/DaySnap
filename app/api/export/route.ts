import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()

  const [photosRes, snapsRes, memoriesRes] = await Promise.all([
    supabase.from('photos').select('*').eq('user_id', userId),
    supabase.from('snaps').select('*').eq('user_id', userId),
    supabase.from('memories').select('*').eq('user_id', userId),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    photos: photosRes.data ?? [],
    snaps: snapsRes.data ?? [],
    memories: memoriesRes.data ?? [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="daysnap-export-${Date.now()}.json"`,
    },
  })
}