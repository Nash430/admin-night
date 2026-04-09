'use client'

import { useMemo, useState } from 'react'
import { addMonths, subMonths, format, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildCalendarDays, formatDateKey, WEEK_LABELS } from '@/utils/time'

type Props = {
  initialMonth?: Date
  currentMonth?: Date
  onMonthChange?: (month: Date) => void
  renderDay: (day: Date, opts: { dateKey: string; inCurrentMonth: boolean }) => React.ReactNode
  className?: string
}

export default function MiniCalendar({
  initialMonth,
  currentMonth: controlledMonth,
  onMonthChange,
  renderDay,
  className = '',
}: Props) {
  const [internalMonth, setInternalMonth] = useState(initialMonth ?? new Date())
  const month = controlledMonth ?? internalMonth

  const setMonth = (m: Date) => {
    onMonthChange ? onMonthChange(m) : setInternalMonth(m)
  }

  const days = useMemo(() => buildCalendarDays(month), [month])

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(subMonths(month, 1))}
          className="rounded-lg p-1 text-zinc-400 hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-zinc-400">{format(month, 'yyyy')}</p>
          <h2 className="text-lg font-bold uppercase tracking-[0.15em]">
            {format(month, 'MMMM')}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="rounded-lg p-1 text-zinc-400 hover:text-white"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-zinc-500">
        {WEEK_LABELS.map((label, i) => (
          <div key={`${label}-${i}`}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {days.map(day => {
          const dateKey = formatDateKey(day)
          const inCurrentMonth = isSameMonth(day, month)
          return (
            <div key={dateKey} className="flex justify-center">
              {renderDay(day, { dateKey, inCurrentMonth })}
            </div>
          )
        })}
      </div>
    </div>
  )
}