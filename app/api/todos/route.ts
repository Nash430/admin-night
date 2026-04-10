import { NextResponse } from 'next/server'
import { withAuth } from '@/utils/withAuth'
import { toMinutes } from '@/utils/time'

export const POST = withAuth(
  { key: 'todos:create', limit: 10, windowMs: 10_000 },
  async ({ user, supabase, body }) => {
    const respondError = (message: string, status = 400) =>
      NextResponse.json({ error: message }, { status })

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const descriptionRaw = typeof body.description === 'string' ? body.description.trim() : ''
    const description = descriptionRaw ? descriptionRaw : null
    const dueDate = typeof body.due_date === 'string' ? body.due_date : null
    const endDateRaw = typeof body.end_date === 'string' ? body.end_date : null
    const dates = Array.isArray(body.dates)
      ? body.dates.filter((value): value is string => typeof value === 'string')
      : []
    const startTime = typeof body.start_time === 'string' ? body.start_time : null
    const endTime = typeof body.end_time === 'string' ? body.end_time : null
    const priority = Number(body.priority)

    if (!title) return respondError('Title required')

    const uniqueDates = Array.from(new Set(dates)).sort()
    if (uniqueDates.length === 0 && !dueDate) return respondError('due_date required')

    const endDate = uniqueDates.length > 0 ? null : (endDateRaw ?? dueDate)
    if (uniqueDates.length === 0 && endDate && dueDate && endDate < dueDate) {
      return respondError('end_date must be on or after due_date')
    }
    if (!startTime) return respondError('start_time required')
    if (!endTime) return respondError('end_time required')
    if (![1, 2, 3].includes(priority)) return respondError('Invalid priority')
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return respondError('Invalid time format')
    }

    const startMinutes = toMinutes(startTime)
    const endMinutes = toMinutes(endTime)
    if (startMinutes === null || endMinutes === null) {
      return respondError('Invalid time format')
    }
    if ((uniqueDates.length > 0 || endDate === dueDate) && endMinutes <= startMinutes) {
      return respondError('end_time must be after start_time')
    }

    const baseRow = {
      user_id: user.id,
      title,
      description,
      due_time: startTime,
      end_time: endTime,
      priority,
      is_done: false,
      sort_order: 0,
    }

    const rows = uniqueDates.length > 0
      ? uniqueDates.map(dateKey => ({
          ...baseRow,
          due_date: dateKey,
          end_date: null,
        }))
      : [{
          ...baseRow,
          due_date: dueDate,
          end_date: endDate,
        }]

    const { data, error: insertError } = await supabase
      .from('todos')
      .insert(rows)
      .select('id,due_date')

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    if (uniqueDates.length > 0) {
      return NextResponse.json({ todos: data ?? [] })
    }

    return NextResponse.json({ todo: data?.[0] ?? null })
  },
)
