import {jwtDecode} from 'jwt-decode';
import React, {createContext, useState,useEffect,useCallback}from'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const navigate = useNavigate();

    // Initialize state from localstorage
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [user, setUser] = useState(() => {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    });

    // Logout function/using a callback
    const logout = useCallback(() => {
        localStorage.clear();
        setToken('');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    // Check if the token is expired
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const isExpired = decoded.exp * 1000 < Date.now();

                if (isExpired) {
                    // console.log('Token expired, logging out...');
                    logout();
                }
            } catch (error) {
                // console.log("Invalid token, logging out...")
                logout();
            }
        }
    }, [token, logout]);

    return (
        // the setToken and setUser are needed for login to alert the change of state
        <AuthContext.Provider value={{ user, token, setToken, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };