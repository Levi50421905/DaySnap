import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { deleteUserData } from '@/lib/account/delete-user-data'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient()
    await deleteUserData(supabase, userId)

    const client = await clerkClient()
    await client.users.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[account/delete] Error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus akun' },
      { status: 500 },
    )
  }
}
