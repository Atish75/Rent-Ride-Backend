import { createContext, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
// 1. Context Create karein
export const AuthContext = createContext();

// 2. AuthProvider Component (Global Wrapper)
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    const loginUser = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/token/`, { username, password });
            const accessToken = response.data.access;
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            setToken(accessToken);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error.response?.data);
            return { success: false, error: "Invalid username or password" };
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setIsAuthenticated(false);
    };

    const registerUser = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register/`, {
                username: username,
                email: email,
                password: password
            });
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Registration Error:", error.response?.data);
            return { 
                success: false, 
                error: error.response?.data?.error || "Registration failed. Try again." 
            };
        }
    };

    // 🔑 Return statement AuthProvider function ke ANDAR hona chahiye
    return (
        <AuthContext.Provider value={{ token, isAuthenticated, loginUser, logoutUser, registerUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Protected Route Guard (Dono ek hi file me taaki path issue na ho)
export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" replace />;
};