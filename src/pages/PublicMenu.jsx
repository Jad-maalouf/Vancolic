import { Link } from 'react-router-dom';
import { useMenuItems } from '../hooks/useMenuItems.js';
import { MenuBrowser } from '../components/MenuBrowser.jsx';

export default function PublicMenu() {
  const { items, loading, error } = useMenuItems();

  return (
    <div className="page public-menu">
      <img src="/images/logo.png" alt="logo" id="logo" />
      {loading ? <p className="page-loading">Loading menu…</p> : null}
      {error ? <p className="error">Could not load the menu: {error}</p> : null}
      {!loading && !error ? <MenuBrowser items={items} /> : null}
      <Link to="/login" className="staff-login-link">
        Staff login
      </Link>
    </div>
  );
}
