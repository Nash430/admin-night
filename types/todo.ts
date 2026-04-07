export type Todo = {
  id: string
  content: string
  due_date: string
  due_time: string | null
  is_done: boolean
  priority: 1 | 2 | 3
}