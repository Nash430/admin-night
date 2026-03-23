
'use client'

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

export default function SessionCard({ session }: { session: Session }) {
    const router = useRouter()
    const distanceText = session.distance_meters < 1000
        ? `${session.distance_meters}m`
        : `${(session.distance_meters / 1000).toFixed(1)}km`

    const spotsLeft = session.max_participants - session.current_count
    const isFull = spotsLeft === 0

    return (
        <div
            // onClick={() => {
            //     console.log('clicked', session.id)
            //     router.push(`/sessions/${session.id}`)
            // }}
            className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3 border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm text-zinc-300">
                    {session.host.alias.slice(0, 2)}
                </div>
                <div>
                    <p className="text-white text-sm font-medium">{session.host.alias}</p>
                    <p className="text-zinc-500 text-xs">
                        到場率 {Math.round(session.host.show_up_rate * 100)}%
                    </p>
                </div>
            </div>

            <div>
                <p className="text-white font-medium">{session.location_name}</p>
                <p className="text-zinc-400 text-sm">距離你 {distanceText}</p>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-sm">
                    {session.current_count} / {session.max_participants} 人
                </p>
                <button
                    // onClick={(e) => e.stopPropagation()}
                    onClick={() => {
                console.log('clicked', session.id)
                router.push(`/sessions/${session.id}`)
            }}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isFull
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                >
                    {isFull ? '已滿' : '加入'}
                </button>
            </div>
        </div>
    )
}