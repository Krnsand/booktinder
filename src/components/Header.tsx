import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/signin');
  }

  return (
    <header className="app-header">
      <h1 className="app-title">BookTinder</h1>
      <nav className="app-nav">
        <button onClick={() => navigate('/preferences')}>Preferences</button>
        <button onClick={() => navigate('/discover')}>Discover</button>
        <button onClick={() => navigate('/library')}>Library</button>
        <button onClick={handleSignOut}>Sign out</button>
      </nav>
    </header>
  );
}
