import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarError(null);
    setAvatarFile(file ?? null);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(null);
    }
  }

  async function handleSaveAvatar() {
    try {
      setAvatarError(null);
      if (!user) {
        setAvatarError("You need to be signed in to save an avatar.");
        return;
      }
      if (!avatarFile) {
        setAvatarError("Choose an image first.");
        return;
      }

      setSavingAvatar(true);
      const imageBitmap = await createImageBitmap(avatarFile);
      const maxSize = 400;
      const scale = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height, 1);
      const targetWidth = Math.round(imageBitmap.width * scale);
      const targetHeight = Math.round(imageBitmap.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setAvatarError("Could not process image. Please try a different file.");
        return;
      }
      ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

      const resizedBlob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8)
      );

      if (!resizedBlob) {
        setAvatarError("Could not process image. Please try again.");
        return;
      }

      const fileName = `${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, resizedBlob, { upsert: true });

      if (uploadError) {
        setAvatarError("Could not upload avatar. Please try again.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (updateError) {
        setAvatarError("Avatar saved, but profile could not be updated.");
        return;
      }
    } finally {
      setSavingAvatar(false);
    }
  }

  function handleNext() {
    navigate("/preferences");
  }

  return (
    <div className="welcome-page">
      <h1 className="home-page-title app-title">Bookify</h1>

      <section className="welcome-content">
        <h2>{user ? `Welcome to Bookify ${user.user_metadata.username}!` : "Profile"}</h2>
        <p>
          This is an app who’s purpose is 
          to help you find new books 
          that you actually like. Start 
          by setting your preferences to the kinds 
          of books you would like to find. You will 
          be able to change these whenever you feel like exploring new things.
        </p>
      </section>

      <section className="welcome-content">
        <h3>Your avatar</h3>
        <p>Upload an image to use as your profile picture.</p>
        <label>
          Choose image
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </label>
        {avatarPreview && (
          <div style={{ marginTop: "1rem" }}>
            <img
              src={avatarPreview}
              alt="Avatar preview"
              style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
        )}
        {avatarError && <p className="error-message">{avatarError}</p>}
        <button className="avatar-btn"
          type="button"
          onClick={handleSaveAvatar}
          disabled={savingAvatar}
          style={{ marginTop: "0.75rem" }}
        >
          {savingAvatar ? "Saving avatar..." : "Save avatar"}
        </button>
      </section>

      <div className="bottom-nav">
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
