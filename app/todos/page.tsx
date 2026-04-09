import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TodosClient from '@/components/todos/TodosClient'

export default async function TodosPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true })

  return (
    <main className="min-h-screen bg-black">
      <div className="px-4 py-6 flex flex-col max-w-lg mx-auto">
        <TodosClient initialTodos={todos ?? []} />
      </div>
    </main>
  )
}
