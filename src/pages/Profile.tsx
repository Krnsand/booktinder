import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPreferences } from '../api/preferences';

type PreferencesState = {
  genres: string[];
  moods: string[];
  tropes: string[];
  representation: string[];
  authors: string[];
  formats: string[];
};

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [preferences, setPreferences] = useState<PreferencesState | null>(null);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    let isMounted = true;

    async function loadPreferences() {
      try {
        const prefs = await getUserPreferences(userId);
        if (!isMounted || !prefs) return;

        setPreferences({
          genres: prefs.genres ?? [],
          moods: prefs.moods ?? [],
          tropes: prefs.tropes ?? [],
          representation: prefs.representation ?? [],
          authors: prefs.authors ?? [],
          formats: prefs.formats ?? [],
        });
      } catch (err) {
        console.error('Failed to load user preferences on profile', err);
      }
    }

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="profile-page">
      <h1 className="page-title">
        {user ? `Hello ${user.user_metadata.username}!` : 'Profile'}
      </h1>

      {user?.user_metadata?.avatar_url && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.username ?? 'Profile avatar'}
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {user && <p className="profile-content">{user.email}</p>}
      <h2 className="profile-content">My preferences</h2>

      {preferences && (
        <div className="profile-preferences">
          {preferences.genres.length > 0 && (
            <div className="profile-preference-group">
              <h3>Genres</h3>
              <ul>
                {preferences.genres.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {preferences.moods.length > 0 && (
            <div className="profile-preference-group">
              <h3>Moods</h3>
              <ul>
                {preferences.moods.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {preferences.tropes.length > 0 && (
            <div className="profile-preference-group">
              <h3>Tropes</h3>
              <ul>
                {preferences.tropes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {preferences.representation.length > 0 && (
            <div className="profile-preference-group">
              <h3>Representation</h3>
              <ul>
                {preferences.representation.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {preferences.authors.length > 0 && (
            <div className="profile-preference-group">
              <h3>Authors</h3>
              <ul>
                {preferences.authors.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {preferences.formats.length > 0 && (
            <div className="profile-preference-group">
              <h3>Formats</h3>
              <ul>
                {preferences.formats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {preferences.genres.length === 0 &&
            preferences.moods.length === 0 &&
            preferences.tropes.length === 0 &&
            preferences.representation.length === 0 &&
            preferences.authors.length === 0 &&
            preferences.formats.length === 0 && (
              <p className="profile-content">You have not selected any preferences yet.</p>
            )}
        </div>
      )}

      <div className="bottom-nav">
        <div className="profile-bottom-buttons">
          <button
            type="button"
            aria-label="Library"
            onClick={() => navigate('/library')}
            className="icon-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2v8l3-3 3 3V2" />
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
