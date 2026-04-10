//負責「新增」流程，自己管理表單 state，呼叫 resetForm 初始化，提交時組裝 NewTodoInput 然後呼叫 onCreateTodo

'use client'

import { useEffect, useRef, useState } from 'react'
import type { NewTodoInput } from '@/types/todo'
import {
  formatDateKey,
  getDefaultTimeRange,
  parseTimeParts,
  timeValueToMinutes,
  toTimeString,
} from '@/utils/time'
import type { TimeValue } from '@/utils/time'
import TodoModalShell from '@/components/todos/TodoModalShell'
import TodoForm from '@/components/todos/TodoForm'

type Props = {
  open: boolean
  onClose: () => void
  selectedDate: Date
  onCreateTodo: (input: NewTodoInput) => void
}

function getDefaultTimes(): { start: TimeValue; end: TimeValue } {
  const defaults = getDefaultTimeRange(new Date(), 10, 60)
  return {
    start: parseTimeParts(defaults.start),
    end: parseTimeParts(defaults.end),
  }
}

export default function AddTodoModal({
  open,
  onClose,
  selectedDate,
  onCreateTodo,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [startTime, setStartTime] = useState<TimeValue>({ period: 'AM', hour: 9, minute: 0 })
  const [endTime, setEndTime] = useState<TimeValue>({ period: 'AM', hour: 10, minute: 0 })
  const [priority, setPriority] = useState<1 | 2 | 3>(3)
  const [titleError, setTitleError] = useState(false)
  const [endTouched, setEndTouched] = useState(false)

  const lastDraftDateKey = useRef<string | null>(null)
  const selectedDateKey = formatDateKey(selectedDate)

  function resetForm() {
    setTitle('')
    setDescription('')
    setPriority(3)
    setTitleError(false)
    setEndTouched(false)
    setSelectedDates([selectedDateKey])
    const { start, end } = getDefaultTimes()
    setStartTime(start)
    setEndTime(end)
  }

  useEffect(() => {
    if (!open) return
    if (lastDraftDateKey.current === selectedDateKey) return
    resetForm()
    lastDraftDateKey.current = selectedDateKey
  }, [open, selectedDateKey])

  function handleCreate() {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      setTitleError(true)
      return
    }

    if (timeValueToMinutes(endTime) <= timeValueToMinutes(startTime)) {
      setEndTouched(true)
      return
    }

    const uniqueDates = Array.from(new Set(selectedDates)).sort()
    if (uniqueDates.length === 0) {
      setSelectedDates([selectedDateKey])
      return
    }

    const payload: NewTodoInput = {
      title: trimmedTitle,
      description: trimmedDescription || null,
      due_date: uniqueDates[0],
      dates: uniqueDates,
      start_time: toTimeString(startTime),
      end_time: toTimeString(endTime),
      priority,
    }

    onCreateTodo(payload)
    resetForm()
    onClose()
  }

  return (
    <TodoModalShell open={open} onClose={onClose} title="Add Todo">
      <TodoForm
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        startTime={startTime}
        onStartTimeChange={patch => setStartTime(prev => ({ ...prev, ...patch }))}
        endTime={endTime}
        onEndTimeChange={patch => setEndTime(prev => ({ ...prev, ...patch }))}
        priority={priority}
        onPriorityChange={setPriority}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
        selectedDateKey={selectedDateKey}
        titleError={titleError}
        onTitleErrorClear={() => setTitleError(false)}
        endTouched={endTouched}
        onEndTouched={() => setEndTouched(true)}
        onSubmit={handleCreate}
      />

      <div className="mt-3">
        <button
          type="button"
          onClick={handleCreate}
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black"
        >
          Add Task
        </button>
      </div>
    </TodoModalShell>
  )
}