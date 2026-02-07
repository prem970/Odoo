/**
 * App Router
 * Role-based and private route configurations.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Pages
import Dashboard from '../pages/admin/Dashboard';
import CourseEdit from '../pages/instructor/CourseForm';
import Catalog from '../pages/learner/Home';
import LessonPlayer from '../pages/learner/LessonPlayer';
import Login from '../pages/auth/Login';

const AppRouter = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<Catalog />} />

        <Route element={<PrivateRoute />}>
            {/* Admin/Instructor routes */}
            <Route path="/admin/dashboard" element={<RoleBasedRoute roles={['admin', 'instructor']}><Dashboard /></RoleBasedRoute>} />
            <Route path="/course/edit/:id" element={<RoleBasedRoute roles={['admin', 'instructor']}><CourseEdit /></RoleBasedRoute>} />

            {/* Learner routes */}
            <Route path="/my-courses" element={<RoleBasedRoute roles={['learner']}><Catalog /></RoleBasedRoute>} />
            <Route path="/learn/:courseId/:lessonId" element={<LessonPlayer />} />
        </Route>
    </Routes>
);

export default AppRouter;
