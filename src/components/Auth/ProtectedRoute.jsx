import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Fixed path

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  return currentUser ? children : <Navigate to="/login" />;
}