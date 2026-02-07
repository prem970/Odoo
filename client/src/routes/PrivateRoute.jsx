/**
 * Private Route
 * Purpose: Protects routes that require authentication.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = false; // Replace with actual auth check
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
