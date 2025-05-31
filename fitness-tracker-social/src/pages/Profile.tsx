import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Cropper from 'react-easy-crop';

type ProfileData = {
  username: string;
  full_name: string;
  avatar_url: string; // now this is just a file path, e.g. "db6c5ee3-xxxx.jpg"
  bio: string;
};

const EMPTY_PROFILE: ProfileData = {
  username: '',
  full_name: '',
  avatar_url: '',
  bio: '',
};

type CroppedAreaPixels = { width: number; height: number; x: number; y: number; };

// Utility: crop and return a blob (canvas)
async function getCroppedImg(imageSrc: string, crop: CroppedAreaPixels): Promise<Blob> {
  const image = document.createElement('img');
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get context');
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, crop.width, crop.height
  );
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.94)
  );
}

const BUCKET_NAME = 'avatars';

const Profile = ({ user }: { user: { id: string; email: string } }) => {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // State for cropping
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [croppedArea, setCroppedArea] = useState<CroppedAreaPixels | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

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
      if (error && error.code !== 'PGRST116') setError(error.message);
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

  // Step 1: Select file & show cropper
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImg(reader.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Crop, upload, update DB, delete old file
  const handleCropAndUpload = async () => {
    if (!selectedImg || !croppedArea) return;
    setUploading(true);
    setError(null);

    try {
      // 1. Get cropped image as Blob
      const blob = await getCroppedImg(selectedImg, croppedArea);

      // 2. Generate new UUID filename (.jpg)
      const uuid = crypto.randomUUID();
      const filePath = `${uuid}.jpg`;

      // 3. Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, { upsert: true });
      if (uploadError) {
        setError("Upload failed: " + uploadError.message);
        setUploading(false);
        setShowCrop(false);
        return;
      }

      // 4. Remove previous avatar from storage (if any)
      if (profile.avatar_url) {
        const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([profile.avatar_url]);
        if (removeError) {
          console.error("Avatar removal failed:", removeError.message);
        } else {
          console.log("Removed previous avatar:", profile.avatar_url);
        }
      }

      // 5. Update user's profile in DB (store file path only!)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (profileError) {
        setError("Database update failed: " + profileError.message);
        setUploading(false);
        setShowCrop(false);
        return;
      }

      setProfile((p) => ({ ...p, avatar_url: filePath }));
      setUploading(false);
      setShowCrop(false);
      setSelectedImg(null);
      setMessage('Profile picture updated!');
    } catch (e) {
      setError('Failed to crop or upload image');
      setUploading(false);
      setShowCrop(false);
    }
  };

  // Generate avatar display URL from filePath
  const avatarUrl = profile.avatar_url
    ? supabase.storage.from(BUCKET_NAME).getPublicUrl(profile.avatar_url).data.publicUrl
    : '';

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-xl shadow grid gap-5">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">My Profile</h2>
      <form onSubmit={handleSubmit} className="grid gap-5">
        {avatarUrl && (
          <div className="flex justify-center mb-2">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 dark:border-cyan-600"
            />
          </div>
        )}

        {showCrop && selectedImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg relative max-w-lg w-full">
              <div className="relative h-72 w-full">
                <Cropper
                  image={selectedImg}
                  crop={crop}
                  onCropChange={setCrop}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  aspect={1}
                  onCropComplete={(_, croppedAreaPixels) => setCroppedArea(croppedAreaPixels)}
                  cropShape="round"
                  showGrid={false}
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded font-semibold mr-2"
                  onClick={() => {
                    setShowCrop(false);
                    setSelectedImg(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                  onClick={handleCropAndUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save'}
                </button>
              </div>
            </div>
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
            ref={inputFileRef}
            onChange={handleAvatarSelect}
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
