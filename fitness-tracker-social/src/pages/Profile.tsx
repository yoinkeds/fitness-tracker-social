import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type ProfileData = {
  username: string
  full_name: string
  avatar_url: string
  bio: string
}

const EMPTY_PROFILE: ProfileData = {
  username: '',
  full_name: '',
  avatar_url: '',
  bio: ''
}

const Profile = ({ user }: { user: { id: string; email: string } }) => {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true)
      setMessage(null)
      setError(null)
      let { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio')
        .eq('id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') setError(error.message) // PGREST116 = no rows found
      if (data) setProfile(data)
      setLoading(false)
    }
    getProfile()
  }, [user.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    const updates = { ...profile, id: user.id }
    let { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Profile updated!')
    }
    setLoading(false)
  }
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}.${fileExt}`

    let { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath)

    setProfile({ ...profile, avatar_url: data.publicUrl }) // set new avatar
    setUploading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-xl shadow grid gap-5">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">My Profile</h2>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <label className="flex flex-col gap-1 text-gray-900 dark:text-white">
          Username
          <input
            name="username"
            type="text"
            className="rounded border px-3 py-2 dark:bg-gray-700 text-gray-900 dark:text-white"
            value={profile.username}
            onChange={handleChange}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-gray-900 dark:text-white">
          Full Name
          <input
            name="full_name"
            type="text"
            className="rounded border px-3 py-2 dark:bg-gray-700 text-gray-900 dark:text-white"
            value={profile.full_name}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-gray-900 dark:text-white">
          Profile Picture
          <input
            type="file"
            accept="image/*"
            className="text-sm mt-1"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </label>
        <label className="flex flex-col gap-1 text-gray-900 dark:text-white">
          Bio
          <textarea
            name="bio"
            className="rounded border px-3 py-2 dark:bg-gray-700 text-gray-900 dark:text-white"
            value={profile.bio}
            onChange={handleChange}
            rows={3}
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
      </form>
    </div>
  )
}

export default Profile
