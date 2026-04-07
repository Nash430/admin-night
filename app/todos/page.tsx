'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import TodoCalendar from '@/components/todos/TodoCalendar'
import TodoList from '@/components/todos/TodoList'
import { mockTodos } from '@/components/todos/mockTodos'

export default function TodosPage() {
   const [selectedDate, setSelectedDate] = useState(new Date())

  const selectedTodos = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd')

    return mockTodos
      .filter((todo) => todo.due_date === dateKey)
      .sort((a, b) => (a.due_time ?? '').localeCompare(b.due_time ?? ''))
  }, [selectedDate])
  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6">
        <TodoCalendar
          todos={mockTodos}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <TodoList selectedDate={selectedDate} todos={selectedTodos} />
      </div>
    </main>
  )
}
