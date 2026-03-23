'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    location_name: '',
    address: '',
    starts_at: '',
    max_participants: 4,
  })

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setLoading(true)

    // 取得目前位置
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            lat: latitude,
            lng: longitude,
          }),
        })

        if (res.ok) {
          router.push('/feed')
        } else {
          alert('開場失敗，請再試一次')
          setLoading(false)
        }
      },
      () => {
        alert('請允許位置存取')
        setLoading(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 max-w-lg mx-auto">
      <h1 className="text-white text-xl font-bold mb-8">開一場 Admin Night</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">地點名稱</label>
          <input
            type="text"
            placeholder="例如：路易莎、星巴克"
            value={form.location_name}
            onChange={e => setForm({ ...form, location_name: e.target.value })}
            required
            className="bg-zinc-900 text-white rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">完整地址</label>
          <input
            type="text"
            placeholder="例如：台北市信義區忠孝東路五段"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            required
            className="bg-zinc-900 text-white rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">開始時間</label>
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={e => setForm({ ...form, starts_at: e.target.value })}
            required
            className="bg-zinc-900 text-white rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">人數上限</label>
          <select
            value={form.max_participants}
            onChange={e => setForm({ ...form, max_participants: Number(e.target.value) })}
            className="bg-zinc-900 text-white rounded-xl px-4 py-3 border border-zinc-800 focus:outline-none focus:border-zinc-600"
          >
            <option value={2}>2 人</option>
            <option value={3}>3 人</option>
            <option value={4}>4 人</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? '開場中...' : '開一場'}
        </button>

      </form>
    </div>
  )
}