
'use client'

import { useMemo } from 'react'
import { addDays, format, isAfter, isSameDay, parseISO } from 'date-fns'
import type { Todo } from '@/types/todo'
import MiniCalendar from '@/components/todos/MiniCalendar'

const priorityDotColor: Record<Todo['priority'], string> = {
  1: 'bg-cyan-400',
  2: 'bg-amber-400',
  3: 'bg-pink-500',
}

type Props = {
  todos: Todo[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export default function TodoCalendar({ todos, selectedDate, onSelectDate }: Props) {
  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>()
    for (const todo of todos) {
      const start = parseISO(todo.due_date)
      const end = parseISO(todo.end_date ?? todo.due_date)
      let cursor = start
      while (!isAfter(cursor, end)) {
        const key = format(cursor, 'yyyy-MM-dd')
        const list = map.get(key)
        if (list) {
          list.push(todo)
        } else {
          map.set(key, [todo])
        }
        cursor = addDays(cursor, 1)
      }
    }
    return map
  }, [todos])

  return (
    <MiniCalendar
      className="w-full bg-zinc-900 p-6 text-white shadow-2xl"
      renderDay={(day, { dateKey, inCurrentMonth }) => {
        const isSelected = isSameDay(day, selectedDate)
        const dayTodos = todosByDate.get(dateKey) ?? []
        return (
          <button
            type="button"
            onClick={() => onSelectDate(day)}
            className="flex flex-col items-center gap-1 mt-1"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm
                ${isSelected ? 'bg-white font-semibold text-black' : inCurrentMonth ? 'text-white' : 'text-zinc-600'}`}
            >
              {format(day, 'd')}
            </div>
            <div className="flex h-2 items-center justify-center gap-1 flex-wrap mx-2">
              {dayTodos.map(todo => (
                <span
                  key={todo.id}
                  className={`block h-1.5 w-1.5 rounded-full ${priorityDotColor[todo.priority]}`}
                />
              ))}
            </div>
          </button>
        )
      }}
    />
  )
}