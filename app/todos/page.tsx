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
    <main className="min-h-screen bg-black">
      <div className="px-4 py-6 flex flex-col max-w-lg mx-auto">
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
