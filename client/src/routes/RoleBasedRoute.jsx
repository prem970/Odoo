/**
 * Role Based Route
 * Purpose: Collects routes that require a specific user role.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, roles }) => {
    const userRole = 'learner'; // Replace with actual user role from context
    return roles.includes(userRole) ? children : <Navigate to="/unauthorized" />;
};

export default RoleBasedRoute;
