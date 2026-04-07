import { format } from 'date-fns'
import type { Todo } from '@/types/todo'
import { mockTodos } from '@/components/todos/mockTodos'
import { Plus, Trash2 } from 'lucide-react'

type Props = {
  selectedDate: Date
  todos: Todo[]
}

const priorityMeta: Record<Todo['priority'], { label: string; color: string; duration: string }> = {
  1: { label: 'Meeting', color: 'text-cyan-400', duration: '30 Mins' },
  2: { label: 'Work', color: 'text-amber-400', duration: '45 Mins' },
  3: { label: 'Personal', color: 'text-pink-400', duration: '1 Hr' },
}

export default function TodoList({ selectedDate, todos }: Props) {
  const dayLabel = format(selectedDate, 'EEE, MMM d')
  const displayTodos = mockTodos
  return (
    <div className="w-full rounded-none bg-zinc-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-around gap-6">

        <button
          type="button"
          aria-label="Add todo"
        >
          <Plus />
        </button>
        <div className="text-center">
          <p className=" uppercase tracking-[0.4em] text-xl font-extrabold">My Day</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-zinc-600">{dayLabel}</p>
        </div>
        <button
          type="button"
          aria-label="Delete completed"
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
          return (
            <div key={todo.id} className="flex items-start gap-4">
              <div className="w-12 text-right text-xs font-semibold text-zinc-300">{todo.due_time ?? '--:--'}</div>
              <div className="flex flex-1 items-start justify-between gap-4 border-l border-zinc-800 pl-4">
                <div>
                  <p
                    className={[
                      'text-sm font-semibold',
                      todo.is_done ? 'text-zinc-500 line-through' : 'text-white',
                    ].join(' ')}
                  >
                    {todo.content}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className={meta.color}>{meta.label}</span>
                    <span>•</span>
                    <span>{meta.duration}</span>
                  </div>
                </div>
                <div
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full border',
                    todo.is_done
                      ? 'border-white bg-white text-black'
                      : 'border-zinc-600 text-zinc-600',
                  ].join(' ')}
                >
                  {todo.is_done ? '✓' : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
