import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  return user?.token ? children : <Navigate to="/login" replace />;
}
