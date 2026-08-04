'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { SettingsGroup } from '@/components/settings/SettingsGroup'
import { SettingsItem } from '@/components/settings/SettingsItem'
import { SettingsToggle } from '@/components/settings/SettingsToggle'

type Settings = {
  reminder_time: string
  allow_pin_after_day: boolean
  timezone: string
  auto_ai_detection: boolean
  show_secondary_snap: boolean
  allow_unknown_discovery: boolean
  theme: string
  accent_color: string
  calendar_start_day: string
  app_language: string
  collection_language: string
  show_scientific_names: boolean
  notif_daily_reminder: boolean
  notif_discovery: boolean
  notif_monthly_recap: boolean
}

const DEFAULT_SETTINGS: Settings = {
  reminder_time: '20:00',
  allow_pin_after_day: false,
  timezone: 'Asia/Jakarta',
  auto_ai_detection: true,
  show_secondary_snap: true,
  allow_unknown_discovery: true,
  theme: 'dark',
  accent_color: 'teal',
  calendar_start_day: 'sunday',
  app_language: 'id',
  collection_language: 'en',
  show_scientific_names: false,
  notif_daily_reminder: true,
  notif_discovery: true,
  notif_monthly_recap: true,
}

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storageInfo, setStorageInfo] = useState<{ photos: number; snaps: number } | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/settings')
    const data = await res.json()
    if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }))
    setLoading(false)
  }, [])

  const fetchStorage = useCallback(async () => {
    const [photosRes, snapsRes] = await Promise.all([
      fetch('/api/photos').then(r => r.json()),
      fetch('/api/snaps?main_only=false').then(r => r.json()),
    ])
    setStorageInfo({
      photos: photosRes.photos?.length ?? 0,
      snaps: snapsRes.snaps?.length ?? 0,
    })
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchStorage()
  }, [fetchSettings, fetchStorage])

  async function updateSetting(key: keyof Settings, value: boolean | string) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    window.open('/api/export', '_blank')
  }

  async function handleResetCollection() {
    if (!confirm('Hapus semua snap di Collection? Foto tetap tersimpan.')) return
    const supabase = await import('@/lib/supabase/client').then(m => m.createClient())
    const userId = user?.id
    if (userId) {
      await supabase.from('snaps').delete().eq('user_id', userId)
      alert('Collection berhasil direset.')
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold mb-6">Settings</h1>
        <div className="h-48 flex items-center justify-center text-[#6B6A66] text-sm">
          Memuat...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        {saving && (
          <span className="text-xs font-mono text-[#6B6A66]">Menyimpan...</span>
        )}
      </div>

      {/* Account */}
      <SettingsGroup label="Account">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt=""
              className="w-9 h-9 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#E8E6E1] truncate">
              {user?.fullName ?? 'User'}
            </p>
            <p className="text-xs text-[#6B6A66] truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        <SettingsItem
          label="Kelola Akun"
          sublabel="Ubah nama, foto profil, password"
          onClick={() => openUserProfile()}
        />
        <SettingsItem
          label="Logout"
          danger
          onClick={() => signOut({ redirectUrl: '/login' })}
        />
      </SettingsGroup>

      {/* Daily */}
      <SettingsGroup label="Daily">
        <SettingsItem
          label="Reminder Harian"
          sublabel="Jam berapa diingatkan untuk upload"
          value={settings.reminder_time}
        >
          <input
            type="time"
            value={settings.reminder_time}
            onChange={e => updateSetting('reminder_time', e.target.value)}
            className="bg-[#1C1C1F] border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E8E6E1] font-mono focus:outline-none focus:border-[#4ECDC4]/50"
          />
        </SettingsItem>
        <SettingsItem
          label="Zona Waktu"
          value={settings.timezone}
        >
          <select
            value={settings.timezone}
            onChange={e => updateSetting('timezone', e.target.value)}
            className="bg-[#1C1C1F] border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E8E6E1] font-mono focus:outline-none focus:border-[#4ECDC4]/50"
          >
            <option value="Asia/Jakarta">WIB (UTC+7)</option>
            <option value="Asia/Makassar">WITA (UTC+8)</option>
            <option value="Asia/Jayapura">WIT (UTC+9)</option>
          </select>
        </SettingsItem>
        <SettingsItem
          label="Pin foto setelah hari berlalu"
          sublabel="Izinkan pin foto ke hari yang sudah lewat"
        >
          <SettingsToggle
            enabled={settings.allow_pin_after_day}
            onChange={v => updateSetting('allow_pin_after_day', v)}
          />
        </SettingsItem>
      </SettingsGroup>

      {/* AI & Collection */}
      <SettingsGroup label="AI & Collection">
        <SettingsItem
          label="Auto AI Detection"
          sublabel="Analisis foto otomatis setelah upload"
        >
          <SettingsToggle
            enabled={settings.auto_ai_detection}
            onChange={v => updateSetting('auto_ai_detection', v)}
          />
        </SettingsItem>
        <SettingsItem
          label="Tampilkan Secondary Snap"
          sublabel="Snap pendukung selain main snap"
        >
          <SettingsToggle
            enabled={settings.show_secondary_snap}
            onChange={v => updateSetting('show_secondary_snap', v)}
          />
        </SettingsItem>
        <SettingsItem
          label="Izinkan Unknown Discovery"
          sublabel="Saat AI tidak yakin dengan identitas objek"
        >
          <SettingsToggle
            enabled={settings.allow_unknown_discovery}
            onChange={v => updateSetting('allow_unknown_discovery', v)}
          />
        </SettingsItem>
      </SettingsGroup>

      {/* Appearance */}
      <SettingsGroup label="Appearance">
        <SettingsItem label="Tema" value="Dark" />
        <SettingsItem
          label="Hari Pertama Kalender"
        >
          <select
            value={settings.calendar_start_day}
            onChange={e => updateSetting('calendar_start_day', e.target.value)}
            className="bg-[#1C1C1F] border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E8E6E1] font-mono focus:outline-none"
          >
            <option value="sunday">Minggu</option>
            <option value="monday">Senin</option>
          </select>
        </SettingsItem>
      </SettingsGroup>

      {/* Language */}
      <SettingsGroup label="Language">
        <SettingsItem label="App Language">
          <select
            value={settings.app_language}
            onChange={e => updateSetting('app_language', e.target.value)}
            className="bg-[#1C1C1F] border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E8E6E1] font-mono focus:outline-none"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </SettingsItem>
        <SettingsItem label="Collection Language">
          <select
            value={settings.collection_language}
            onChange={e => updateSetting('collection_language', e.target.value)}
            className="bg-[#1C1C1F] border border-white/8 rounded-lg px-2 py-1 text-xs text-[#E8E6E1] font-mono focus:outline-none"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </SettingsItem>
        <SettingsItem
          label="Tampilkan Nama Ilmiah"
          sublabel="Felis catus · Rafflesia arnoldii"
        >
          <SettingsToggle
            enabled={settings.show_scientific_names}
            onChange={v => updateSetting('show_scientific_names', v)}
          />
        </SettingsItem>
      </SettingsGroup>

      {/* Notifications */}
      <SettingsGroup label="Notifications">
        <SettingsItem label="Daily Reminder">
          <SettingsToggle
            enabled={settings.notif_daily_reminder}
            onChange={v => updateSetting('notif_daily_reminder', v)}
          />
        </SettingsItem>
        <SettingsItem label="Discovery Notification">
          <SettingsToggle
            enabled={settings.notif_discovery}
            onChange={v => updateSetting('notif_discovery', v)}
          />
        </SettingsItem>
        <SettingsItem label="Monthly Recap">
          <SettingsToggle
            enabled={settings.notif_monthly_recap}
            onChange={v => updateSetting('notif_monthly_recap', v)}
          />
        </SettingsItem>
      </SettingsGroup>

      {/* Privacy & Data */}
      <SettingsGroup label="Privacy & Data">
        <SettingsItem
          label="Export Semua Data"
          sublabel="Download foto, snaps, dan memories sebagai JSON"
          onClick={handleExport}
        />
        <SettingsItem
          label="Reset Collection"
          sublabel="Hapus semua snap tanpa hapus foto"
          onClick={handleResetCollection}
        />
      </SettingsGroup>

      {/* Storage */}
      <SettingsGroup label="Storage">
        <SettingsItem
          label="Foto"
          value={storageInfo ? `${storageInfo.photos} foto` : '—'}
        />
        <SettingsItem
          label="Collection"
          value={storageInfo ? `${storageInfo.snaps} discoveries` : '—'}
        />
      </SettingsGroup>

      {/* About */}
      <SettingsGroup label="About">
        <SettingsItem label="Versi" value="1.0.0" />
        <SettingsItem
          label="Privacy Policy"
          onClick={() => {}}
        />
      </SettingsGroup>
    </div>
  )
}