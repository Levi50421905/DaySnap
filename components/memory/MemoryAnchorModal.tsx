'use client'

import { useEffect, useState } from 'react'
import { X, Anchor } from 'lucide-react'

interface MemoryData {
  id: string
  title: string
  reason: string | null
}

interface MemoryAnchorModalProps {
  photoId: string
  memory?: MemoryData | null
  onClose: () => void
  onSuccess: () => void
}

export function MemoryAnchorModal({
  photoId,
  memory,
  onClose,
  onSuccess,
}: MemoryAnchorModalProps) {
  const isEdit = !!memory
  const [title, setTitle] = useState(memory?.title ?? '')
  const [reason, setReason] = useState(memory?.reason ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (memory) {
      setTitle(memory.title)
      setReason(memory.reason ?? '')
    }
  }, [memory])

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Judul wajib diisi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/memories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit
            ? { id: memory!.id, title: title.trim(), reason: reason.trim() || null }
            : { photo_id: photoId, title: title.trim(), reason: reason.trim() || null },
        ),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Gagal menyimpan memory')
        return
      }

      onSuccess()
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#1C1C1F] border border-white/10 rounded-2xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Anchor size={14} className="text-[#4ECDC4]" />
            <span className="text-sm font-semibold text-[#E8E6E1]">
              {isEdit ? 'Edit Memory Anchor' : 'Memory Anchor'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/8 text-[#6B6A66]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] block mb-1.5">
              Judul *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nama momen ini..."
              maxLength={80}
              className="w-full bg-[#141416] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#E8E6E1] placeholder-[#4A4A4E] focus:outline-none focus:border-[#4ECDC4]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] block mb-1.5">
              Kenapa ini penting? <span className="normal-case">(opsional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Satu kalimat singkat..."
              rows={2}
              maxLength={200}
              className="w-full bg-[#141416] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#E8E6E1] placeholder-[#4A4A4E] resize-none focus:outline-none focus:border-[#4ECDC4]/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="w-full bg-[#4ECDC4] text-[#0E0E10] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#4ECDC4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Memory'}
          </button>
        </div>
      </div>
    </div>
  )
}
