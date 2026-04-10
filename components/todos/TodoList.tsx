// 當日待辦列表元件，接收選定日期與該日篩選後的 todos，顯示每筆待辦的時間、標題、分類與時長，提供完成狀態切換、批次勾選刪除、點擊開啟詳情編輯
// 掛載 AddTodoModal和TodoDetailModal 兩個 Modal

'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import type { NewTodoInput, Todo, TodoUpdateInput } from '@/types/todo'
import { Plus, Trash2, CheckLine } from 'lucide-react'
import AddTodoModal from '@/components/todos/AddTodoModal'
import TodoDetailModal from '@/components/todos/TodoDetailModal'
import { formatDuration, formatTime } from '@/utils/time'

type Props = {
  selectedDate: Date
  todos: Todo[]
  onCreateTodo: (input: NewTodoInput) => void
  onTodoUpdated: (todo: Todo) => Promise<boolean>
  onTodoEdited: (id: string, updates: TodoUpdateInput) => Promise<boolean>
  onTodosDeleted: (ids: string[]) => Promise<boolean>
}

const priorityMeta: Record<Todo['priority'], { label: string; color: string }> = {
  1: { label: 'Meeting', color: 'text-cyan-400' },
  2: { label: 'Work', color: 'text-amber-400' },
  3: { label: 'Personal', color: 'text-pink-400' },
}

export default function TodoList({
  selectedDate,
  todos,
  onCreateTodo,
  onTodoUpdated,
  onTodoEdited,
  onTodosDeleted,
}: Props) {
  const dayLabel = format(selectedDate, 'EEE, MMM d, yyyy')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([])
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setSelectedDeleteIds([])
  }, [selectedDate])

  async function handleToggleDone(todo: Todo) {
    await onTodoUpdated({ ...todo, is_done: !todo.is_done })
  }

  function handleToggleDeleteSelection(id: string) {
    setSelectedDeleteIds(prev => (
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    ))
  }

  async function handleDeleteSelected() {
    if (selectedDeleteIds.length === 0) return
    const ids = selectedDeleteIds
    setSelectedDeleteIds([])
    const isSuccess = await onTodosDeleted(ids)
    if (!isSuccess) setSelectedDeleteIds(ids)
  }

  async function handleDeleteSingle(id: string) {
    const isSuccess = await onTodosDeleted([id])
    if (isSuccess) {
      setIsDetailOpen(false)
      setDetailTodo(null)
    }
    return isSuccess
  }

  async function handleEditTodo(id: string, updates: TodoUpdateInput) {
    const isSuccess = await onTodoEdited(id, updates)
    if (isSuccess) {
      setDetailTodo(prev => (prev && prev.id === id ? { ...prev, ...updates } : prev))
    }
    return isSuccess
  }

  return (
    <div className="w-full rounded-none bg-zinc-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-around gap-6">
        <button type="button" aria-label="Add todo" onClick={() => setIsAddOpen(true)}>
          <Plus />
        </button>
        <div className="text-center">
          <p className="uppercase tracking-[0.4em] text-xl font-extrabold">My Day</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-600">{dayLabel}</p>
        </div>
        <button
          type="button"
          aria-label="Delete selected"
          onClick={handleDeleteSelected}
          disabled={selectedDeleteIds.length === 0}
          className={selectedDeleteIds.length > 0 ? 'text-red-300' : 'text-zinc-600'}
        >
          <Trash2 />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {todos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-center text-sm text-zinc-500">
            No tasks for today
          </div>
        )}
        {todos.map((todo) => {
          const meta = priorityMeta[todo.priority]
          const durationLabel = formatDuration(todo.due_time, todo.end_time)
          const isPendingDelete = selectedDeleteIds.includes(todo.id)
          return (
            <div key={todo.id} className="flex items-start gap-3">
              <button
                type="button"
                aria-label={todo.is_done ? 'Mark as not done' : 'Mark as done'}
                onClick={() => handleToggleDone(todo)}
                className={todo.is_done ? 'text-emerald-300' : 'text-zinc-500'}
              >
                <CheckLine className="h-5 w-5" />
              </button>
              <div className="w-12 text-right text-xs font-semibold text-zinc-300 text-[1.06rem] leading-none">
                {formatTime(todo.due_time) ?? '--:--'}
              </div>
              <div className="flex flex-1 items-start justify-between gap-4 border-l border-zinc-800 pl-4">
                <div
                  aria-label="Click for details"
                  className="w-full"
                  role="button"
                  onClick={() => {
                    setDetailTodo(todo)
                    setIsDetailOpen(true)
                  }}
                >
                  <p className={`text-sm font-semibold ${todo.is_done ? 'text-zinc-500 line-through' : 'text-white'}`}>
                    {todo.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className={meta.color}>{meta.label}</span>
                    <span>•</span>
                    <span>{durationLabel ?? '--'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Select for delete"
                  onClick={() => handleToggleDeleteSelection(todo.id)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors
                    ${isPendingDelete ? 'border-red-400 bg-red-400 text-black' : 'border-zinc-600 text-zinc-600'}`}
                >
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <AddTodoModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        selectedDate={selectedDate}
        onCreateTodo={onCreateTodo}
      />

      <TodoDetailModal
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setDetailTodo(null)
        }}
        selectedDate={selectedDate}
        todo={detailTodo}
        onUpdateTodo={handleEditTodo}
        onDeleteTodo={handleDeleteSingle}
      />
    </div>
  )
}