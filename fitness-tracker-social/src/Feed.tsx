import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
};

type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

export default function Feed({ user }: { user: { id: string; email: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      // 1. Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        setError(postsError.message);
        setLoading(false);
        return;
      }

      setPosts(postsData || []);

      // 2. Fetch profiles for user_ids found in posts
      const userIds = [...new Set((postsData || []).map((post) => post.user_id))];
      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        setError(profilesError.message);
      } else {
        const profilesMap: Record<string, Profile> = {};
        for (const p of profilesData || []) {
          profilesMap[p.id] = p;
        }
        setProfiles(profilesMap);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    let { error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content: newPost });
    if (error) setError(error.message);
    else setNewPost('');

    // Re-fetch posts and profiles
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(postsData || []);

    // Fetch new profiles if needed
    const userIds = [...new Set((postsData || []).map((post) => post.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      const profilesMap: Record<string, Profile> = {};
      for (const p of profilesData || []) {
        profilesMap[p.id] = p;
      }
      setProfiles(profilesMap);
    }
    setPosting(false);
  };

  return (
    <div className="max-w-md mx-auto pt-6 pb-20">
      
      {/* Create Post */}
      <form
        onSubmit={handleSubmit}
        className="sticky top-4 z-10 bg-white dark:bg-gray-800/95 border rounded-xl shadow-xl mb-8 flex gap-4 items-center p-4"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <img
          src={
            profiles[user.id]?.avatar_url ||
            'https://api.dicebear.com/6.x/initials/svg?seed=' +
              (profiles[user.id]?.username || 'You')
          }
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-cyan-600"
          loading="lazy"
        />
        <input
          type="text"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder="Share your gym update..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-400 transition"
          required
          disabled={posting}
          maxLength={180}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 rounded-full font-semibold shadow disabled:opacity-50 transition"
          disabled={posting}
          title="Post"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="animate-spin text-blue-400 text-3xl">🏋️‍♂️</span>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No posts yet. Start the conversation! 🗣️</p>
      ) : (
        <div className="flex flex-col gap-7">
          {posts.map(post => {
            const profile = profiles[post.user_id];
            return (
              <div
                key={post.id}
                className="rounded-2xl shadow-lg bg-white dark:bg-gray-900 border border-gray-100/60 dark:border-gray-700/50 px-5 pb-2 pt-4 flex flex-col transition hover:shadow-2xl"
              >
                {/* User Info and timestamp */}
                <div className="flex items-center gap-3 mb-1">
                  <img
                    src={
                      profile?.avatar_url ||
                      'https://api.dicebear.com/6.x/initials/svg?seed=' +
                        (profile?.username || 'user')
                    }
                    alt="avatar"
                    className="w-11 h-11 rounded-full object-cover border border-blue-200 dark:border-cyan-600"
                    loading="lazy"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-blue-700 dark:text-cyan-300 text-base">{profile?.username || 'Anonymous'}</span>
                    <span className="text-xs text-gray-400">{profile?.full_name}</span>
                  </div>
                  <div className="ml-auto text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</div>
                </div>

                {/* Post Content */}
                <div className="text-lg mt-1 mb-3 text-gray-800 dark:text-gray-100 break-words" style={{whiteSpace: 'pre-line'}}>
                  {post.content}
                </div>

                {/* Action Row (Like/Comment Placeholders) */}
                <div className="flex items-center gap-4 pt-1 pb-2 text-gray-400">
                  <button
                    type="button"
                    className="hover:text-pink-500 text-xl transition"
                    disabled
                    title="Like (coming soon!)"
                  >
                    ❤️
                  </button>
                  <button
                    type="button"
                    className="hover:text-blue-500 text-xl transition"
                    disabled
                    title="Comment (coming soon!)"
                  >
                    💬
                  </button>
                  {/* Future: you can map post.likes, post.comments, etc here */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
