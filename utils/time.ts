export function formatDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return null
  const toMinutes = (value: string) => {
    const [h, m] = value.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
  }
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)
  if (startMinutes === null || endMinutes === null) return null
  if (endMinutes <= startMinutes) return null
  const total = endMinutes - startMinutes
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  if (hours > 0 && minutes > 0) return `${hours} Hr ${minutes} Mins`
  if (hours > 0) return `${hours} ${hours === 1 ? 'Hr' : 'Hrs'}`
  return `${minutes} Mins`
}

export function formatTime(value?: string | null) {
  if (!value) return null
  const match = value.match(/(\d{1,2}):(\d{2})/)
  if (!match) return value
  const hh = match[1].padStart(2, '0')
  const mm = match[2]
  return `${hh}:${mm}`
}
