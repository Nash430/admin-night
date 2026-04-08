import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const content = typeof payload.content === 'string' ? payload.content.trim() : ''
  const due_date = typeof payload.due_date === 'string' ? payload.due_date : null
  const start_time = typeof payload.start_time === 'string' ? payload.start_time : null
  const end_time = typeof payload.end_time === 'string' ? payload.end_time : null
  const priority = payload.priority

  if (!content) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }
  if (!due_date) {
    return NextResponse.json({ error: 'due_date required' }, { status: 400 })
  }
  if (!start_time) {
    return NextResponse.json({ error: 'start_time required' }, { status: 400 })
  }
  if (!end_time) {
    return NextResponse.json({ error: 'end_time required' }, { status: 400 })
  }
  if (![1, 2, 3].includes(priority as number)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }
  if (!/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time)) {
    return NextResponse.json({ error: 'Invalid time format' }, { status: 400 })
  }

  const toMinutes = (value: string) => {
    const [h, m] = value.split(':').map(Number)
    return h * 60 + m
  }
  if (toMinutes(end_time) <= toMinutes(start_time)) {
    return NextResponse.json({ error: 'end_time must be after start_time' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: user.id,
      content,
      due_date,
      due_time: start_time,
      end_time,
      priority,
      is_done: false,
      sort_order: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ todo: data })
}
