// src/components/ProtectedRoute.jsx
import { useSupabase } from '../context/SupabaseContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.user_metadata?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; // Default export