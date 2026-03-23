'use client'

import { useEffect, useState } from 'react'
import SessionCard from './SessionCard'
import { useRouter } from 'next/navigation'

type Session = {
  id: string
  location_name: string
  distance_meters: number
  starts_at: string
  current_count: number
  max_participants: number
  status: string
  host: {
    alias: string
    show_up_rate: number
  }
}

export default function FeedClient({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(
            `/api/sessions/nearby?lat=${latitude}&lng=${longitude}`
          )
          const data = await res.json()
          setSessions(data.sessions ?? [])
        } catch {
          setError('無法載入附近場次')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('請允許位置存取以查看附近場次')
        setLoading(false)
      }
    )
  }, [])

//   useEffect(() => {
//   // 假資料，測試用
//   setSessions([
//     {
//       id: '1',
//       location_name: '路易莎咖啡',
//       distance_meters: 350,
//       starts_at: '2025-03-23T14:00:00',
//       current_count: 1,
//       max_participants: 4,
//       status: 'open',
//       host: {
//         alias: '深夜貓',
//         show_up_rate: 0.94,
//       }
//     },
//     {
//       id: '2',
//       location_name: '星巴克信義店',
//       distance_meters: 820,
//       starts_at: '2025-03-23T15:30:00',
//       current_count: 3,
//       max_participants: 4,
//       status: 'open',
//       host: {
//         alias: '早起鳥',
//         show_up_rate: 0.88,
//       }
//     },
//     {
//       id: '3',
//       location_name: '無印良品咖啡',
//       distance_meters: 1200,
//       starts_at: '2025-03-23T16:00:00',
//       current_count: 4,
//       max_participants: 4,
//       status: 'full',
//       host: {
//         alias: '夜貓 #4271',
//         show_up_rate: 1.0,
//       }
//     }
//   ])
//   setLoading(false)
// }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500 text-sm">定位中...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <p className="text-zinc-500 text-sm text-center">{error}</p>
    </div>
  )

  return (
    <div className="px-4 py-6 flex flex-col gap-4 max-w-lg mx-auto">
      <h1 className="text-white text-xl font-bold">附近的 Admin Night</h1>
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-zinc-500 text-sm">附近還沒有人</p>
          <button className="bg-white text-black px-6 py-3 rounded-xl text-sm font-medium"
          onClick={() => router.push('/sessions/new')}
          >
            開一場
          </button>
        </div>
      ) : (
        sessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))
      )}
    </div>
  )
}