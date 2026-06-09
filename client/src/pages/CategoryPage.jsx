import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Palette, Megaphone, BookOpen, Database, Brain, Camera, Music, ArrowRight, Search, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const iconMap = {
    'Development': Code,
    'Design': Palette,
    'Marketing': Megaphone,
    'Business': BookOpen,
    'Data': Database,
    'Personal': Brain,
    'Photography': Camera,
    'Music': Music
};

const CategoryPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/public/categories');
                if (response.ok) {
                    const data = await response.json();
                    // Transform data to match UI needs
                    const formattedDetails = data.map(cat => ({
                        title: cat.title,
                        count: parseInt(cat.count),
                        // Determine icon based on title keywords
                        icon: Object.keys(iconMap).find(k => cat.title.includes(k)) ? iconMap[Object.keys(iconMap).find(k => cat.title.includes(k))] : Zap,
                        description: `Explore ${cat.title} courses`
                    }));
                    setCategories(formattedDetails);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(cat =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fallback if no categories found (simulating dynamic behavior even if empty)
    const displayCategories = filteredCategories.length > 0 ? filteredCategories : [];

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
                            <Link to="/category" className="text-primary font-medium">Category</Link>
                            <Link to="/courses" className="text-neutral-600 hover:text-primary transition-colors font-medium">Courses</Link>
                            <Link to="/blog" className="text-neutral-600 hover:text-primary transition-colors font-medium">Blog</Link>
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
            <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-purple-100/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <motion.h1
                        className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Explore <span className="text-primary">Categories</span>
                    </motion.h1>
                    <motion.p
                        className="text-neutral-500 text-lg max-w-2xl mx-auto mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Browse through our diverse range of learning categories to find the perfect course for your career goals.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        className="max-w-md mx-auto relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-neutral-500">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredCategories.map((category, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="bg-white rounded-3xl p-6 shadow-lg border border-neutral-100 cursor-pointer group hover:border-primary/20 transition-all"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                                        <category.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-800 mb-2">{category.title}</h3>
                                    <p className="text-neutral-500 text-sm mb-3">{category.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-primary font-medium">{category.count} Courses</span>
                                        <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl">
                            <Megaphone className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-700">No Categories Found</h3>
                            <p className="text-neutral-500">
                                It seems there are no course categories available right now.
                                <br />Or the database connection might be unavailable.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-neutral-400">&copy; 2026 <Link to="/" className="hover:text-white transition-colors">LearnSphere</Link> All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default CategoryPage;
