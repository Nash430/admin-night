// Todo 表單欄位元件，集合標題、描述、起迄時間選擇、優先級下拉與日曆選日期功能，透過 props 控制唯讀狀態與單/多日選擇模式

'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import type { Todo } from '@/types/todo'
import {
  formatDateKey,
  parseDateKey,
  periodToMinutes,
  timeValueToMinutes,
} from '@/utils/time'
import type { TimeValue } from '@/utils/time'
import TimeSelector from '@/components/todos/TimeSelector'
import MiniCalendar from '@/components/todos/MiniCalendar'

type Props = {
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  startTime: TimeValue
  onStartTimeChange: (patch: Partial<TimeValue>) => void
  endTime: TimeValue
  onEndTimeChange: (patch: Partial<TimeValue>) => void
  priority: Todo['priority']
  onPriorityChange: (value: Todo['priority']) => void
  selectedDates: string[]
  onSelectedDatesChange: (dates: string[]) => void
  selectedDateKey: string
  disabled?: boolean
  titleError?: boolean
  onTitleErrorClear?: () => void
  endTouched?: boolean
  onEndTouched?: () => void
  onSubmit?: () => void
  singleDateOnly?: boolean
}

export default function TodoForm({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  priority,
  onPriorityChange,
  selectedDates,
  onSelectedDatesChange,
  selectedDateKey,
  disabled = false,
  titleError = false,
  onTitleErrorClear,
  endTouched = false,
  onEndTouched,
  onSubmit,
  singleDateOnly = false,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => parseDateKey(selectedDates[0] ?? selectedDateKey)
  )
  const [showCalendar, setShowCalendar] = useState(false)

  const selectedDateSet = useMemo(() => new Set(selectedDates), [selectedDates])

  const sortedSelectedDates = useMemo(
    () => Array.from(new Set(selectedDates)).sort(),
    [selectedDates],
  )

  const primaryDateKey = sortedSelectedDates[0] ?? selectedDateKey
  const primaryDateLabel = useMemo(
    () => format(parseDateKey(primaryDateKey), 'EEE, MMM d, yyyy'),
    [primaryDateKey],
  )
  const extraDateCount = Math.max(0, sortedSelectedDates.length - 1)

  const startTotalMinutes = timeValueToMinutes(startTime)
  const endTotalMinutes = timeValueToMinutes(endTime)
  const isTimeInvalid = endTotalMinutes <= startTotalMinutes

  const endTimeDisabledCheck = {
    isPeriodDisabled: (p: 'AM' | 'PM') => p === 'AM' && startTotalMinutes >= 12 * 60,
    isHourDisabled: (h: number) => periodToMinutes(endTime.period, h, 59) <= startTotalMinutes,
    isMinuteDisabled: (m: number) =>
      periodToMinutes(endTime.period, endTime.hour, m) <= startTotalMinutes,
  }

  function toggleDateSelection(day: Date) {
    if (disabled) return
    const key = formatDateKey(day)

    if (singleDateOnly) {
      onSelectedDatesChange([key])
      return
    }

    const set = new Set(selectedDates)
    if (set.has(key)) {
      if (set.size === 1) return
      set.delete(key)
    } else {
      set.add(key)
    }
    onSelectedDatesChange(Array.from(set).sort())
  }

  function openCalendarDialog() {
    if (disabled) return
    const seedKey = sortedSelectedDates[0] ?? selectedDateKey
    setCurrentMonth(parseDateKey(seedKey))
    setShowCalendar(true)
  }

  return (
    <>
      <div className="flex mt-1">
        <div className="text-sm text-zinc-500">
          {primaryDateLabel}
          {extraDateCount > 0 ? ` +${extraDateCount}` : ''}
        </div>
        <button
          type="button"
          onClick={openCalendarDialog}
          disabled={disabled}
          aria-label="Edit dates"
          className={`ml-1 ${disabled ? 'text-zinc-600' : 'text-zinc-400 hover:text-white'}`}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Todo title"
          value={title}
          onChange={e => {
            onTitleChange(e.target.value)
            if (titleError && e.target.value.trim()) onTitleErrorClear?.()
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') onSubmit?.()
          }}
          disabled={disabled}
          className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2
            ${titleError ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-zinc-700'} ${disabled ? 'opacity-80' : ''}`}
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          rows={3}
          disabled={disabled}
          className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:opacity-80"
        />

        <div className="space-y-4">
          <div>
            <TimeSelector
              label="Start time"
              period={startTime.period}
              hour={startTime.hour}
              minute={startTime.minute}
              onPeriodChange={p => onStartTimeChange({ period: p })}
              onHourChange={h => onStartTimeChange({ hour: h })}
              onMinuteChange={m => onStartTimeChange({ minute: m })}
              disabled={disabled}
            />
          </div>
          <div>
            <TimeSelector
              label="End time"
              period={endTime.period}
              hour={endTime.hour}
              minute={endTime.minute}
              onPeriodChange={p => { onEndTimeChange({ period: p }); onEndTouched?.() }}
              onHourChange={h => { onEndTimeChange({ hour: h }); onEndTouched?.() }}
              onMinuteChange={m => { onEndTimeChange({ minute: m }); onEndTouched?.() }}
              disabledCheck={endTimeDisabledCheck}
              disabled={disabled}
            />
            {!disabled && endTouched && isTimeInvalid && (
              <p className="mt-2 text-[11px] text-amber-400">
                End time must be after start time.
              </p>
            )}
          </div>
        </div>

        <select
          value={priority}
          onChange={e => onPriorityChange(Number(e.target.value) as 1 | 2 | 3)}
          disabled={disabled}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:opacity-80"
        >
          <option value={1}>Meeting</option>
          <option value={2}>Work</option>
          <option value={3}>Personal</option>
        </select>
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowCalendar(false)}
          />
          <div className="relative z-[90] flex h-full w-full items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-4 text-white shadow-2xl"
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                  Select Dates
                </p>
              </div>

              <MiniCalendar
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                className="mt-4"
                renderDay={(day, { dateKey, inCurrentMonth }) => {
                  const isSelected = selectedDateSet.has(dateKey)
                  return (
                    <button
                      type="button"
                      onClick={() => toggleDateSelection(day)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium
                        ${isSelected ? 'bg-white text-black' : inCurrentMonth ? 'text-white' : 'text-zinc-600'}`}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                }}
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}