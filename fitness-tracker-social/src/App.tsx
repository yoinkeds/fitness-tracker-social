import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Feed from './Feed';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        {session && <Navbar onSignOut={() => supabase.auth.signOut()} />}
        <main className="flex justify-center flex-1 pt-10">
          <div className="w-full max-w-2xl">
            <Routes>
              {session ? (
                <>
                  <Route path="/" element={<Feed user={session.user} />} />
                  <Route path="/profile" element={<Profile user={session.user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
