import { NextResponse } from 'next/server'
import { withAuth } from '@/utils/withAuth'
import { toMinutes } from '@/utils/time'

type TodoRouteParams = {
  id: string
}

export const PATCH = withAuth<TodoRouteParams>(
  {
    rateLimit: { key: 'todos:update', limit: 15, windowMs: 10_000 },
  },
  async ({ user, supabase, body, params }): Promise<Response> => {
    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const payload: Record<string, unknown> = body ?? {}
    const updates: Record<string, unknown> = {}

    if ('is_done' in payload) {
      if (typeof payload.is_done !== 'boolean') {
        return NextResponse.json(
          { error: 'is_done must be boolean' },
          { status: 400 },
        )
      }
      updates.is_done = payload.is_done
    }

    if ('title' in payload) {
      if (typeof payload.title !== 'string') {
        return NextResponse.json(
          { error: 'title must be string' },
          { status: 400 },
        )
      }

      const trimmed = payload.title.trim()
      if (!trimmed) {
        return NextResponse.json({ error: 'Title required' }, { status: 400 })
      }

      updates.title = trimmed
    }

    if ('description' in payload) {
      if (payload.description !== null && typeof payload.description !== 'string') {
        return NextResponse.json(
          { error: 'description must be string or null' },
          { status: 400 },
        )
      }

      updates.description =
        payload.description === null ? null : payload.description.trim()
    }

    if ('due_date' in payload) {
      if (typeof payload.due_date !== 'string') {
        return NextResponse.json(
          { error: 'due_date must be string' },
          { status: 400 },
        )
      }
      updates.due_date = payload.due_date
    }

    if ('due_time' in payload) {
      if (typeof payload.due_time !== 'string') {
        return NextResponse.json(
          { error: 'due_time must be string' },
          { status: 400 },
        )
      }
      if (!/^\d{2}:\d{2}$/.test(payload.due_time)) {
        return NextResponse.json(
          { error: 'Invalid time format' },
          { status: 400 },
        )
      }
      updates.due_time = payload.due_time
    }

    if ('end_time' in payload) {
      if (typeof payload.end_time !== 'string') {
        return NextResponse.json(
          { error: 'end_time must be string' },
          { status: 400 },
        )
      }
      if (!/^\d{2}:\d{2}$/.test(payload.end_time)) {
        return NextResponse.json(
          { error: 'Invalid time format' },
          { status: 400 },
        )
      }
      updates.end_time = payload.end_time
    }

    if ('priority' in payload) {
      const value = Number(payload.priority)
      if (![1, 2, 3].includes(value)) {
        return NextResponse.json(
          { error: 'Invalid priority' },
          { status: 400 },
        )
      }
      updates.priority = value
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    if (typeof updates.due_time === 'string' && typeof updates.end_time === 'string') {
      const startMinutes = toMinutes(updates.due_time)
      const endMinutes = toMinutes(updates.end_time)

      if (startMinutes === null || endMinutes === null) {
        return NextResponse.json(
          { error: 'Invalid time format' },
          { status: 400 },
        )
      }

      if (endMinutes <= startMinutes) {
        return NextResponse.json(
          { error: 'end_time must be after start_time' },
          { status: 400 },
        )
      }
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ todo: data })
  },
)

export const DELETE = withAuth<TodoRouteParams>(
  {
    rateLimit: { key: 'todos:delete', limit: 10, windowMs: 10_000 },
    parseBody: false,
  },
  async ({ user, supabase, params }): Promise<Response> => {
    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted_id: id })
  },
)