import type { Todo } from '@/types/todo'

export const mockTodos: Todo[] = [
  {
    id: '1',
    content: '寫首頁',
    due_date: '2026-04-06',
    due_time: '09:30',
    is_done: false,
    priority: 1,
  },
  {
    id: '2',
    content: '整理 schema',
    due_date: '2026-04-06',
    due_time: '14:00',
    is_done: false,
    priority: 2,
  },
  {
    id: '3',
    content: '修改 feed',
    due_date: '2026-04-06',
    due_time: '17:00',
    is_done: true,
    priority: 3,
  },
  {
    id: '4',
    content: 'session UI',
    due_date: '2026-04-12',
    due_time: '10:00',
    is_done: false,
    priority: 1,
  },
]