'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { NewTodoInput, Todo } from '@/types/todo'
import { Plus, Trash2, CheckLine } from 'lucide-react'
import AddTodo from '@/components/todos/AddTodo'
import { formatDuration, formatTime } from '@/utils/time'

type Props = {
  selectedDate: Date
  todos: Todo[]
  onCreateTodo: (input: NewTodoInput) => void
  onTodoUpdated: (todo: Todo) => Promise<boolean>
  onTodosDeleted: (ids: string[]) => Promise<boolean>
}

const priorityMeta: Record<Todo['priority'], { label: string; color: string }> = {
  1: { label: 'Meeting', color: 'text-cyan-400' },
  2: { label: 'Work', color: 'text-amber-400' },
  3: { label: 'Personal', color: 'text-pink-400' },
}

export default function TodoList({ selectedDate, todos, onCreateTodo, onTodoUpdated, onTodosDeleted }: Props) {
  const dayLabel = format(selectedDate, 'EEE, MMM d, yyyy')
  const displayTodos = todos
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([])

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

  return (
    <div className="w-full rounded-none bg-zinc-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-around gap-6">
        <button type="button" aria-label="Add todo" onClick={() => setIsAddOpen(true)}>
          <Plus />
        </button>
        <div className="text-center">
          <p className=" uppercase tracking-[0.4em] text-xl font-extrabold">My Day</p>
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
        {displayTodos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-center text-sm text-zinc-500">
            No tasks for today
          </div>
        )}
        {displayTodos.map((todo) => {
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
              <div className="w-12 text-right text-xs font-semibold text-zinc-300 text-[1.06rem] leading-none
">
                {formatTime(todo.due_time) ?? '--:--'}
              </div>
              <div className="flex flex-1 items-start justify-between gap-4 border-l border-zinc-800 pl-4">
                <div aria-label="Click for details">
                  <p className={`text-sm font-semibold ${todo.is_done ? 'text-zinc-500 line-through' : 'text-white'}`}
                  >
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
                    ${isPendingDelete ? 'border-red-400 bg-red-400 text-black' : 'border-zinc-600 text-zinc-600' }`}
                >
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <AddTodo
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        selectedDate={selectedDate}
        onCreateTodo={onCreateTodo}
      />
    </div>
  )
}
