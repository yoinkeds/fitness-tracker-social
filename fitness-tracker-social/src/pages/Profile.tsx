import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type ProfileData = {
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
};

const EMPTY_PROFILE: ProfileData = {
  username: '',
  full_name: '',
  avatar_url: '',
  bio: '',
};

const Profile = ({ user }: { user: { id: string; email: string } }) => {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      setMessage(null);
      setError(null);
      let { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') setError(error.message); // PGRST116 = no rows found
      if (data) setProfile(data);
      setLoading(false);
    };
    getProfile();
  }, [user.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const updates = { ...profile, id: user.id };
    let { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Profile updated!');
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const BUCKET_NAME = "avatars"; // double check your bucket name!
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;

    // 1. Upload file (upsert allows overwrite)
    const uploadResult = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });

    if (uploadResult.error) {
      setError("Upload failed: " + uploadResult.error.message);
      setUploading(false);
      console.log("Upload error result:", uploadResult);
      return;
    }

    // 2. Get public URL
    const { data: publicUrlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (urlError || !publicUrlData?.publicUrl) {
      setError("Could not get public URL for the avatar.");
      setUploading(false);
      console.log("Public URL error:", urlError, publicUrlData);
      return;
    }

    const publicUrl = publicUrlData.publicUrl;

    // 3. Update the user's profile in DB
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (profileError) {
      setError("Database update failed: " + profileError.message);
      setUploading(false);
      return;
    }

    setProfile(profile => ({ ...profile, avatar_url: publicUrl }));
    setUploading(false);
    setMessage('Profile picture updated!');
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-xl shadow grid gap-5">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">My Profile</h2>
      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Avatar preview */}
        {profile.avatar_url && (
          <div className="flex justify-center mb-2">
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 dark:border-cyan-600"
            />
          </div>
        )}
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
        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-green-500 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default Profile;
