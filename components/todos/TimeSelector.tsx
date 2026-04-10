//純 UI 元件，三欄式時間選擇器（AM/PM、小時、分鐘），完全無業務邏輯，未來任何需要時間輸入的地方能直接重用，可透過 disabledCheck 禁用不合法的選項

'use client'

import type { TimeValue } from '@/utils/time'

type TimeSelectorProps = {
  label: string
  period: TimeValue['period']
  hour: number
  minute: number
  onPeriodChange: (p: TimeValue['period']) => void
  onHourChange: (h: number) => void
  onMinuteChange: (m: number) => void
  disabled?: boolean
  disabledCheck?: {
    isPeriodDisabled: (p: TimeValue['period']) => boolean
    isHourDisabled: (h: number) => boolean
    isMinuteDisabled: (m: number) => boolean
  }
}

const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1)
const minuteOptions = Array.from({ length: 60 }, (_, index) => index)
const periodOptions: TimeValue['period'][] = ['AM', 'PM']

const selectClass =
  'w-full appearance-none rounded-xl bg-transparent px-2 py-3 text-center text-lg font-semibold text-white focus:outline-none'

export default function TimeSelector({
  label,
  period,
  hour,
  minute,
  onPeriodChange,
  onHourChange,
  onMinuteChange,
  disabled = false,
  disabledCheck,
}: TimeSelectorProps) {
  return (
    <label className="space-y-2 text-xs text-zinc-500">
      <span>{label}</span>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          <select
            value={period}
            onChange={e => onPeriodChange(e.target.value as TimeValue['period'])}
            disabled={disabled}
            className={selectClass}
          >
            {periodOptions.map(p => {
              const isDisabled = disabledCheck?.isPeriodDisabled(p) ?? false
              return (
                <option
                  key={p}
                  value={p}
                  disabled={isDisabled}
                  className={isDisabled ? 'bg-zinc-950 text-zinc-600' : 'bg-zinc-950 text-white'}
                >
                  {p}
                </option>
              )
            })}
          </select>

          <select
            value={hour}
            onChange={e => onHourChange(Number(e.target.value))}
            disabled={disabled}
            className={selectClass}
          >
            {hourOptions.map(h => {
              const isDisabled = disabledCheck?.isHourDisabled(h) ?? false
              return (
                <option
                  key={h}
                  value={h}
                  disabled={isDisabled}
                  className={isDisabled ? 'bg-zinc-950 text-zinc-600' : 'bg-zinc-950 text-white'}
                >
                  {h}
                </option>
              )
            })}
          </select>

          <select
            value={minute}
            onChange={e => onMinuteChange(Number(e.target.value))}
            disabled={disabled}
            className={selectClass}
          >
            {minuteOptions.map(m => {
              const isDisabled = disabledCheck?.isMinuteDisabled(m) ?? false
              return (
                <option
                  key={m}
                  value={m}
                  disabled={isDisabled}
                  className={isDisabled ? 'bg-zinc-950 text-zinc-600' : 'bg-zinc-950 text-white'}
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