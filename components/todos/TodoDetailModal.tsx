//負責「檢視 / 編輯 / 刪除」流程。打開時從 todo prop 載入資料並建立 snapshot，切換 edit 模式、偵測有無變更、提交更新或刪除，所有條件判斷都只跟 detail 模式有關

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo, TodoUpdateInput } from '@/types/todo'
import {
  formatDateKey,
  parseTimeParts,
  toTimeString,
  timeValueToMinutes,
} from '@/utils/time'
import type { TimeValue } from '@/utils/time'
import TodoModalShell from '@/components/todos/TodoModalShell'
import TodoForm from '@/components/todos/TodoForm'

type Props = {
  open: boolean
  onClose: () => void
  selectedDate: Date
  todo: Todo | null
  onUpdateTodo: (id: string, updates: TodoUpdateInput) => Promise<boolean>
  onDeleteTodo: (id: string) => Promise<boolean>
}

function buildSnapshot(
  title: string,
  description: string,
  dueDate: string,
  startTime: TimeValue,
  endTime: TimeValue,
  priority: number,
) {
  return JSON.stringify({
    title: title.trim(),
    description: description.trim(),
    due_date: dueDate,
    start: toTimeString(startTime),
    end: toTimeString(endTime),
    priority,
  })
}

export default function TodoDetailModal({
  open,
  onClose,
  selectedDate,
  todo,
  onUpdateTodo,
  onDeleteTodo,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [startTime, setStartTime] = useState<TimeValue>({ period: 'AM', hour: 9, minute: 0 })
  const [endTime, setEndTime] = useState<TimeValue>({ period: 'AM', hour: 10, minute: 0 })
  const [priority, setPriority] = useState<1 | 2 | 3>(3)
  const [titleError, setTitleError] = useState(false)
  const [endTouched, setEndTouched] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [initialSnapshot, setInitialSnapshot] = useState('')

  const selectedDateKey = formatDateKey(selectedDate)
  const isReadOnly = !isEditing

  const sortedSelectedDates = useMemo(
    () => Array.from(new Set(selectedDates)).sort(),
    [selectedDates],
  )

  function initFromTodo(source: Todo) {
    setTitle(source.title ?? '')
    setDescription(source.description ?? '')
    setPriority(source.priority ?? 3)
    setTitleError(false)
    setEndTouched(false)
    setSelectedDates([source.due_date])
    setIsEditing(false)

    const start = parseTimeParts(source.due_time ?? '09:00')
    const end = parseTimeParts(source.end_time ?? '10:00')
    setStartTime(start)
    setEndTime(end)

    setInitialSnapshot(
      buildSnapshot(
        source.title ?? '',
        source.description ?? '',
        source.due_date,
        start,
        end,
        source.priority ?? 3,
      )
    )
  }

  useEffect(() => {
    if (!open || !todo) return
    initFromTodo(todo)
  }, [open, todo])

  const hasChanges = useMemo(() => {
    const currentDate = sortedSelectedDates[0] ?? todo?.due_date ?? ''
    const current = buildSnapshot(title, description, currentDate, startTime, endTime, priority)
    return current !== initialSnapshot
  }, [title, description, sortedSelectedDates, todo, startTime, endTime, priority, initialSnapshot])

  async function handleUpdate() {
    if (!todo) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError(true)
      return
    }

    const startStr = toTimeString(startTime)
    const endStr = toTimeString(endTime)
    if (timeValueToMinutes(endTime) <= timeValueToMinutes(startTime)) {
      setEndTouched(true)
      return
    }

    const nextDate = sortedSelectedDates[0] ?? todo.due_date
    const updates: TodoUpdateInput = {
      title: trimmedTitle,
      description: description.trim() || null,
      due_time: startStr,
      end_time: endStr,
      priority,
    }

    if (nextDate && nextDate !== todo.due_date) {
      updates.due_date = nextDate
    }

    const isSuccess = await onUpdateTodo(todo.id, updates)
    if (isSuccess) {
      setIsEditing(false)
      setTitleError(false)
      setEndTouched(false)
      onClose()
    }
  }

  async function handleDelete() {
    if (!todo) return
    const ok = window.confirm('Are you sure you want to delete this todo?')
    if (!ok) return
    const isSuccess = await onDeleteTodo(todo.id)
    if (isSuccess) onClose()
  }

  function handleCancelEdit() {
    if (todo) initFromTodo(todo)
    setIsEditing(false)
    setTitleError(false)
    setEndTouched(false)
  }

  return (
    <TodoModalShell open={open} onClose={onClose} title="Todo Details">
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
        disabled={isReadOnly}
        titleError={titleError}
        onTitleErrorClear={() => setTitleError(false)}
        endTouched={endTouched}
        onEndTouched={() => setEndTouched(true)}
        onSubmit={isEditing ? handleUpdate : undefined}
        singleDateOnly
      />

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-full border border-red-500 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
        >
          Delete
        </button>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => (isEditing ? handleUpdate() : setIsEditing(true))}
            disabled={isEditing && !hasChanges}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              isEditing && !hasChanges
                ? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
                : 'bg-white text-black'
            }`}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    </TodoModalShell>
  )
}