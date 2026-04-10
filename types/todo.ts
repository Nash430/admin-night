export type Todo = {
  id: string
  title: string
  description: string | null
  due_date: string
  end_date: string | null
  due_time: string | null
  end_time: string | null
  is_done: boolean
  priority: 1 | 2 | 3
}

export type NewTodoInput = {
  title: string
  description?: string | null
  due_date: string
  end_date?: string | null
  dates?: string[]
  start_time: string
  end_time: string
  priority: 1 | 2 | 3
}
