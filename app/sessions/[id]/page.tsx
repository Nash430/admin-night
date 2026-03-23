import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SessionDetail from '@/components/session/SessionDetail'

export default async function SessionPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 查詢場次基本資訊（不含地址）
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      id,
      location_name,
      starts_at,
      max_participants,
      status,
      host_id,
      host:users!host_id (
        alias,
        show_up_rate
      ),
      participants (
        id,
        user_id,
        status
      )
    `)
    .eq('id', params.id)
    .single()

  if (!session) redirect('/feed')

  const currentCount = session.participants.filter(
    (p: { status: string }) =>
      p.status !== 'cancelled' && p.status !== 'no_show'
  ).length

  const isHost = session.host_id === user.id
  const hasJoined = session.participants.some(
    (p: { user_id: string; status: string }) =>
      p.user_id === user.id &&
      p.status !== 'cancelled' &&
      p.status !== 'no_show'
  )

  return (
    <SessionDetail
      session={{
        id: session.id,
        location_name: session.location_name,
        starts_at: session.starts_at,
        max_participants: session.max_participants,
        status: session.status,
        current_count: currentCount,
        host: Array.isArray(session.host) ? session.host[0] : session.host,
      }}
      userId={user.id}
      isHost={isHost}
      hasJoined={hasJoined}
    />
  )
}