import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Feed from './Feed'
import Landing from './pages/Landing'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <Navbar onSignOut={() => supabase.auth.signOut()} />
        <main className="flex justify-center flex-1 pt-10">
          <div className="w-full max-w-2xl">
            <Routes>
              <Route path="/" element={<Feed user={session.user} />} />
              <Route path="/profile" element={<Profile user={session.user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
