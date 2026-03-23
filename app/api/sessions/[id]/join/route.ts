import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionId = params.id

  // 確認場次存在且是 open 狀態
  const { data: session } = await supabase
    .from('sessions')
    .select('id, status, max_participants, host_id')
    .eq('id', sessionId)
    .single()

  if (!session) {
    return NextResponse.json({ error: '找不到這場' }, { status: 404 })
  }

  if (session.status !== 'open') {
    return NextResponse.json({ error: '這場已無法加入' }, { status: 400 })
  }

  if (session.host_id === user.id) {
    return NextResponse.json({ error: '你是這場的 Host' }, { status: 400 })
  }

  // 確認人數還沒滿
  const { count } = await supabase
    .from('participants')
    .select('id', { count: 'exact' })
    .eq('session_id', sessionId)
    .not('status', 'in', '(cancelled,no_show)')

  if ((count ?? 0) >= session.max_participants) {
    return NextResponse.json({ error: '人數已滿' }, { status: 400 })
  }

  // 確認沒有重複加入
  const { data: existing } = await supabase
    .from('participants')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (existing && existing.status !== 'cancelled') {
    return NextResponse.json({ error: '你已加入這場' }, { status: 400 })
  }

  // 新增 participant
  const { error } = await supabase
    .from('participants')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      status: 'pending',
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 如果人數滿了，更新 session status 為 full
  if ((count ?? 0) + 1 >= session.max_participants) {
    await supabase
      .from('sessions')
      .update({ status: 'full' })
      .eq('id', sessionId)
  }

  return NextResponse.json({ success: true })
}