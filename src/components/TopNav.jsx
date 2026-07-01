import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { IconButton } from './IconButton.jsx';
import { LogoutIcon } from './icons.jsx';

export function TopNav() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="top-nav">
      <div className="top-nav-links">
        {(user.role === 'waiter' || user.role === 'manager') && <Link to="/waiter">Waiter</Link>}
        {(user.role === 'bartender' || user.role === 'manager') && <Link to="/bartender">Bartender</Link>}
        {user.role === 'manager' && <Link to="/manager">Manager</Link>}
        <Link to="/">Public Menu</Link>
      </div>
      <div className="top-nav-user">
        <span>
          {user.fullName} ({user.role})
        </span>
        <IconButton icon={LogoutIcon} label="Log out" className="icon-button-light" onClick={logout} />
      </div>
    </nav>
  );
}
