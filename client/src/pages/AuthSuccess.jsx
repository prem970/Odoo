import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const effectRan = React.useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const processLogin = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                console.error('No token found in OAuth success redirect');
                navigate('/login?error=no_token');
                return;
            }

            console.log('Token received:', token.substring(0, 10) + '...');

            try {
                // Robust Base64URL decode
                const base64Url = token.split('.')[1];
                if (!base64Url) throw new Error('Invalid Token Format');

                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                console.log('Decoded Payload:', payload);

                const user = {
                    id: payload.id,
                    name: payload.name,
                    role: payload.role || 'LEARNER'
                };

                // Update Context
                await login(user, token);
                console.log('User logged in context. Redirecting...');

                // Redirect based on role
                const role = (user.role || '').toLowerCase();
                const targetPath = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

                // Small delay to ensure state updates
                setTimeout(() => {
                    navigate(targetPath, { replace: true });
                }, 100);

            } catch (err) {
                console.error('Failed to parse auth token:', err);
                navigate('/login?error=invalid_token');
            }
        };

        processLogin();
    }, [location, navigate, login]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-neutral-900">Finalizing Sign In...</h2>
                <p className="text-neutral-500">You're being redirected to your dashboard.</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
