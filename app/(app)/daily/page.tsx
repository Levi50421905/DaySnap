'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { PhotoUpload } from '@/components/photo/PhotoUpload'
import { PhotoLightbox } from '@/components/photo/PhotoLightbox'
import type { Photo } from '@/types/database'

export default function DailyPage() {
  const [month, setMonth] = useState(new Date())
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    const y = month.getFullYear()
    const m = String(month.getMonth() + 1).padStart(2, '0')

    const res = await fetch(`/api/photos?month=${y}-${m}`)
    const data = await res.json()
    setPhotos(data.photos ?? [])
    setLoading(false)
  }, [month])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  function prevMonth() {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function nextMonth() {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Daily</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-[#4ECDC4] text-[#0E0E10] text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-[#4ECDC4]/90 transition-colors"
        >
          {showUpload ? <X size={14} /> : <Plus size={14} />}
          {showUpload ? 'Batal' : 'Upload'}
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="mb-6 bg-[#141416] border border-white/8 rounded-xl p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
            Foto Hari Ini
          </p>
          <PhotoUpload
            defaultPinned={true}
            onSuccess={() => {
              setShowUpload(false)
              fetchPhotos()
            }}
          />
        </div>
      )}

      {/* Kalender */}
      <div className="bg-[#141416] border border-white/8 rounded-xl p-4">
        <CalendarHeader
          month={month}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
        {loading ? (
          <div className="h-64 flex items-center justify-center text-[#6B6A66] text-sm">
            Memuat...
          </div>
        ) : (
          <CalendarGrid
            month={month}
            photos={photos}
            onCellClick={(photo) => setSelectedPhoto(photo)}
          />
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}