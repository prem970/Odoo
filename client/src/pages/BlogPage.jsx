import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Clock, Tag, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredPost, setFeaturedPost] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/public/blog');
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setFeaturedPost(data[0]);
                        setPosts(data.slice(1));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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
                            <Link to="/blog" className="text-primary font-medium">Blog</Link>
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

            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-gradient-to-br from-primary/5 to-purple-100/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <motion.h1
                        className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Our <span className="text-primary">Blog</span>
                    </motion.h1>
                    <motion.p
                        className="text-neutral-500 text-lg max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Insights, tips, and stories to help you grow your skills and advance your career.
                    </motion.p>
                </div>
            </section>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-neutral-500">Loading articles...</p>
                </div>
            )}

            {!loading && featuredPost && (
                <>
                    {/* Featured Post */}
                    <section className="py-12">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -5 }}
                                className="bg-primary rounded-3xl p-8 lg:p-12 text-white cursor-pointer relative overflow-hidden shadow-2xl shadow-primary/20"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10 max-w-2xl">
                                    <span className="inline-block bg-white/20 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                                        Featured
                                    </span>
                                    <h2 className="text-2xl lg:text-4xl font-bold mb-4">{featuredPost.title}</h2>
                                    <p className="text-white/80 text-lg mb-6">{featuredPost.excerpt}</p>

                                    <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm mb-6">
                                        <span className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {featuredPost.author}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {featuredPost.date}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {featuredPost.readTime}
                                        </span>
                                    </div>

                                    <button className="flex items-center gap-2 text-white font-semibold group">
                                        Read Article
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Blog Posts Grid */}
                    <section className="py-12">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-8">Latest Articles</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map((post, idx) => (
                                    <motion.article
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        whileHover={{ y: -8 }}
                                        className="bg-white rounded-3xl overflow-hidden shadow-lg border border-neutral-100 cursor-pointer group hover:border-primary/20 transition-all"
                                    >
                                        {/* Post Image Placeholder */}
                                        <div className="h-48 bg-primary/5 relative flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                                            </div>
                                            <span className="absolute bottom-3 left-3 bg-white/90 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 text-primary shadow-sm">
                                                <Tag className="w-3 h-3" />
                                                {post.category}
                                            </span>
                                        </div>

                                        {/* Post Content */}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

                                            <div className="flex items-center justify-between text-sm text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {post.author}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {post.readTime}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Newsletter Section */}
            <section className="py-16 bg-neutral-50">
                <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-4">Subscribe to Our Newsletter</h2>
                    <p className="text-neutral-500 mb-8">Get the latest articles and resources delivered straight to your inbox.</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-4 rounded-full border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <Button className="rounded-full px-8 py-4 bg-primary hover:bg-primary-hover">Subscribe</Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                                <Logo className="h-10 w-10 text-white" />
                                <span className="text-2xl font-bold">LearnSphere</span>
                            </Link>
                            <p className="text-neutral-400 max-w-sm">
                                Empowering learners worldwide with quality education and career-focused courses.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-neutral-400">
                                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link to="/courses" className="hover:text-white transition-colors">Explore</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-neutral-400">
                                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400 text-sm">
                        &copy;2026 LearnSphere All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BlogPage;
