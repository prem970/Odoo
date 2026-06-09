import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

const Terms = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-2">
                            <Logo className="h-10 w-10 text-primary" />
                            <span className="text-2xl font-bold text-primary">LearnSphere</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-10">
                            <Link to="/" className="text-neutral-600 hover:text-primary transition-colors font-medium">Home</Link>
                            <Link to="/courses" className="text-neutral-600 hover:text-primary transition-colors font-medium">Explore</Link>
                            <Link to="/blog" className="text-neutral-600 hover:text-primary transition-colors font-medium">Blog</Link>
                            <Link to="/contact" className="text-neutral-600 hover:text-primary transition-colors font-medium">Contact</Link>
                        </div>

                        <Link to="/register">
                            <Button className="rounded-full px-6 py-2.5 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-20">
                <h1 className="text-4xl font-bold text-neutral-800 mb-8">Terms of Service</h1>

                <div className="prose prose-lg text-neutral-600">
                    <p className="mb-6">Last updated: February 7, 2026</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">1. Acceptance of Terms</h3>
                    <p>By accessing and using LearnSphere, you accept and agree to be bound by the terms and provision of this agreement.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">2. Description of Service</h3>
                    <p>LearnSphere provides an online learning platform offering various courses, tutorials, and educational resources.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">3. User Accounts</h3>
                    <p>To access certain features of the platform, you must register for an account. You agree to provide accurate and complete information and keep your account information updated.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">4. Content Ownership</h3>
                    <p>All content provided on LearnSphere is owned by us or our instructors and is protected by international copyright laws.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">5. Payments and Refunds</h3>
                    <p>Prices for courses are subject to change. We offer a 30-day refund policy for all course purchases.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">6. Termination</h3>
                    <p>We reserve the right to terminate your access to the platform if you violate these Terms of Service.</p>
                </div>
            </div>
            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-neutral-400">&copy; 2026 <Link to="/" className="hover:text-white transition-colors">LearnSphere</Link> All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Terms;
