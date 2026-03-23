'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Session = {
  id: string
  location_name: string
  starts_at: string
  max_participants: number
  current_count: number
  status: string
  host: {
    alias: string
    show_up_rate: number
  }
}

type Props = {
  session: Session
  userId: string
  isHost: boolean
  hasJoined: boolean
}

export default function SessionDetail({ session, userId, isHost, hasJoined }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isFull = session.current_count >= session.max_participants

  async function handleJoin() {
    setLoading(true)
    const res = await fetch(`/api/sessions/${session.id}/join`, {
      method: 'POST',
    })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? '加入失敗')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 max-w-lg mx-auto">

      {/* 返回 */}
      <button
        onClick={() => router.push('/feed')}
        className="text-zinc-500 text-sm mb-8"
      >
        ← 返回
      </button>

      {/* Host 資訊 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300">
          {session.host.alias.slice(0, 2)}
        </div>
        <div>
          <p className="text-white font-medium">{session.host.alias}</p>
          <p className="text-zinc-500 text-sm">
            到場率 {Math.round(session.host.show_up_rate * 100)}%
          </p>
        </div>
      </div>

      {/* 場次資訊 */}
      <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-4 border border-zinc-800 mb-6">
        <div>
          <p className="text-zinc-500 text-xs mb-1">地點</p>
          <p className="text-white font-medium">{session.location_name}</p>
          {hasJoined && (
            <p className="text-zinc-400 text-sm mt-1">
              加入後顯示完整地址
            </p>
          )}
        </div>

        <div>
          <p className="text-zinc-500 text-xs mb-1">開始時間</p>
          <p className="text-white">
            {new Date(session.starts_at).toLocaleString('zh-TW', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 text-xs mb-1">人數</p>
          <p className="text-white">
            {session.current_count} / {session.max_participants} 人
          </p>
        </div>
      </div>

      {/* 按鈕區 */}
      {isHost ? (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
          <p className="text-zinc-400 text-sm">你是這場的 Host</p>
        </div>
      ) : hasJoined ? (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
          <p className="text-zinc-400 text-sm">你已加入這場</p>
        </div>
      ) : (
        <button
          onClick={handleJoin}
          disabled={isFull || loading}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            isFull
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200'
          }`}
        >
          {loading ? '加入中...' : isFull ? '已滿' : '加入這場'}
        </button>
      )}

    </div>
  )
}