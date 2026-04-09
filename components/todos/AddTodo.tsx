'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import type { NewTodoInput } from '@/types/todo'
import { getDefaultTimeRange, minutesToTime, periodToMinutes, parseTimeParts } from '@/utils/time'

type Props = {
  open: boolean
  onClose: () => void
  selectedDate: Date
  onCreateTodo: (input: NewTodoInput) => void
}

type Period = 'AM' | 'PM'

type TimeValue = {
  period: Period
  hour: number
  minute: number
}

const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1)
const minuteOptions = Array.from({ length: 60 }, (_, index) => index)
const periodOptions: Period[] = ['AM', 'PM']

type TimeSelectorProps = {
  label: string
  period: Period
  hour: number
  minute: number
  onPeriodChange: (p: Period) => void
  onHourChange: (h: number) => void
  onMinuteChange: (m: number) => void
  disabledCheck?: {
    isPeriodDisabled: (p: Period) => boolean
    isHourDisabled: (h: number) => boolean
    isMinuteDisabled: (m: number) => boolean
  }
}

const selectClass =
  'w-full appearance-none rounded-xl bg-transparent px-2 py-3 text-center text-lg font-semibold text-white focus:outline-none'

function TimeSelector({
  label,
  period,
  hour,
  minute,
  onPeriodChange,
  onHourChange,
  onMinuteChange,
  disabledCheck,
}: TimeSelectorProps) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      <span>{label}</span>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          <select
            value={period}
            onChange={e => onPeriodChange(e.target.value as Period)}
            className={selectClass}
          >
            {periodOptions.map(p => {
              const disabled = disabledCheck?.isPeriodDisabled(p) ?? false
              return (
                <option
                  key={p}
                  value={p}
                  disabled={disabled}
                  className={disabled ? 'bg-zinc-950 text-zinc-600' : 'bg-zinc-950 text-white'}
                >
                  {p}
                </option>
              )
            })}
          </select>

          <select
            value={hour}
            onChange={e => onHourChange(Number(e.target.value))}
            className={selectClass}
          >
            {hourOptions.map(h => {
              const disabled = disabledCheck?.isHourDisabled(h) ?? false
              return (
                <option
                  key={h}
                  value={h}
                  disabled={disabled}
                  className={disabled ? 'bg-zinc-950 text-zinc-600' : 'bg-zinc-950 text-white'}
                >
                  {h}
                </option>
              )
            })}
          </select>

          <select
            value={minute}
            onChange={e => onMinuteChange(Number(e.target.value))}
            className={selectClass}
          >
            {minuteOptions.map(m => {
              const disabled = disabledCheck?.isMinuteDisabled(m) ?? false
              return (
                <option
                  key={m}
                  value={m}
                  disabled={disabled}
                  className={disabled ? 'bg-zinc-950 text-zinc-600' : 'bg-zinc-950 text-white'}
                >
                  {String(m).padStart(2, '0')}
                </option>
              )
            })}
          </select>
        </div>
      </div>
    </label>
  )
}

export default function AddTodo({ open, onClose, selectedDate, onCreateTodo }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState<TimeValue>({
    period: 'AM',
    hour: 9,
    minute: 0,
  })
  const [endTime, setEndTime] = useState<TimeValue>({
    period: 'AM',
    hour: 10,
    minute: 0,
  })
  const [priority, setPriority] = useState<1 | 2 | 3>(3)
  const [titleError, setTitleError] = useState(false)
  const [endTouched, setEndTouched] = useState(false)
  const lastDraftDateKey = useRef<string | null>(null)

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')

  const startTotalMinutes = periodToMinutes(
    startTime.period,
    startTime.hour,
    startTime.minute
  )

  const endTotalMinutes = periodToMinutes(
    endTime.period,
    endTime.hour,
    endTime.minute
  )

  const isTimeInvalid = endTotalMinutes <= startTotalMinutes

  const to24Time = ({ period, hour, minute }: TimeValue) => {
    return minutesToTime(periodToMinutes(period, hour, minute))
  }

  const updateStartTime = (patch: Partial<TimeValue>) => {
    setStartTime(prev => ({ ...prev, ...patch }))
  }

  const updateEndTime = (patch: Partial<TimeValue>) => {
    setEndTime(prev => ({ ...prev, ...patch }))
    setEndTouched(true)
  }

  const setDefaultTimes = () => {
    const { start, end } = getDefaultTimeRange(new Date(), 10, 60)
    setStartTime(parseTimeParts(start))
    setEndTime(parseTimeParts(end))
  }

  const resetDraft = () => {
    setTitle('')
    setDescription('')
    setPriority(3)
    setTitleError(false)
    setEndTouched(false)
    setDefaultTimes()
  }

  useEffect(() => {
    if (!open) return
    if (lastDraftDateKey.current === selectedDateKey) return

    resetDraft()
    lastDraftDateKey.current = selectedDateKey
  }, [open, selectedDateKey])

  const endTimeDisabledCheck = {
    isPeriodDisabled: (p: Period) => p === 'AM' && startTotalMinutes >= 12 * 60,
    isHourDisabled: (h: number) => periodToMinutes(endTime.period, h, 59) <= startTotalMinutes,
    isMinuteDisabled: (m: number) =>
      periodToMinutes(endTime.period, endTime.hour, m) <= startTotalMinutes,
  }

  function handleSubmit() {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      setTitleError(true)
      return
    }

    if (isTimeInvalid) {
      setEndTouched(true)
      return
    }

    const payload: NewTodoInput = {
      title: trimmedTitle,
      description: trimmedDescription ? trimmedDescription : null,
      due_date: selectedDateKey,
      start_time: to24Time(startTime),
      end_time: to24Time(endTime),
      priority,
    }

    onCreateTodo(payload)
    resetDraft()
    onClose()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] mx-auto w-full max-w-sm rounded-t-3xl bg-zinc-900 p-6 text-white shadow-2xl transition-transform
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">
            Add Todo
          </p>
          <button type="button" className="text-zinc-400 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-zinc-600">{format(selectedDate, 'EEE, MMM d, yyyy')}</p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Todo title"
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              if (titleError && e.target.value.trim()) { setTitleError(false) }
            }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2
              ${ titleError ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-zinc-700'}`}
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          />

          <div className="space-y-4">
            <div>
              <TimeSelector label="Start time"
                period={startTime.period}
                hour={startTime.hour}
                minute={startTime.minute}
                onPeriodChange={p => updateStartTime({ period: p })}
                onHourChange={h => updateStartTime({ hour: h })}
                onMinuteChange={m => updateStartTime({ minute: m })}
              />
            </div>

            <div>
              <TimeSelector label="End time"
                period={endTime.period}
                hour={endTime.hour}
                minute={endTime.minute}
                onPeriodChange={p => updateEndTime({ period: p })}
                onHourChange={h => updateEndTime({ hour: h })}
                onMinuteChange={m => updateEndTime({ minute: m })}
                disabledCheck={endTimeDisabledCheck}
              />
              {endTouched && isTimeInvalid && (
                <p className="mt-2 text-[11px] text-amber-400">
                  End time must be after start time.
                </p>
              )}
            </div>
          </div>

          <select
            value={priority}
            onChange={e => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
          >
            <option value={1}>Meeting</option>
            <option value={2}>Work</option>
            <option value={3}>Personal</option>
          </select>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black"
          >
            Add Task
          </button>
        </div>
      </div>
    </>
  )
}