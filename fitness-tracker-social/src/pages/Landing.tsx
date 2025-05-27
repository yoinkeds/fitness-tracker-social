import React from "react"

type LandingProps = {
  onShowAuth: () => void
}

const features = [
  {
    title: "Connect With Lifters",
    desc: "Follow your friends or favorite gym goers. Stay motivated and accountable, together.",
    icon: "💬",
  },
  {
    title: "Share Workouts & Progress",
    desc: "Post your workouts, milestones, or gym selfies. Inspire others and track your journey.",
    icon: "📅",
  },
  {
    title: "Personalize Your Profile",
    desc: "Show off your fitness story, achievements, and connect with like-minded people.",
    icon: "🏆",
  },
]

const Landing: React.FC<LandingProps> = ({ onShowAuth }) => (
  <div className="min-h-screen w-full flex flex-col">
    <header className="bg-gradient-to-r from-blue-600 to-cyan-400 dark:from-gray-900 dark:to-blue-800 py-16 px-4 text-white shadow-lg">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
        <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-tight mb-2">
          Welcome to <span className="text-blue-200 dark:text-cyan-300">arcus social</span>
        </h1>
        <p className="text-xl font-medium opacity-90">
          The social platform for fitness lovers. Share progress, motivate each other, and build your gym community.
        </p>
        <button
          onClick={onShowAuth}
          className="mt-4 px-8 py-3 rounded-xl bg-white text-blue-700 font-bold text-lg shadow-md hover:bg-blue-200 hover:text-blue-900 transition"
        >
          Get Started
        </button>
      </div>
    </header>
    <main className="flex-1 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 pb-14">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center bg-white/80 dark:bg-gray-800/70 p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
              <div className="text-5xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold text-blue-700 dark:text-cyan-300 mb-1">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>

        <section className="max-w-2xl mx-auto mt-10 bg-white/90 dark:bg-gray-800/80 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-700 dark:text-cyan-300">Why Join?</h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            Whether you're chasing new PRs, learning the ropes, or just sharing a sweaty smile, arcus social is designed for you.
          </p>
          <ul className="text-gray-700 dark:text-gray-300 text-left mx-auto list-disc list-inside max-w-xs space-y-2">
            <li>No spam, just gains 💪</li>
            <li>Modern, clean, easy UI</li>
            <li>Optimized for dark mode</li>
            <li>Free to use. Your data stays private.</li>
          </ul>
          <button
            onClick={onShowAuth}
            className="mt-8 px-8 py-2 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition"
          >
            Create Your Account
          </button>
        </section>
      </div>
    </main>
    <footer className="text-center text-xs text-gray-400 py-6 mt-auto">
      © {new Date().getFullYear()} arcus social &middot; Made for gym communities
    </footer>
  </div>
)

export default Landing
