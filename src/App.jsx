import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import PublicMenu from './pages/PublicMenu.jsx';
import Login from './pages/Login.jsx';
import WaiterView from './pages/WaiterView.jsx';
import BartenderBoard from './pages/BartenderBoard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicMenu />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/waiter"
        element={
          <ProtectedRoute allowedRoles={['waiter', 'manager']}>
            <WaiterView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bartender"
        element={
          <ProtectedRoute allowedRoles={['bartender', 'manager']}>
            <BartenderBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
