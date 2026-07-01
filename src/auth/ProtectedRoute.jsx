import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const HOME_BY_ROLE = {
  manager: '/manager',
  bartender: '/bartender',
  waiter: '/waiter',
};

export function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />;
  }
  return children;
}
