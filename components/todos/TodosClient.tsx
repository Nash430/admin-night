'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import TodoCalendar from '@/components/todos/TodoCalendar'
import TodoList from '@/components/todos/TodoList'
import type { NewTodoInput, Todo } from '@/types/todo'

type Props = {
  initialTodos: Todo[]
}

type JsonObject = Record<string, unknown>

function createTempId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `temp-${crypto.randomUUID()}`
  }

  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

//根據新增表單 input，建立一筆前端暫時顯示用的 optimistic todo
function createOptimisticTodo(input: NewTodoInput, tempId: string): Todo {
  return {
    //先塞 tempId，之後等 API 成功再換成真正的 server id
    id: tempId,
    title: input.title,
    description: input.description ?? null,
    due_date: input.due_date,
    due_time: input.start_time,
    end_time: input.end_time,
    priority: input.priority,
    is_done: false,
  }
}

function sortTodosByTime(a: Todo, b: Todo) {
  return (a.due_time ?? '').localeCompare(b.due_time ?? '')
}

async function readJsonSafe(response: Response): Promise<JsonObject> {
  return response.json().catch(() => ({}))
}

function getErrorMessage(payload: JsonObject, fallback: string) {
  return typeof payload.error === 'string' ? payload.error : fallback
}

// 統一處理，先改 UI，失敗再 rollback
async function optimisticFetch(
  url: string,
  options: RequestInit,
  onRollback: () => void,
  fallbackMessage = 'Request failed'
): Promise<{ isSuccess: boolean; payload: JsonObject }> {
  try {
    const response = await fetch(url, options)
    const payload = await readJsonSafe(response)

    if (!response.ok) {
      console.error(getErrorMessage(payload, fallbackMessage))
      onRollback()
      return { isSuccess: false, payload }
    }

    return { isSuccess: true, payload }
  } catch (error) {
    console.error(error)
    onRollback()
    return { isSuccess: false, payload: {} }
  }
}

export default function TodosClient({ initialTodos }: Props) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')

  const selectedTodos = useMemo(() => {
    return todos
      .filter(todo => todo.due_date === selectedDateKey)
      .sort(sortTodosByTime)
  }, [todos, selectedDateKey])

  async function onCreateTodo(input: NewTodoInput) {
    const tempId = createTempId()
    const optimisticTodo = createOptimisticTodo(input, tempId)

    const removeTempTodo = () => {
      setTodos(prev => prev.filter(t => t.id !== tempId))
    }

    setTodos(prev => [...prev, optimisticTodo])

    const { isSuccess, payload } = await optimisticFetch(
      '/api/todos',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      removeTempTodo,
      'Failed to create todo'
    )

    if (!isSuccess) return

    const serverTodo = payload.todo as Todo | undefined

    if (!serverTodo?.id) {
      removeTempTodo()
      return
    }

    // 把原本 tempId 那筆 optimistic todo 換成 server 真正回來的 todo 資料
    setTodos(prev =>
      prev.map(t => (t.id === tempId ? { ...t, ...serverTodo } : t))
    )
  }

  async function onTodoUpdated(updatedTodo: Todo) {
    const todoId = updatedTodo.id

    if (!todoId) {
      console.error('Missing todo id')
      return false
    }

    const previous = todos.find(t => t.id === todoId)

    const rollback = () => {
      if (!previous) return
      setTodos(prev => prev.map(t => (t.id === previous.id ? previous : t)))
    }

    // 先更新畫面 optimistic update 讓使用者立即看到變化
    setTodos(prev => prev.map(t => (t.id === todoId ? updatedTodo : t)))

    const { isSuccess } = await optimisticFetch(
      `/api/todos/${encodeURIComponent(todoId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: todoId, is_done: updatedTodo.is_done }),
      },
      rollback,
      'Failed to update todo'
    )

    return isSuccess
  }


  // 批次刪除 todo
  async function onTodosDeleted(ids: string[]) {
    const backup = todos.filter(t => ids.includes(t.id))

    const rollback = () => {
      setTodos(prev => [...prev, ...backup].sort(sortTodosByTime))
    }

    setTodos(prev => prev.filter(t => !ids.includes(t.id)))

    const { isSuccess } = await optimisticFetch(
      '/api/todos/bulk-delete',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      },
      rollback,
      'Failed to delete todos'
    )

    return isSuccess
  }

  return (
    <>
      <TodoCalendar
        todos={todos}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <TodoList
        selectedDate={selectedDate}
        todos={selectedTodos}
        onCreateTodo={onCreateTodo}
        onTodoUpdated={onTodoUpdated}
        onTodosDeleted={onTodosDeleted}
      />
    </>
  )
}
