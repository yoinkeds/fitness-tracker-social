import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

type Profile = {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
}

type Post = {
  id: string
  user_id: string
  content: string
  created_at: string
  profile?: Profile
}

export default function Feed({ user }: { user: { id: string; email: string } }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      // 1. Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) {
        setError(postsError.message)
        setLoading(false)
        return
      }

      setPosts(postsData || [])

      // 2. Fetch profiles for user_ids found in posts
      const userIds = [...new Set((postsData || []).map((post) => post.user_id))]
      if (userIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        setError(profilesError.message)
      } else {
        // Map: id => profile
        const profilesMap: Record<string, Profile> = {}
        for (const p of profilesData || []) {
          profilesMap[p.id] = p
        }
        setProfiles(profilesMap)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    let { error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content: newPost })
    if (error) setError(error.message)
    else setNewPost('')
    // Re-fetch posts and profiles
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(postsData || [])

    // Fetch new profiles if needed
    const userIds = [...new Set((postsData || []).map((post) => post.user_id))]
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds)
      const profilesMap: Record<string, Profile> = {}
      for (const p of profilesData || []) {
        profilesMap[p.id] = p
      }
      setProfiles(profilesMap)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow mt-12 mb-8">
      <h2 className="text-3xl font-bold text-center mb-4 text-blue-700 dark:text-cyan-300">Community Feed</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Share your workout or motivation..."
           className="flex-1 px-4 py-2 rounded-lg border dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-white"
          required
          disabled={loading}
          maxLength={180}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 ml-2 rounded-lg font-semibold disabled:opacity-60"
          disabled={loading}
        >
          Post
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex flex-col gap-6">
        {posts.length === 0 && (
          <p className="text-gray-500 text-center">No posts yet. Start the conversation! 🗣️</p>
        )}
        {posts.map(post => {
          const profile = profiles[post.user_id]
          return (
            <div key={post.id} className="p-4 rounded bg-blue-50 dark:bg-gray-700 shadow-sm flex gap-4">
              <img
                src={
                  profile?.avatar_url ||
                  'https://api.dicebear.com/6.x/initials/svg?seed=' +
                    (profile?.username || 'user')
                }
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-cyan-600"
                loading="lazy"
              />
              <div>
                <div className="font-bold text-blue-700 dark:text-cyan-300">{profile?.username || 'Anonymous'}</div>
                <div className="text-gray-700 dark:text-gray-100 mt-1">{post.content}</div>
                <div className="text-xs text-gray-400 mt-2">{new Date(post.created_at).toLocaleString()}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
