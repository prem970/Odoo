import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'learner'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Password complexity check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one special character.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            navigate('/login');
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
                    <h2 className="text-5xl font-bold mb-6 text-white tracking-wide" style={{ fontFamily: "'Raleway', sans-serif" }}>Join LearnSphere Today</h2>
                    <p className="text-xl font-handwriting font-light leading-relaxed text-[#979798]">
                        Start your journey with the most powerful all-in-one platform for business management.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white opacity-5"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
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
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="name">Enter Name</label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="h-12 border-neutral-400 bg-transparent focus:ring-primary/20"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="email">Enter Email Id</label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="h-12 border-neutral-400 bg-transparent focus:ring-primary/20"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="password">Password</label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="h-12 border-neutral-400 bg-transparent focus:ring-primary/20"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="confirmPassword">Re-Enter Password</label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="h-12 border-neutral-400 bg-transparent focus:ring-primary/20"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-lg font-handwriting text-neutral-600" htmlFor="role">Account Type</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="flex h-12 w-full rounded-lg border border-neutral-400 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        disabled={isLoading}
                                    >
                                        <option value="learner">Learner</option>
                                        <option value="instructor">Instructor</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-center">
                                    <Button type="submit" size="lg" className="w-40 font-bold uppercase tracking-wider text-base hover:scale-105 transition-transform" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
                                    </Button>

                                </div>
                            </form>
                            <div className="mt-8 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Forget Password ?
                                </Link>
                                <span>|</span>
                                <Link to="/login" className="hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;
