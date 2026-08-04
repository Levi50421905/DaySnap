import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSettings } from '@/lib/settings/user-settings'
import { NextResponse } from 'next/server'
import exifr from 'exifr'
import 'server-only'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const thumbnail = formData.get('thumbnail') as File
    const dateTaken = formData.get('date_taken') as string
    const caption = formData.get('caption') as string | null
    const isPinned = formData.get('is_pinned') === 'true'

    if (!file || !dateTaken) {
      return NextResponse.json({ error: 'File dan tanggal wajib ada' }, { status: 400 })
    }

    const exifData = await exifr.parse(
      Buffer.from(await file.arrayBuffer()),
      { pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude'] }
    )

    if (exifData?.DateTimeOriginal || exifData?.CreateDate) {
      const exifDate: Date = exifData.DateTimeOriginal ?? exifData.CreateDate
      const today = new Date()
      const sameDay =
        exifDate.getFullYear() === today.getFullYear() &&
        exifDate.getMonth()    === today.getMonth()    &&
        exifDate.getDate()     === today.getDate()

      if (!sameDay && isPinned) {
        return NextResponse.json(
          { error: 'Foto bukan dari hari ini, tidak bisa dijadikan foto Daily' },
          { status: 400 }
        )
      }
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
    }
    const fileExt = mimeToExt[file.type] ?? 'jpg'
    const fileName = `${userId}/${dateTaken}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    let thumbnailUrl: string | null = null

    if (thumbnail) {
      const thumbExt = mimeToExt[thumbnail.type] ?? 'jpg'
      const thumbName = `${userId}/${dateTaken}/thumb_${Date.now()}.${thumbExt}`

      const { error: thumbError } = await supabase.storage
        .from('photos')
        .upload(thumbName, thumbnail, { contentType: thumbnail.type })

      if (!thumbError) {
        const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(thumbName)
        thumbnailUrl = thumbPublicUrl
      }
    }

    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        url: publicUrl,
        thumbnail_url: thumbnailUrl,
        date_taken: dateTaken,
        caption: caption ?? null,
        is_pinned: isPinned,
        exif_raw: exifData ?? null,
      })
      .select()
      .single()

    if (dbError) throw dbError

    const settings = await getUserSettings(userId)

    if (settings.auto_ai_detection) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.get('cookie') ?? '',
        },
        body: JSON.stringify({ photoId: photo.id }),
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, photo })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}
