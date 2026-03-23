import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 確認登入
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { location_name, address, lat, lng, starts_at, max_participants } = body

  // 新增場次
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      host_id: user.id,
      location_name,
      address,
      lat,
      lng,
      starts_at,
      max_participants,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 把 host 自己加入 participants
  await supabase
    .from('participants')
    .insert({
      session_id: data.id,
      user_id: user.id,
      status: 'confirmed',
    })

  return NextResponse.json({ session: data })
}