import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="app-header">
      <h1 className="app-title">Bookify</h1>
      <nav className="app-nav">
        {/* <button onClick={() => navigate('/preferences')}>Preferences</button>
        <button onClick={() => navigate('/discover')}>Discover</button>
        <button onClick={() => navigate('/library')}>Library</button> */}
        <button
          className="profile-icon-button"
          aria-label="Profile"
          onClick={() => navigate('/profile')}
        >
          {initial}
        </button>
      </nav>
    </header>
  );
}
