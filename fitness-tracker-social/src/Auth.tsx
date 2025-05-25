import { useState } from 'react'
import { supabase } from './supabaseClient'

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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleAuth}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-[22rem] flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="rounded-md border px-3 py-2 focus:outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-md border px-3 py-2 focus:outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}
        <div className="text-sm mt-2 text-center">
          {isSignUp ? "Already have an account?" : "Need an account?"}
          <button
            type="button"
            className="text-blue-500 underline ml-2"
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
