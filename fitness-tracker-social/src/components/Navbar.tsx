import { Link, useLocation } from "react-router-dom"

const Navbar = ({ onSignOut }: { onSignOut: () => void }) => {
  const location = useLocation()

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-gray-900/80 shadow-sm backdrop-blur rounded-b-2xl">
      <Link
        to="/"
        className="text-2xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight transition hover:opacity-80"
      >
        arcus social
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className={`font-medium transition ${
            location.pathname === "/" ? "underline text-blue-600 dark:text-blue-300" : "text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-300"
          }`}
        >
          Feed
        </Link>
        <Link
          to="/profile"
          className={`font-medium transition ${
            location.pathname === "/profile" ? "underline text-blue-600 dark:text-blue-300" : "text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-300"
          }`}
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="ml-2 px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition"
        >
          Log Out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
