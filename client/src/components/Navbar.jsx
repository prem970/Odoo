import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, CircleHelp as HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isLanding = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Explore', path: '/courses' },
        { label: 'Community', path: '/community' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <motion.nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-500",
                (isLanding && !isScrolled) ? "bg-transparent py-6" : "bg-white/90 backdrop-blur-xl shadow-sm py-3"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="group">
                        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
                            <Logo className="h-10 w-10 text-primary transition-transform group-hover:rotate-12" />
                            <span className={cn(
                                "text-2xl font-black tracking-tight transition-colors",
                                (isLanding && !isScrolled) ? "text-neutral-800" : "text-primary"
                            )}>
                                LearnSphere
                            </span>
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "text-sm font-semibold transition-all hover:text-primary relative group",
                                    location.pathname === item.path ? "text-primary" : "text-neutral-600",
                                    (isLanding && !isScrolled) && "text-neutral-700"
                                )}
                            >
                                {item.label}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                                    location.pathname === item.path && "w-full"
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* Auth Area */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-neutral-100/50 transition-colors border border-neutral-200/20"
                                >
                                    <span className="text-sm font-bold text-neutral-700">{user.name || user.full_name?.split(' ')[0]}</span>
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-white shadow-sm">
                                        {getInitials(user.name || user.full_name)}
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", userMenuOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-neutral-50 mb-1">
                                                    <p className="text-xs font-black text-primary uppercase tracking-[0.1em] mb-0.5">{user.role}</p>
                                                    <p className="text-sm font-bold text-neutral-900 truncate">{user.email}</p>
                                                </div>

                                                <Link
                                                    to={user.role?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Go to Dashboard
                                                </Link>

                                                <Link
                                                    to="/user/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    My Profile
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" className="rounded-full px-6 font-semibold text-neutral-600 hover:text-primary">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="rounded-full px-7 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 border-none font-bold">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-neutral-50 overflow-hidden"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {navItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="block text-lg font-bold text-neutral-800 hover:text-primary transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="pt-6 border-t border-neutral-50">
                                {user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-2xl">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                {getInitials(user.name || user.full_name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-900">{user.name || user.full_name}</p>
                                                <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        <Link to="/user/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full justify-center h-12 rounded-xl mb-3">Dashboard</Button>
                                        </Link>
                                        <Link to="/user/profile" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-center h-12 rounded-xl mb-3 font-bold">My Profile</Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-center h-12 rounded-xl text-rose-600 border-rose-100 bg-rose-50/30"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full h-12 rounded-xl font-bold">Sign In</Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full h-12 bg-primary text-white rounded-xl font-bold">Sign Up</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
