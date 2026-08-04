'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { PhotoUpload } from '@/components/photo/PhotoUpload'
import { PhotoLightbox } from '@/components/photo/PhotoLightbox'
import { Skeleton } from '@/components/ui/Skeleton'
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
    <div className="p-4 md:p-6 max-w-lg mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Daily</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: showUpload ? 'rgba(255,255,255,0.08)' : '#4ECDC4',
            color: showUpload ? '#E8E6E1' : '#0E0E10',
          }}
        >
          {showUpload
            ? <><X size={13} /> Batal</>
            : <><Plus size={13} /> Upload</>
          }
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div
          className="mb-5 bg-[#141416] border border-white/8 rounded-2xl p-4"
          style={{ animation: 'pageEnter 0.2s ease both' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
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
      <div className="bg-[#141416] border border-white/8 rounded-2xl p-4">
        <CalendarHeader month={month} onPrev={prevMonth} onNext={nextMonth} />

        {loading ? (
          <div>
            {/* Skeleton label hari */}
            <div className="grid grid-cols-7 mb-2 gap-1">
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                <div key={d} className="text-center text-[9px] font-mono uppercase tracking-widest text-[#2E2E32] py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Skeleton cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square p-0.5">
                  <div className="w-full h-full rounded-full skeleton" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CalendarGrid
            month={month}
            photos={photos}
            onCellClick={setSelectedPhoto}
          />
        )}
      </div>

      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}