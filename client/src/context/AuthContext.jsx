import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider: Initializing...');
        try {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            console.log('AuthProvider: Found saved data:', { hasUser: !!savedUser, hasToken: !!token });

            if (savedUser && token) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('AuthProvider: Failed to parse auth data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            console.log('AuthProvider: Setting loading to false');
            setLoading(false);
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
