import exifr from 'exifr'
import type { ExifValidationResult } from '@/types/photo'

export async function validateExifDate(file: File): Promise<ExifValidationResult> {
  try {
    const exif = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate'] })

    if (!exif) {
      return { valid: false, error: 'Foto tidak memiliki data EXIF' }
    }

    const dateTaken: Date | undefined =
      exif.DateTimeOriginal ?? exif.CreateDate

    if (!dateTaken) {
      return { valid: false, error: 'Tanggal pengambilan foto tidak ditemukan di EXIF' }
    }

    const today = new Date()
    const sameDay =
      dateTaken.getFullYear() === today.getFullYear() &&
      dateTaken.getMonth()    === today.getMonth()    &&
      dateTaken.getDate()     === today.getDate()

    if (!sameDay) {
      const formatted = dateTaken.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
      return {
        valid: false,
        dateTaken,
        error: `Foto diambil tanggal ${formatted}. Hanya foto hari ini yang bisa masuk Daily.`,
      }
    }

    return { valid: true, dateTaken }
  } catch {
    return { valid: false, error: 'Gagal membaca metadata foto' }
  }
}

export function formatDateToString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTodayString(): string {
  return formatDateToString(new Date())
}