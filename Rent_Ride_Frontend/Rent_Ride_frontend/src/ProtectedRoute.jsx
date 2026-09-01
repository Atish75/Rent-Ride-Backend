import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useContext(AuthContext);
    
    // Agar user logged in nahi hai, toh login page pr bhej do
    return isAuthenticated ? children : <Navigate to="/login" />;
}