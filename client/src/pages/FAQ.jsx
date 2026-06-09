import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

const FAQ = () => {
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
                <h1 className="text-4xl font-bold text-neutral-800 mb-8">Frequently Asked Questions</h1>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">How do I access my courses?</h3>
                        <p className="text-neutral-600">Once you enroll in a course, you can access it anytime from your dashboard. Simply log in and click on "My Courses" to view your enrolled content.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Do the courses have an expiration date?</h3>
                        <p className="text-neutral-600">No, once you purchase a course, you have lifetime access to it, including any future updates.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Can I download the course materials?</h3>
                        <p className="text-neutral-600">Yes, most of our courses come with downloadable resources, including slides, cheat sheets, and source code.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Is there a refund policy?</h3>
                        <p className="text-neutral-600">We offer a 30-day money-back guarantee. If you are not satisfied with a course, you can request a full refund within 30 days of purchase.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Do I get a certificate upon completion?</h3>
                        <p className="text-neutral-600">Yes, you will receive a verified certificate of completion for every course you finish, which you can share on your LinkedIn profile or resume.</p>
                    </div>
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

export default FAQ;
