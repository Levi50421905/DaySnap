import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { detectPhoto } from '@/lib/ai/detect'
import { resolveAndSaveSnap } from '@/lib/ai/canonical'
import { isLowConfidenceDiscovery } from '@/lib/ai/rarity'
import { getUserSettings } from '@/lib/settings/user-settings'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const uid = userId

  try {
    const { photoId } = await req.json()
    if (!photoId) {
      return NextResponse.json({ error: 'photoId wajib ada' }, { status: 400 })
    }

    const supabase = createClient()
    const settings = await getUserSettings(uid)

    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', uid)
      .single()

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })
    }

    const imageResponse = await fetch(photo.url)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Gagal fetch foto' }, { status: 500 })
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer())
    const detection = await detectPhoto(buffer, 'image/jpeg')

    if (!settings.allow_unknown_discovery && isLowConfidenceDiscovery(detection.main.confidence)) {
      return NextResponse.json(
        { error: 'AI tidak cukup yakin — identifikasi dilewati' },
        { status: 422 },
      )
    }

    // Satu foto = satu entry di Collection — hapus snap lama foto ini dulu
    await supabase
      .from('snaps')
      .delete()
      .eq('user_id', uid)
      .eq('photo_id', photoId)

    const snapId = await resolveAndSaveSnap(
      uid,
      photoId,
      {
        ...detection.main,
        model_version: detection.model_version,
        prompt_version: detection.prompt_version,
      },
      true,
      photo.location,
    )

    // Secondary snap opsional — tidak masuk Collection (main_only filter)
    if (settings.show_secondary_snap) {
      for (const secondary of detection.secondary) {
        if (!settings.allow_unknown_discovery && isLowConfidenceDiscovery(secondary.confidence)) {
          continue
        }
        await resolveAndSaveSnap(
          uid,
          photoId,
          {
            ...secondary,
            model_version: detection.model_version,
            prompt_version: detection.prompt_version,
          },
          false,
          photo.location,
        )
      }
    }

    return NextResponse.json({
      success: true,
      snap_id: snapId,
      detection: {
        main: detection.main,
      },
    })
  } catch (error) {
    console.error('[detect] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mendeteksi foto' },
      { status: 500 },
    )
  }
}
