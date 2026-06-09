import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

const HelpCenter = () => {
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
                <h1 className="text-4xl font-bold text-neutral-800 mb-6">Help Center</h1>
                <p className="text-xl text-neutral-500 mb-12">How can we help you today?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl border border-neutral-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                        <h3 className="text-xl font-bold text-neutral-800 mb-3">Student Support</h3>
                        <p className="text-neutral-600 mb-4">Issues with courses, payments, or your account?</p>
                        <span className="text-primary font-medium">Get student help &rarr;</span>
                    </div>

                    <div className="p-6 rounded-2xl border border-neutral-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                        <h3 className="text-xl font-bold text-neutral-800 mb-3">Instructor Support</h3>
                        <p className="text-neutral-600 mb-4">Questions about creating courses or payments?</p>
                        <span className="text-primary font-medium">Get instructor help &rarr;</span>
                    </div>

                    <div className="p-6 rounded-2xl border border-neutral-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                        <h3 className="text-xl font-bold text-neutral-800 mb-3">Technical Issues</h3>
                        <p className="text-neutral-600 mb-4">Experiencing bugs or glitches on the platform?</p>
                        <span className="text-primary font-medium">Report an issue &rarr;</span>
                    </div>

                    <div className="p-6 rounded-2xl border border-neutral-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                        <h3 className="text-xl font-bold text-neutral-800 mb-3">General Inquiries</h3>
                        <p className="text-neutral-600 mb-4">For press, partnerships, or general questions.</p>
                        <span className="text-primary font-medium">Contact us &rarr;</span>
                    </div>
                </div>

                <div className="mt-16 bg-neutral-50 p-8 rounded-3xl text-center">
                    <h3 className="text-2xl font-bold text-neutral-800 mb-4">Still need help?</h3>
                    <p className="text-neutral-600 mb-6">Our support team is available 24/7 to assist you.</p>
                    <Button className="rounded-full px-8 py-3 bg-primary hover:bg-primary-hover">Contact Support</Button>
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

export default HelpCenter;
