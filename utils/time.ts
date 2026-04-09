export function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function minutesToTime(totalMinutes: number) {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export function periodToMinutes(period: 'AM' | 'PM', hour: number, minute: number) {
  const hour24 = period === 'AM' ? hour % 12 : (hour % 12) + 12
  return hour24 * 60 + minute
}

export function parseTimeParts(value: string) {
  const [hh, mm] = value.split(':').map(Number)
  const period: 'AM' | 'PM' = hh >= 12 ? 'PM' : 'AM'
  const hour = hh % 12 === 0 ? 12 : hh % 12
  return { period, hour, minute: mm }
}

export function getDefaultTimeRange(
  now = new Date(),
  stepMinutes = 10,
  durationMinutes = 60
) {
  const totalMinutes = now.getHours() * 60 + now.getMinutes()
  const lastSlot = 24 * 60 - stepMinutes
  const latestStart = lastSlot - durationMinutes
  const roundedStart = Math.floor(totalMinutes / stepMinutes) * stepMinutes + stepMinutes
  const startValue = Math.min(Math.max(0, roundedStart), latestStart)
  const endValue = Math.min(startValue + durationMinutes, lastSlot)

  return {
    start: minutesToTime(startValue),
    end: minutesToTime(endValue),
  }
}

export function formatDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return null
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
