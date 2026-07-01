import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { IconButton } from '../components/IconButton.jsx';
import { CheckIcon } from '../components/icons.jsx';

const HOME_BY_ROLE = { manager: '/manager', bartender: '/bartender', waiter: '/waiter' };

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate(HOME_BY_ROLE[user.role] || '/', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      navigate(HOME_BY_ROLE[loggedInUser.role] || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Staff Login</h1>
        {error ? <p className="error">{error}</p> : null}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
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
        <div className="icon-button-group">
          <IconButton
            icon={CheckIcon}
            label={submitting ? 'Logging in…' : 'Log in'}
            type="submit"
            className="icon-button-success"
            disabled={submitting}
          />
        </div>
        <Link to="/" className="back-link">
          Back to menu
        </Link>
      </form>
    </div>
  );
}
