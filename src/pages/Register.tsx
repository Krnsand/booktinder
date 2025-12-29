import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError('Enter username, email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, username);
      navigate('/preferences');
    } catch (err: any) {
      const raw = err?.message ?? '';
      let message = 'Could not create account.';

      if (raw.toLowerCase().includes('password')) {
        message = 'Password is too weak or too short.';
      } else if (raw.toLowerCase().includes('already registered')) {
        message = 'There is already an account with this email.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}
