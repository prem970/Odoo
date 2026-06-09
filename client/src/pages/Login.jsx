import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data.user, data.token);

            const userRole = data.user.role?.toLowerCase();
            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'instructor') {
                navigate('/instructor/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-neutral-50">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-900 opacity-90"></div>
                <div className="relative z-10 max-w-lg text-white">
                    <h2 className="text-5xl font-bold mb-6 text-white tracking-wide" style={{ fontFamily: "'Raleway', sans-serif" }}>Welcome Back</h2>
                    <p className="text-xl font-handwriting font-light leading-relaxed text-[#979798]">
                        Access your dashboard to manage your sales, inventory, and finances all in one place.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative">
                {/* Title Outside Card */}
                <div className="absolute top-8 right-8 lg:top-12 lg:right-12">
                    {/* "Login Page" text from wireframe, though user said "only right side". 
                         But in standard split layout, the "Page Title" usually goes in the header or branding side.
                         However, based on wireframe, it's a "Login Page" header. 
                         Let's keep the Odoo home link but maybe position it differently or keep as is.
                         The wireframe shows "Login Page" above.
                      */}
                </div>

                <div className="w-full max-w-md space-y-8">


                    <Card className="border-none shadow-2xl bg-white/50 backdrop-blur-sm">
                        <CardContent className="pt-12 pb-8 px-8">
                            <div className="flex justify-center mb-10">
                                <Logo className="h-24 w-24" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="email">
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder=""
                                        className="h-12 border-neutral-400 bg-transparent focus:ring-primary/20"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder=""
                                            className="h-12 border-neutral-400 bg-transparent focus:ring-primary/20"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />

                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-4">
                                    <Button type="submit" size="lg" className="w-full h-14 font-bold uppercase tracking-wider text-base hover:scale-[1.02] transition-all shadow-lg shadow-primary/20" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                                    </Button>

                                    <div className="flex items-center gap-4 w-full text-neutral-400">
                                        <div className="h-[1px] bg-neutral-200 flex-1"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">OR</span>
                                        <div className="h-[1px] bg-neutral-200 flex-1"></div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const target = import.meta.env.PROD ? '/auth/google' : 'http://localhost:5001/auth/google';
                                            window.location.href = target;
                                        }}
                                        variant="outline"
                                        className="w-full h-14 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all rounded-xl font-bold flex items-center justify-center gap-3 group relative overflow-hidden"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span className="text-neutral-700">Continue with Google</span>
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Forget Password ?
                                </Link>
                                <span>|</span>
                                <Link to="/register" className="hover:text-primary transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
