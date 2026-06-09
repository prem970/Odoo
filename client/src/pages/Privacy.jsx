import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

const Privacy = () => {
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
                <h1 className="text-4xl font-bold text-neutral-800 mb-8">Privacy Policy</h1>

                <div className="prose prose-lg text-neutral-600">
                    <p className="mb-6">Last updated: February 7, 2026</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact support.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, including personalization and customer support.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">3. Sharing of Information</h3>
                    <p>We do not share your personal information with third parties except as described in this policy, such as with payment processors or for legal reasons.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">4. Data Security</h3>
                    <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">5. Cookies</h3>
                    <p>We use cookies and similar technologies to collect information about your activity, browser, and device.</p>

                    <h3 className="text-xl font-bold text-neutral-800 mt-8 mb-4">6. Your Rights</h3>
                    <p>You have the right to access, correct, or delete your personal information. You can manage your preferences in your account settings.</p>
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

export default Privacy;
