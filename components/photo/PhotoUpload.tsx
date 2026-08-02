'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { validateExifDate, getTodayString } from '@/lib/exif/validator'
import { compressImage, createThumbnail } from '@/lib/utils/image'
import { cn } from '@/lib/utils/cn'

interface PhotoUploadProps {
  onSuccess?: () => void
  defaultPinned?: boolean
}

export function PhotoUpload({ onSuccess, defaultPinned = true }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPinned, setIsPinned] = useState(defaultPinned)

  async function handleFile(file: File) {
    setError(null)
    setPreview(null)

    // Validasi tipe
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    // Validasi EXIF kalau akan di-pin ke Daily
    if (isPinned) {
      const exifResult = await validateExifDate(file)
      if (!exifResult.valid) {
        setError(exifResult.error ?? 'Foto tidak valid untuk Daily')
        return
      }
    }

    // Preview
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Compress
      const compressed = await compressImage(file)
      const thumbnail = await createThumbnail(file)

      // Ambil tanggal dari EXIF atau hari ini
      const exifResult = await validateExifDate(file)
      const dateTaken = exifResult.dateTaken
        ? getTodayString()
        : getTodayString()

      const formData = new FormData()
      formData.append('file', compressed)
      formData.append('thumbnail', thumbnail)
      formData.append('date_taken', dateTaken)
      formData.append('caption', caption)
      formData.append('is_pinned', String(isPinned))

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload gagal')
        return
      }

      // Reset
      setPreview(null)
      setCaption('')
      if (inputRef.current) inputRef.current.value = ''
      onSuccess?.()
    } catch {
      setError('Terjadi kesalahan saat upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Area upload */}
      {!preview ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-white/15 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-[#4ECDC4]/50 hover:bg-[#4ECDC4]/5 transition-colors"
        >
          <Upload className="text-[#6B6A66]" size={24} />
          <span className="text-sm text-[#6B6A66]">Pilih foto</span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden">
          <img src={preview} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />
          <button
            onClick={() => {
              setPreview(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />

      {/* Caption */}
      {preview && (
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tambah caption... (opsional)"
          rows={2}
          className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E8E6E1] placeholder-[#6B6A66] resize-none focus:outline-none focus:border-[#4ECDC4]/50"
        />
      )}

      {/* Pin toggle */}
      {preview && (
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              'w-8 h-4 rounded-full relative transition-colors',
              isPinned ? 'bg-[#4ECDC4]' : 'bg-white/15'
            )}
          >
            <div className={cn(
              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
              isPinned ? 'left-4' : 'left-0.5'
            )} />
          </div>
          <span className="text-xs text-[#6B6A66]">Tampilkan di Daily hari ini</span>
        </label>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Tombol upload */}
      {preview && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-[#4ECDC4] text-[#0E0E10] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#4ECDC4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Mengupload...' : 'Upload Foto'}
        </button>
      )}
    </div>
  )
}