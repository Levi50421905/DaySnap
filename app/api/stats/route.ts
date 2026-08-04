import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  // Ambil semua foto
  const { data: photos } = await supabase
    .from('photos')
    .select('date_taken')
    .eq('user_id', userId)
    .order('date_taken', { ascending: true })

  // Ambil semua snaps
  const { data: snaps } = await supabase
    .from('snaps')
    .select('current_rarity, category, created_at, is_main')
    .eq('user_id', userId)

  // Ambil memories
  const { data: memories } = await supabase
    .from('memories')
    .select('id')
    .eq('user_id', userId)

  const photoList = photos ?? []
  const snapList = snaps ?? []

  // Hitung hari aktif
  const activeDays = new Set(photoList.map(p => p.date_taken)).size

  // Hitung streak
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date()
  const sortedDates = [...new Set(photoList.map(p => p.date_taken))].sort()

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = new Date(sortedDates[i - 1])
      const curr = new Date(sortedDates[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)
  }

  // Current streak — cek dari hari ini mundur
  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1])
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0]

    if (sortedDates[sortedDates.length - 1] === todayStr ||
        sortedDates[sortedDates.length - 1] === yesterdayStr) {
      currentStreak = tempStreak
    }
  }

  // Rarity terlangka
  const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common']
  const rarityCount: Record<string, number> = {}
  for (const snap of snapList) {
    rarityCount[snap.current_rarity] = (rarityCount[snap.current_rarity] ?? 0) + 1
  }

  const rarestRarity = rarityOrder.find(r => rarityCount[r] > 0) ?? null

  // Kategori terbanyak
  const categoryCount: Record<string, number> = {}
  for (const snap of snapList.filter(s => s.is_main)) {
    if (snap.category) {
      categoryCount[snap.category] = (categoryCount[snap.category] ?? 0) + 1
    }
  }
  const topCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // Discovery Index bulan ini
  const thisMonth = today.toISOString().slice(0, 7)
  const monthSnaps = snapList.filter(s => s.created_at.startsWith(thisMonth))
  const rarityScore: Record<string, number> = {
    legendary: 100, epic: 60, rare: 30, uncommon: 15, common: 5
  }
  const discoveryIndex = monthSnaps.reduce((acc, s) => {
    return acc + (rarityScore[s.current_rarity] ?? 0)
  }, 0)

  return NextResponse.json({
    active_days: activeDays,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_snaps: snapList.filter(s => s.is_main).length,
    rarest_rarity: rarestRarity,
    rarity_count: rarityCount,
    top_category: topCategory,
    discovery_index: discoveryIndex,
    total_memories: memories?.length ?? 0,
  })
}