import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

function App() {
  const [session, setSession] = useState<null | ReturnType<typeof supabase.auth.getSession>['data']['session']>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!session ? (
        <Auth />
      ) : (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.email}!</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold px-4"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
