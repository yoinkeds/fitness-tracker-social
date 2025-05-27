import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage("Check your email for the confirmation link!")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <form
        onSubmit={handleAuth}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-6"
      >
        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-900 dark:text-white tracking-tight">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="rounded-md border px-3 py-2 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-md border px-3 py-2 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-pulse">Loading...</span>
          ) : isSignUp ? "Sign Up" : "Sign In"}
        </button>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        {message && <p className="text-green-500 text-center text-sm">{message}</p>}
        <div className="text-sm text-center text-gray-700 dark:text-gray-300">
          {isSignUp ? "Already have an account?" : "Need an account?"}
          <button
            type="button"
            className="text-blue-600 dark:text-blue-300 underline ml-2"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Auth
