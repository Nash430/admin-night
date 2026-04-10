import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rateLimit'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type RateLimitConfig = {
  key: string
  limit: number
  windowMs: number
}

type HandlerContext = {
  user: User
  supabase: SupabaseClient
  body: Record<string, unknown>
}

type Handler = (ctx: HandlerContext) => Promise<NextResponse>

export function withAuth(rateLimitConfig: RateLimitConfig, handler: Handler) {
  return async (request: NextRequest) => {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limiter = rateLimit(
      `${rateLimitConfig.key}:${user.id}`,
      rateLimitConfig.limit,
      rateLimitConfig.windowMs,
    )
    if (!limiter.ok) {
      const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      )
    }

    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const body = raw as Record<string, unknown>

    return handler({ user, supabase, body })
  }
}