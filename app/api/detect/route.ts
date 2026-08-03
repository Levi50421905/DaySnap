import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { detectPhoto } from '@/lib/ai/detect'
import { resolveAndSaveSnap } from '@/lib/ai/canonical'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { photoId } = await req.json()
    if (!photoId) {
      return NextResponse.json({ error: 'photoId wajib ada' }, { status: 400 })
    }

    const supabase = createClient()

    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', userId)
      .single()

    if (photoError || !photo) {
      console.error('[detect] Foto tidak ditemukan:', photoError)
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })
    }

    console.log('[detect] Memproses foto:', photo.url)

    // Fetch langsung dari public URL
    console.log('[detect] Fetching foto dari URL:', photo.url)

    const imageResponse = await fetch(photo.url)

    if (!imageResponse.ok) {
      console.error('[detect] Gagal fetch foto:', imageResponse.status)
      return NextResponse.json(
        { error: 'Gagal fetch foto' },
        { status: 500 }
      )
    }

    console.log('[detect] Foto berhasil di-fetch, kirim ke Gemini...')

    const buffer = Buffer.from(await imageResponse.arrayBuffer())
    const detection = await detectPhoto(buffer, 'image/jpeg')

    console.log('[detect] Hasil Gemini:', JSON.stringify(detection.main, null, 2))

    await resolveAndSaveSnap(
      userId,
      photoId,
      {
        ...detection.main,
        model_version: detection.model_version,
        prompt_version: detection.prompt_version,
      },
      true,
      photo.location
    )

    for (const secondary of detection.secondary) {
      await resolveAndSaveSnap(
        userId,
        photoId,
        {
          ...secondary,
          model_version: detection.model_version,
          prompt_version: detection.prompt_version,
        },
        false,
        photo.location
      )
    }

    console.log('[detect] Selesai, snaps tersimpan.')

    return NextResponse.json({
      success: true,
      detection: {
        main: detection.main,
        secondary: detection.secondary,
      },
    })
  } catch (error) {
    console.error('[detect] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mendeteksi foto' },
      { status: 500 }
    )
  }
}