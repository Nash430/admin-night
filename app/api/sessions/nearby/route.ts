import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '0')
  const lng = parseFloat(searchParams.get('lng') ?? '0')

  console.log(lat, lng, 'check')

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 驗證使用者身分
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      id,
      location_name,
      lat,
      lng,
      starts_at,
      max_participants,
      status,
      host:users!host_id (
        alias,
        show_up_rate
      ),
      participants (
        id,
        status
      )
    `)
    .in('status', ['open', 'full'])
    .neq('host_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180

  // 先全部算距離，再排序
  const allSessionsWithDistance = (sessions ?? [])
    .map((session) => {
      const dLat = toRad(session.lat - lat)
      const dLng = toRad(session.lng - lng)

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) *
          Math.cos(toRad(session.lat)) *
          Math.sin(dLng / 2) ** 2

      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      const current_count = (session.participants ?? []).filter(
        (p: { status: string }) =>
          p.status !== 'cancelled' && p.status !== 'no_show'
      ).length

      return {
        id: session.id,
        location_name: session.location_name,
        distance_meters: Math.round(distance),
        starts_at: session.starts_at,
        current_count,
        max_participants: session.max_participants,
        status: session.status,
        host: session.host,
      }
    })
    .sort((a, b) => a.distance_meters - b.distance_meters)

  // 先找 5 公里內
  let nearby = allSessionsWithDistance.filter(
    (s) => s.distance_meters <= 5000
  )

  // 如果沒有，擴大到 10 公里
  if (nearby.length === 0) {
    nearby = allSessionsWithDistance.filter((s) => s.distance_meters <= 10000)
  }

  // 如果還沒有，擴大到 20 公里
  if (nearby.length === 0) {
    nearby = allSessionsWithDistance.filter((s) => s.distance_meters <= 20000)
  }

  // 如果還是沒有，回傳最近的 5 筆
  if (nearby.length === 0) {
    nearby = allSessionsWithDistance.slice(0, 5)
  }

  return NextResponse.json({ sessions: nearby })
}