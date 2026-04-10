import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rateLimit'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type JsonBody = Record<string, unknown>
type MaybePromise<T> = T | Promise<T>

type RateLimitConfig = {
  key: string
  limit: number
  windowMs: number
}

type WithAuthOptions = {
  rateLimit?: RateLimitConfig
  parseBody?: boolean
}

type RouteContext<TParams> = {
  params: MaybePromise<TParams>
}

type HandlerContext<TParams = undefined> = {
  request: NextRequest
  user: User
  supabase: SupabaseClient
  body: JsonBody | undefined
  params: TParams
}

type Handler<TParams = undefined> = (
  ctx: HandlerContext<TParams>
) => Promise<Response>

export function withAuth<TParams = undefined>(
  options: WithAuthOptions,
  handler: Handler<TParams>,
) {
  return async (
    request: NextRequest,
    context?: RouteContext<TParams>,
  ): Promise<Response> => {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (options.rateLimit) {
      const limiter = rateLimit(
        `${options.rateLimit.key}:${user.id}`,
        options.rateLimit.limit,
        options.rateLimit.windowMs,
      )

      if (!limiter.ok) {
        const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000)
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } },
        )
      }
    }

    let body: JsonBody | undefined = undefined

    if (options.parseBody !== false) {
      let raw: unknown

      try {
        raw = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }

      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }

      body = raw as JsonBody
    }

    const params = (context?.params
      ? await context.params
      : undefined) as TParams

    return handler({
      request,
      user,
      supabase,
      body,
      params,
    })
  }
}
