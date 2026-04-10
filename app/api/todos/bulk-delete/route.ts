import { NextResponse } from 'next/server'
import { withAuth } from '@/utils/withAuth'

export const POST = withAuth(
  {
    rateLimit: { key: 'todos:bulk-delete', limit: 5, windowMs: 10_000 },
  },
  async ({ user, supabase, body }): Promise<Response> => {
    const input: Record<string, unknown> = body ?? {}

    const ids = Array.isArray(input.ids)
      ? input.ids.filter((id): id is string => typeof id === 'string')
      : []

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted_ids: ids })
  },
)