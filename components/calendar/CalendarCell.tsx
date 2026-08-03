'use client'

import { useState } from 'react'
import type { Photo } from '@/types/database'

interface CalendarCellProps {
  day: number
  photo?: Photo
  isToday: boolean
  isCurrentMonth: boolean
  onClick?: () => void
}

export function CalendarCell({ day, photo, isToday, isCurrentMonth, onClick }: CalendarCellProps) {
  const [imgSrc, setImgSrc] = useState(photo?.thumbnail_url ?? photo?.url ?? null)
  const [imgFailed, setImgFailed] = useState(false)

  if (!isCurrentMonth) return <div />

  return (
    <div
      onClick={photo ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '1',
        cursor: photo ? 'pointer' : 'default',
        padding: '2px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          borderRadius: '50%',
          overflow: 'hidden',
          border: photo
            ? `2px solid ${isToday ? '#4ECDC4' : 'rgba(255,255,255,0.2)'}`
            : '1px dashed rgba(255,255,255,0.1)',
          boxShadow: isToday && photo ? '0 0 0 2px rgba(78,205,196,0.25)' : 'none',
          backgroundColor: '#141416',
        }}
      >
        {/* Foto background */}
        {imgSrc && !imgFailed && (
          <img
            src={imgSrc}
            alt=""
            onError={() => {
              if (photo?.url && imgSrc !== photo.url) {
                setImgSrc(photo.url)
              } else {
                setImgFailed(true)
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Overlay gelap di bawah agar nomor terbaca */}
        {photo && !imgFailed && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 30%, transparent 70%)',
            }}
          />
        )}

        {/* Nomor tanggal — selalu tampil */}
        <span
          style={{
            position: 'absolute',
            bottom: '12%',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 'clamp(8px, 2vw, 12px)',
            fontWeight: 600,
            fontFamily: 'sans-serif',
            color: photo && !imgFailed ? 'white' : 'rgba(255,255,255,0.25)',
            zIndex: 10,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {day}
        </span>
      </div>
    </div>
  )
}