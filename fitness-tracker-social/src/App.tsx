import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Profile from './Profile'
import Landing from './Landing'

function App() {
  const [session, setSession] = useState<null | ReturnType<typeof supabase.auth.getSession>['data']['session']>(null)
  const [showAuth, setShowAuth] = useState(false)

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

  if (session)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center py-8">
          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-auto mb-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold px-4"
          >
            Log Out
          </button>
          <Profile user={session.user} />
        </div>
      </div>
    )

  if (showAuth) return <Auth />

  return <Landing onShowAuth={() => setShowAuth(true)} />
}

export default App
