import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Star, Search, Play, Zap, Filter, X, Check, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import Navbar from '../components/Navbar';

const CoursesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        priceRange: 'all',
        rating: 'all',
        duration: 'all',
        sortBy: 'newest'
    });

    const resetFilters = () => {
        setFilters({
            type: 'all',
            priceRange: 'all',
            rating: 'all',
            duration: 'all',
            sortBy: 'newest'
        });
        setShowFilters(false);
    };

    const activeFilterCount = Object.values(filters).filter((v, i) => {
        // sortBy: 'newest' is the default, don't count it as an "active" filter unless it's something else
        if (Object.keys(filters)[i] === 'sortBy' && v === 'newest') return false;
        return v !== 'all';
    }).length;

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                // Fetch courses
                let url = '/api/public/courses';
                const params = new URLSearchParams();
                if (searchQuery) params.append('search', searchQuery);
                if (filters.type !== 'all') params.append('type', filters.type);
                if (filters.rating !== 'all') params.append('rating', filters.rating);
                if (filters.duration !== 'all') params.append('duration', filters.duration);
                if (filters.sortBy !== 'newest') params.append('sortBy', filters.sortBy);

                if (filters.priceRange === 'under-500') {
                    params.append('maxPrice', '500');
                } else if (filters.priceRange === '500-2000') {
                    params.append('minPrice', '500');
                    params.append('maxPrice', '2000');
                } else if (filters.priceRange === 'above-2000') {
                    params.append('minPrice', '2000');
                }

                if (params.toString()) url += `?${params.toString()}`;

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchCourses, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, filters]);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <motion.h1
                                className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                All <span className="text-primary">Courses</span>
                            </motion.h1>
                            <p className="text-neutral-500">Explore {courses.length}+ courses from top instructors</p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto relative">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-full border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant={activeFilterCount > 0 ? "default" : "outline"}
                                    className={`rounded-full px-6 flex items-center gap-2 w-full sm:w-auto h-[46px] ${activeFilterCount > 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border-neutral-200 hover:bg-neutral-50'}`}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-[10px] font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>

                                {/* Filter Dropdown Menu */}
                                {showFilters && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setShowFilters(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-neutral-100 z-40 overflow-hidden"
                                        >
                                            <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                                    <h3 className="font-bold text-neutral-800">Refine Search</h3>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="text-xs text-primary font-bold hover:underline"
                                                    >
                                                        Reset All
                                                    </button>
                                                </div>

                                                {/* Sort By */}
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Sort By</label>
                                                    <select
                                                        value={filters.sortBy}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                                        className="w-full px-4 py-2 rounded-xl border border-neutral-100 text-sm font-medium focus:border-primary outline-none transition-all cursor-pointer bg-neutral-50/50"
                                                    >
                                                        <option value="newest">Newest First</option>
                                                        <option value="popular">Most Popular</option>
                                                        <option value="rating">Highest Rated</option>
                                                        <option value="price-low">Price: Low to High</option>
                                                        <option value="price-high">Price: High to Low</option>
                                                    </select>
                                                </div>

                                                {/* Course Type */}
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Course Type</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {['all', 'free', 'paid'].map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setFilters(prev => ({ ...prev, type: t }))}
                                                                className={`px-2 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filters.type === t ? 'bg-primary text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price Range */}
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Price Range</label>
                                                    <select
                                                        value={filters.priceRange}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                                                        className="w-full px-4 py-2 rounded-xl border border-neutral-100 text-sm font-medium focus:border-primary outline-none transition-all cursor-pointer bg-neutral-50/50"
                                                    >
                                                        <option value="all">Any Price</option>
                                                        <option value="under-500">Under ₹500</option>
                                                        <option value="500-2000">₹500 - ₹2000</option>
                                                        <option value="above-2000">Above ₹2000</option>
                                                    </select>
                                                </div>

                                                {/* Duration */}
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Time Range</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { id: 'all', label: 'Any' },
                                                            { id: 'short', label: '< 2h' },
                                                            { id: 'medium', label: '2h - 10h' },
                                                            { id: 'long', label: '> 10h' }
                                                        ].map(d => (
                                                            <button
                                                                key={d.id}
                                                                onClick={() => setFilters(prev => ({ ...prev, duration: d.id }))}
                                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${filters.duration === d.id ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-100 text-neutral-500 hover:border-neutral-200'}`}
                                                            >
                                                                {d.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Rating */}
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Minimum Rating</label>
                                                    <div className="space-y-2">
                                                        {['all', '4.5', '4.0', '3.5'].map(r => (
                                                            <button
                                                                key={r}
                                                                onClick={() => setFilters(prev => ({ ...prev, rating: r }))}
                                                                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm transition-all ${filters.rating === r ? 'bg-primary/5 text-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    {r === 'all' ? 'Any Rating' : (
                                                                        <>
                                                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                                            {r} & up
                                                                        </>
                                                                    )}
                                                                </span>
                                                                {filters.rating === r && <Check className="w-4 h-4" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-neutral-50 border-t border-neutral-100">
                                                <Button
                                                    onClick={() => setShowFilters(false)}
                                                    className="w-full rounded-2xl"
                                                >
                                                    Show Results
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-neutral-500">Loading courses...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.map((course, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -8 }}
                                    className="bg-white rounded-3xl overflow-hidden shadow-lg border border-neutral-100 cursor-pointer group hover:border-primary/20 transition-all"
                                >
                                    {/* Course Image */}
                                    <div className="h-40 bg-neutral-100 relative grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden">
                                        {course.image ? (
                                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                <Zap className="w-10 h-10 text-primary/30" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 mb-3">{course.instructor}</p>

                                        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                {course.rating}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {course.students >= 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {course.duration}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-primary">
                                                {course.price > 0 ? `₹${course.price}` : 'Free'}
                                            </span>
                                            <Button size="sm" className="rounded-full px-4 bg-primary hover:bg-primary-hover shadow-md hover:shadow-primary/30">
                                                Enroll
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!loading && courses.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-neutral-500 text-lg">No courses found matching your criteria.</p>
                        </div>
                    )}
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
                                <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
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

export default CoursesPage;
