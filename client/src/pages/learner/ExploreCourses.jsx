import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Star, Clock, ArrowRight, CircleCheck as CheckCircle2, Award, SlidersHorizontal, Check, X, Play, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

const ExploreCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [myCourseIds, setMyCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [enrollingId, setEnrollingId] = useState(null);
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
        setSearchTerm('');
        setShowFilters(false);
    };

    const activeFilterCount = Object.values(filters).filter((v, i) => {
        if (Object.keys(filters)[i] === 'sortBy' && v === 'newest') return false;
        return v !== 'all';
    }).length;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                // 1. Fetch search/filter results
                let url = '/api/learner/courses';
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
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

                const allRes = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // 2. Fetch My Current Enrollments
                const myRes = await fetch('/api/learner/my-courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (allRes.ok && myRes.ok) {
                    const allData = await allRes.json();
                    const myData = await myRes.json();

                    setCourses(allData);
                    setMyCourseIds(new Set(myData.map(c => c.id)));
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchData, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, filters]);

    const handleEnroll = async (courseId) => {
        setEnrollingId(courseId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/learner/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId })
            });

            if (res.ok) {
                setMyCourseIds(prev => new Set([...prev, courseId]));
                // Optional: navigate to dashboard or show success
            }
        } catch (error) {
            console.error('Enroll error:', error);
        } finally {
            setEnrollingId(null);
        }
    };



    if (loading) {
        return (
            <div className="space-y-8 p-6">
                <div className="h-10 w-64 bg-neutral-100 animate-pulse rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="h-80 bg-neutral-50 animate-pulse border-none rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Hero Banner */}
            <div className="relative rounded-[2rem] overflow-hidden bg-primary p-12 text-white min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Award className="w-64 h-64" />
                </div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none italic font-medium px-4 py-1">
                        Explore Learning
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        <span className="text-white">Transform Your</span> <span className="text-highlight-mustard text-amber-300">Skillset</span>
                    </h1>
                    <p className="text-xl text-neutral-100 font-medium">
                        Join 10,000+ students mastering modern technologies with expert-led courses and <span className="text-white font-bold italic">Live</span> sessions.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="rounded-full h-14 px-8 bg-white text-primary hover:bg-neutral-100 border-none font-bold text-lg shadow-lg transition-transform hover:scale-105 active:scale-95">
                            Browse Catalog
                        </Button>
                        <Button onClick={() => navigate('/live-classes')} variant="outline" className="rounded-full h-14 px-8 border-white/30 bg-transparent text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
                            <span className="text-white">Experience Live Learning</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20 bg-neutral-50/80 backdrop-blur-md p-4 rounded-3xl border border-neutral-200/50 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                        placeholder="Search courses, skills, or topics..."
                        className="pl-12 h-14 rounded-2xl bg-white border-neutral-200 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 relative">
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant={activeFilterCount > 0 ? "default" : "outline"}
                        className={`rounded-2xl h-14 px-6 flex items-center gap-2 ${activeFilterCount > 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border-neutral-200 hover:bg-white'}`}
                    >
                        <SlidersHorizontal className="w-5 h-5 mr-1" />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    <AnimatePresence>
                        {showFilters && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowFilters(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-neutral-100 z-40 overflow-hidden"
                                >
                                    <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                            <h3 className="font-bold text-neutral-800">Refine Search</h3>
                                            <button onClick={resetFilters} className="text-xs text-primary font-bold hover:underline">Reset All</button>
                                        </div>

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
                                        <Button onClick={() => setShowFilters(false)} className="w-full rounded-2xl">Show Results</Button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, idx) => {
                    const isEnrolled = myCourseIds.has(course.id);
                    return (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="group h-full hover:shadow-2xl transition-all duration-500 border-neutral-200 rounded-[2.5rem] overflow-hidden bg-white shadow-sm flex flex-col">
                                {/* Image Container */}
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-white/90 text-primary border-none shadow-sm backdrop-blur-sm">
                                            {course.price > 0 ? `₹${course.price}` : 'Free'}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-black text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                                        {course.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium">
                                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.students || 0} Students</span>
                                        <span className="flex items-center gap-1 text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" /> {parseFloat(course.rating || 0).toFixed(1)}
                                        </span>
                                        {course.duration && (
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <p className="text-neutral-500 line-clamp-2 text-sm leading-relaxed">
                                        {course.description || "Master these industry-standard skills with our deep-dive tutorial series designed for modern professionals."}
                                    </p>
                                </CardContent>

                                <CardFooter className="pt-0 pb-8 px-8">
                                    {isEnrolled ? (
                                        <Button
                                            className="w-full h-14 rounded-2xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 gap-2 border-none"
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            Continue Learning
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full h-14 rounded-2xl group-hover:gap-3 transition-all shadow-lg hover:shadow-primary/25"
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={enrollingId === course.id}
                                        >
                                            {enrollingId === course.id ? 'Enrolling...' : 'Enroll Now'}
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {courses.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900">No courses match your search</h2>
                    <p className="text-neutral-500 mt-2">Try searching for different keywords or clear the filters.</p>
                </div>
            )}
        </div>
    );
};

export default ExploreCourses;
