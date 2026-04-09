'use client'

import { useMemo, useState } from 'react'
import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
} from 'date-fns'
import type { Todo } from '@/types/todo'
import { ChevronLeft, ChevronRight } from 'lucide-react'
const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

        return eachDayOfInterval({
            start: calendarStart,
            end: calendarEnd,
        })
    }, [currentMonth])

    const todosByDate = useMemo(() => {
        const map = new Map<string, Todo[]>()
        for (const todo of todos) {
            const list = map.get(todo.due_date)
            if (list) {
                list.push(todo)
            } else {
                map.set(todo.due_date, [todo])
            }
        }
        return map
    }, [todos])

    return (
        <div className="w-full bg-zinc-900 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => {
                        const newMonth = subMonths(currentMonth, 1)
                        setCurrentMonth(newMonth)
                    }}
                    className="text-xl text-zinc-400 hover:text-white"
                >
                    <ChevronLeft />
                </button>

                <div className="text-center">
                    <p className="text-sm text-zinc-400">{format(currentMonth, 'yyyy')}</p>
                    <h2 className="text-2xl font-bold tracking-[0.2em] uppercase">
                        {format(currentMonth, 'MMMM')}
                    </h2>
                </div>

                <button
                    onClick={() => {
                        const newMonth = addMonths(currentMonth, 1)
                        setCurrentMonth(newMonth)
                    }}
                    className="text-xl text-zinc-400 hover:text-white"
                >
                    <ChevronRight />
                </button>
            </div>

            <div className="mb-4 grid grid-cols-7 text-center text-sm font-semibold text-zinc-400">
                {weekLabels.map((label, index) => (
                    <div key={`${label}-${index}`}>{label}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4 text-center">
                {calendarDays.map((day) => {
                    const inCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = isSameDay(day, selectedDate)
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const dayTodos = todosByDate.get(dateKey) ?? []

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelectDate(day)}
                            className="mx-auto flex flex-col items-center justify-center gap-1 mt-1"
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm 
                                    ${isSelected ? 'bg-white font-semibold text-black' : inCurrentMonth ? 'text-white' : 'text-zinc-600' }`}>
                                {format(day, 'd')}
                            </div>

                            <div className="flex h-2 items-center justify-center gap-1 flex-wrap m-auto  mx-2">
                                {dayTodos.map((todo) => (
                                    <span
                                        key={todo.id}
                                        className={`block h-1.5 w-1.5 rounded-full ${priorityDotColor[todo.priority]}`}
                                    />
                                ))}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
