'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { PhotoUpload } from '@/components/photo/PhotoUpload'
import { PhotoLightbox } from '@/components/photo/PhotoLightbox'
import { DailyPhotoPicker } from '@/components/daily/DailyPhotoPicker'
import { getTodayString } from '@/lib/exif/validator'
import type { Photo } from '@/types/database'

export default function DailyPage() {
  const [month, setMonth] = useState(new Date())
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [pinning, setPinning] = useState(false)

  const todayStr = getTodayString()

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

  const todayPhotos = useMemo(
    () => photos.filter(p => p.date_taken === todayStr),
    [photos, todayStr],
  )

  const pinnedToday = useMemo(
    () => todayPhotos.find(p => p.is_pinned) ?? null,
    [todayPhotos],
  )

  async function handlePinDaily(photoId: string) {
    setPinning(true)
    try {
      const res = await fetch('/api/photos/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photoId }),
      })
      if (res.ok) await fetchPhotos()
    } finally {
      setPinning(false)
    }
  }

  function prevMonth() {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function nextMonth() {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto page-enter">

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

      {showUpload && (
        <div
          className="mb-5 bg-[#141416] border border-white/8 rounded-2xl p-4"
          style={{ animation: 'pageEnter 0.2s ease both' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#6B6A66] mb-3">
            Foto Hari Ini
          </p>
          <PhotoUpload
            multiple
            onSuccess={() => {
              setShowUpload(false)
              fetchPhotos()
            }}
          />
        </div>
      )}

      {!loading && todayPhotos.length > 0 && (
        <DailyPhotoPicker
          photos={todayPhotos}
          pinnedId={pinnedToday?.id ?? null}
          onSelect={handlePinDaily}
          loading={pinning}
        />
      )}

      <div className="bg-[#141416] border border-white/8 rounded-2xl p-4">
        <CalendarHeader month={month} onPrev={prevMonth} onNext={nextMonth} />

        {loading ? (
          <div>
            <div className="grid grid-cols-7 mb-2 gap-1">
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                <div key={d} className="text-center text-[9px] font-mono uppercase tracking-widest text-[#2E2E32] py-1">
                  {d}
                </div>
              ))}
            </div>
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
