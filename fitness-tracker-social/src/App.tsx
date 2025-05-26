import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Profile from './Profile'
import Feed from './Feed'
import Landing from './Landing'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'

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

  if (!session) {
    if (showAuth) return <Auth />
    return <Landing onShowAuth={() => setShowAuth(true)} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <nav className="flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-gray-900/80 shadow-sm backdrop-blur rounded-b-2xl">
          <Link to="/" className="text-2xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight">🏋️ FitSocial</Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-300 transition">Feed</Link>
            <Link to="/profile" className="font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-300 transition">Profile</Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="ml-2 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition"
            >
              Log Out
            </button>
          </div>
        </nav>
        <main className="flex justify-center pt-10">
          <div className="w-full max-w-2xl">
            <Routes>
              <Route path="/" element={<Feed user={session.user} />} />
              <Route path="/profile" element={<Profile user={session.user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
