'use client'

import { useRef, useState } from 'react'
import { Upload, X, CheckCircle2 } from 'lucide-react'
import { getTodayString } from '@/lib/exif/validator'
import { compressImage, createThumbnail } from '@/lib/utils/image'
import { cn } from '@/lib/utils/cn'

interface PhotoUploadProps {
  onSuccess?: () => void
  multiple?: boolean
}

type QueuedFile = {
  file: File
  preview: string
}

export function PhotoUpload({ onSuccess, multiple = true }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)

    const selected = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (selected.length === 0) {
      setError('File harus berupa gambar')
      return
    }

    const items = (multiple ? selected : [selected[0]]).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setQueue(prev => multiple ? [...prev, ...items] : items)
  }

  function removeFromQueue(index: number) {
    setQueue(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  async function handleUpload() {
    if (queue.length === 0) return

    setLoading(true)
    setError(null)
    setProgress({ done: 0, total: queue.length })

    const dateTaken = getTodayString()
    let failed = 0

    try {
      for (let i = 0; i < queue.length; i++) {
        const { file } = queue[i]

        const compressed = await compressImage(file)
        const thumbnail = await createThumbnail(file)

        const formData = new FormData()
        formData.append('file', compressed)
        formData.append('thumbnail', thumbnail)
        formData.append('date_taken', dateTaken)
        if (i === 0 && caption.trim()) {
          formData.append('caption', caption.trim())
        }
        formData.append('is_pinned', 'false')

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const data = await res.json()
          failed++
          setError(data.error ?? `Upload gagal (${i + 1}/${queue.length})`)
        }

        setProgress({ done: i + 1, total: queue.length })
      }

      if (failed === queue.length) return

      queue.forEach(item => URL.revokeObjectURL(item.preview))
      setQueue([])
      setCaption('')
      if (inputRef.current) inputRef.current.value = ''
      onSuccess?.()
    } catch {
      setError('Terjadi kesalahan saat upload')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-3">
      {queue.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-white/15 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-[#4ECDC4]/50 hover:bg-[#4ECDC4]/5 transition-colors"
        >
          <Upload className="text-[#6B6A66]" size={24} />
          <span className="text-sm text-[#6B6A66]">
            {multiple ? 'Pilih satu atau banyak foto' : 'Pilih foto'}
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className={cn(
            'grid gap-2',
            queue.length === 1 ? 'grid-cols-1' : 'grid-cols-3',
          )}>
            {queue.map((item, index) => (
              <div key={item.preview} className="relative rounded-xl overflow-hidden aspect-square">
                <img
                  src={item.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromQueue(index)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {multiple && (
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-[#4ECDC4] hover:underline"
            >
              + Tambah foto lagi
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {queue.length > 0 && (
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption untuk foto pertama... (opsional)"
          rows={2}
          className="w-full bg-[#141416] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E8E6E1] placeholder-[#6B6A66] resize-none focus:outline-none focus:border-[#4ECDC4]/50"
        />
      )}

      {queue.length > 0 && (
        <p className="text-xs text-[#6B6A66]">
          Foto masuk Gallery dulu. Pilih foto Daily setelah upload selesai.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {progress && (
        <p className="text-xs font-mono text-[#6B6A66]">
          Upload {progress.done}/{progress.total}...
        </p>
      )}

      {queue.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-[#4ECDC4] text-[#0E0E10] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#4ECDC4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>Mengupload...</>
          ) : (
            <>
              <CheckCircle2 size={14} />
              Upload {queue.length} Foto
            </>
          )}
        </button>
      )}
    </div>
  )
}
