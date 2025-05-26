import React from 'react'

interface Props {
  onShowAuth: () => void
}

const Landing: React.FC<Props> = ({ onShowAuth }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
    {/* Decorative Grain/Texture */}
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-10"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/cubes.png')",
      }}
    />
    <div className="relative z-10 flex flex-col items-center w-full px-6 pt-16 pb-28 max-w-3xl mx-auto">
      <img
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80"
        alt="Gym motivation"
        className="w-full max-w-md object-cover rounded-3xl shadow-xl mb-8 border-2 border-blue-200 dark:border-gray-700"
        decoding="async"
        loading="lazy"
      />
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight text-center leading-tight drop-shadow-lg">
        Find Your <span className="inline-block text-blue-600 dark:text-cyan-400">Gym Buddy</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-200 mb-10 max-w-xl mx-auto text-center font-medium">
        Make workouts social. Meet new friends, track your fitness, and achieve your goals together.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <button
          onClick={onShowAuth}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white text-xl font-bold shadow-lg transition-all focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-cyan-600 mb-2 sm:mb-0"
        >
          Get Started
        </button>
        <button
          onClick={onShowAuth}
          className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-blue-300 dark:border-cyan-700 font-semibold text-blue-700 dark:text-cyan-300 bg-white/80 dark:bg-gray-800/80 shadow transition-all hover:bg-blue-50 dark:hover:bg-gray-700"
        >
          Log In
        </button>
      </div>
    </div>
    <footer className="absolute bottom-0 left-0 w-full p-4 flex justify-center text-gray-400 text-xs z-10 select-none">
      © {new Date().getFullYear()} FitBuddy Social &mdash; Built with 💙
    </footer>
  </div>
)

export default Landing
