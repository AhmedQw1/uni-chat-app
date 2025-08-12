import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Add loading state check
  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }
  
  return currentUser ? children : (
    <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />
  );
}