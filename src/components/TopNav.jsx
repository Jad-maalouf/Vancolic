import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { IconButton } from './IconButton.jsx';
import { LogoutIcon } from './icons.jsx';

export function TopNav() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="top-nav">
      <div className="top-nav-links">
        {(user.role === 'waiter' || user.role === 'manager') && <NavLink to="/waiter">Waiter</NavLink>}
        {(user.role === 'bartender' || user.role === 'manager') && <NavLink to="/bartender">Bartender</NavLink>}
        {user.role === 'manager' && <NavLink to="/manager">Manager</NavLink>}
        <NavLink to="/" end>
          Public Menu
        </NavLink>
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
