import React from 'react'; // v2 force refresh
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import LandingPage from './pages/LandingPage';
import CoursesPage from './pages/CoursesPage';
import BlogPage from './pages/BlogPage';
import LessonPlayer from './pages/learner/LessonPlayer';
import CourseOverview from './pages/learner/CourseOverview';
import UserProfile from './pages/learner/UserProfile';
import LiveClasses from './pages/learner/LiveClasses';
import LiveClassRoom from './pages/learner/LiveClassRoom';
import Quizzes from './pages/learner/Quizzes';
import WorkSubmission from './pages/learner/WorkSubmission';
import ExploreCourses from './pages/learner/ExploreCourses';
import FAQ from './pages/FAQ';
import HelpCenter from './pages/HelpCenter';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import CommunityPage from './pages/CommunityPage';
import AuthSuccess from './pages/AuthSuccess';
import ChatBot from './components/ui/ChatBot';
import CoursesDashboard from './pages/instructor/Dashboard';
import CourseForm from './pages/instructor/CourseForm';
import Settings from './pages/Settings';
import QuizBuilder from './pages/instructor/QuizBuilder';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white text-primary">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const userRole = user.role?.toUpperCase();
    const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);

    if (allowedRoles && !isAllowed) {
        const targetPath = (userRole === 'ADMIN') ? '/admin/dashboard' : '/user/dashboard';

        // Only redirect if we are not already on the target path
        if (window.location.pathname !== targetPath) {
            return <Navigate to={targetPath} replace />;
        }
    }

    return children;
};


function App() {
    console.log('App: Rendering. Current Path:', window.location.pathname);
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/auth-success" element={
                        <ErrorBoundary>
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <AuthSuccess />
                            </React.Suspense>
                        </ErrorBoundary>
                    } />

                    <Route
                        path="/user/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <UserDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/courses/explore"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <ExploreCourses />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
                                <DashboardLayout>
                                    <AdminDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'ADMIN']}>
                                <DashboardLayout>
                                    <UserManagement />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'ADMIN', 'user', 'LEARNER', 'INSTRUCTOR', 'TEACHER', 'MENTOR']}>
                                <DashboardLayout>
                                    <Settings />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/instructor/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['instructor', 'INSTRUCTOR', 'MENTOR', 'TEACHER']}>
                                <DashboardLayout>
                                    <CoursesDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* User Profile */}
                    <Route
                        path="/user/profile"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'ADMIN', 'user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <UserProfile />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Course Overview */}
                    <Route
                        path="/courses/:id"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <CourseOverview />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Full-screen Lesson Player */}
                    <Route
                        path="/course/:courseId/lesson/:lessonId"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <LessonPlayer />
                            </ProtectedRoute>
                        }
                    />
                    {/* Live Classes */}
                    <Route
                        path="/live-classes"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <LiveClasses />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/live-class/:id"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <LiveClassRoom />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/quizzes"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <Quizzes />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assignments"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'LEARNER', 'INSTRUCTOR']}>
                                <DashboardLayout>
                                    <WorkSubmission />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                <ChatBot />
            </AuthProvider>
        </Router >
    );
}

export default App;
