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

    // Ambil foto dari database
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', userId)
      .single()

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })
    }

    // Download foto dari Supabase Storage
    const photoPath = photo.url.split('/storage/v1/object/public/photos/')[1]
    const { data: fileData, error: fileError } = await supabase.storage
      .from('photos')
      .download(photoPath)

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Gagal download foto' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())

    // Deteksi dengan Gemini
    const detection = await detectPhoto(buffer, 'image/jpeg')

    // Simpan main snap
    await resolveAndSaveSnap(
      userId,
      photoId,
      { ...detection.main, model_version: detection.model_version, prompt_version: detection.prompt_version },
      true,
      photo.location
    )

    // Simpan secondary snaps
    for (const secondary of detection.secondary) {
      await resolveAndSaveSnap(
        userId,
        photoId,
        { ...secondary, model_version: detection.model_version, prompt_version: detection.prompt_version },
        false,
        photo.location
      )
    }

    return NextResponse.json({
      success: true,
      detection: {
        main: detection.main,
        secondary: detection.secondary,
      }
    })
  } catch (error) {
    console.error('Detection error:', error)
    return NextResponse.json({ error: 'Gagal mendeteksi foto' }, { status: 500 })
  }
}