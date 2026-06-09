import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Palette, Megaphone, BookOpen, Users, TrendingUp, Play } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ScrollProgressBar } from '../components/ui/ScrollProgressBar';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { Typewriter } from '../components/ui/Typewriter';
import Navbar from '../components/Navbar';

const LandingPage = () => {
    const [stats, setStats] = useState({ courses: 0, students: 0, enrollments: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/public/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    // Single color theme - Primary Plum
    const featureIconBg = "bg-primary/10";
    const featureIconColor = "text-primary";

    // ... rest of the component up to the stats section ...

    const courses = [
        {
            icon: Palette,
            title: "UI/UX Design",
            description: "Master digital design"
        },
        {
            icon: Code,
            title: "Web Development",
            description: "Build modern websites"
        },
        {
            icon: Megaphone,
            title: "Digital Marketing",
            description: "Grow your audience"
        },
        {
            icon: BookOpen,
            title: "Practical Learning",
            description: "Real-world skills"
        }
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <ScrollProgressBar />

            {/* Navigation */}
            <Navbar />

            {/* Hero Section - Split Layout */}
            <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 min-h-[90vh] flex items-center">
                {/* Background decorations */}
                <div className="absolute top-20 right-1/4 w-4 h-4 bg-primary/20 rounded-full animate-float" />
                <div className="absolute top-40 right-1/3 w-3 h-3 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '2s' }} />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-800 leading-tight mb-6">
                                Investing in
                                <br />
                                Knowledge and
                                <br />
                                Your <Typewriter
                                    words={["Future", "Life", "Generation"]}
                                    className="text-primary"
                                />
                            </h1>

                            <p className="text-neutral-500 text-lg mb-8 max-w-md leading-relaxed">
                                Our e-learning programs has been developed to be a vehicle
                                of delivering multimedia learning solutions for your business.
                            </p>

                            <div className="flex flex-wrap items-center gap-6 mb-10">
                                <Link to="/register">
                                    <motion.div
                                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(113, 75, 103, 0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button className="rounded-full px-8 py-4 text-lg bg-primary hover:bg-primary-hover shadow-xl shadow-primary/30 border-none">
                                            Contact
                                        </Button>
                                    </motion.div>
                                </Link>

                                {/* Stats */}
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-neutral-800">{stats.courses}+</span>
                                        <p className="text-sm text-neutral-400">Career Courses</p>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-neutral-800">{stats.students >= 1000 ? `${(stats.students / 1000).toFixed(0)}k+` : stats.students}</span>
                                        <p className="text-sm text-neutral-400">Our Students</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Content - Video Section */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Circle background - Subtle Primary Color */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-primary/5" />

                            {/* Lottie Animation Container */}
                            <div className="relative z-10 flex justify-center">
                                <div className="w-full max-w-lg aspect-square rounded-3xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                                    <DotLottieReact
                                        src="https://lottie.host/45abf52d-ace4-481c-b9d0-44769a2a38de/jJP8AWscLL.lottie"
                                        loop
                                        autoplay
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>

                            {/* Floating Card - Students Count */}
                            <motion.div
                                className="absolute -top-4 -right-4 lg:right-0 bg-white rounded-2xl shadow-xl p-4 border border-neutral-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-neutral-800">{stats.enrollments >= 1000 ? `${(stats.enrollments / 1000).toFixed(1)}K` : stats.enrollments}</p>
                                        <p className="text-xs text-neutral-400">Assisted Students</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Card - Learning Chart */}
                            <motion.div
                                className="absolute -bottom-8 -left-4 lg:left-0 bg-white rounded-2xl shadow-xl p-4 border border-neutral-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ y: -5 }}
                            >
                                <p className="text-sm font-semibold text-neutral-700 mb-3">Learning Chart</p>
                                <div className="flex items-end gap-2 h-20">
                                    {/* Monochromatic chart bars */}
                                    <div className="w-6 bg-primary/20 rounded-t" style={{ height: '40%' }} />
                                    <div className="w-6 bg-primary/40 rounded-t" style={{ height: '65%' }} />
                                    <div className="w-6 bg-primary/30 rounded-t" style={{ height: '55%' }} />
                                    <div className="w-6 bg-primary/60 rounded-t" style={{ height: '85%' }} />
                                    <div className="w-6 bg-primary/50 rounded-t" style={{ height: '70%' }} />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Courses Section - Single Color Icons */}
            <section id="courses" className="py-20 bg-neutral-50/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <AnimatedSection>
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-12">
                            Browse Top Essential
                            <br />
                            Career Courses
                        </h2>
                    </AnimatedSection>

                    <div className="flex flex-wrap items-center gap-6">
                        {courses.map((course, idx) => (
                            <AnimatedSection key={idx} delay={idx * 0.1}>
                                <motion.div
                                    className="w-48 h-48 bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 border border-neutral-100 hover:border-primary/20 group relative overflow-hidden"
                                    whileHover={{
                                        scale: 1.05,
                                        y: -10,
                                        boxShadow: "0 25px 50px -12px rgba(113, 75, 103, 0.15)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${featureIconBg} flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300`}>
                                        <course.icon className={`w-6 h-6 ${featureIconColor} group-hover:text-white transition-colors duration-300`} />
                                    </div>
                                    <p className="text-neutral-800 font-bold text-lg leading-tight mb-2">
                                        {course.title}
                                    </p>
                                    <p className="text-neutral-400 text-xs">
                                        {course.description}
                                    </p>
                                </motion.div>
                            </AnimatedSection>
                        ))}

                        {/* Browse All Button */}
                        <AnimatedSection delay={0.4}>
                            <Link to="/courses">
                                <motion.div
                                    className="w-20 h-20 bg-primary rounded-full shadow-lg shadow-primary/20 flex items-center justify-center cursor-pointer"
                                    whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(113, 75, 103, 0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </motion.div>
                                <p className="text-sm text-neutral-500 mt-3 text-center">Browse All</p>
                            </Link>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Features Section - Single Color Icons */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <AnimatedSection className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                            Why Choose <span className="text-primary">LearnSphere?</span>
                        </h2>
                        <p className="text-neutral-500 max-w-2xl mx-auto">
                            We provide the best learning experience with expert instructors and comprehensive courses.
                        </p>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Expert Instructors",
                                desc: "Learn from industry professionals with years of experience.",
                                icon: Users
                            },
                            {
                                title: "Flexible Learning",
                                desc: "Study at your own pace with lifetime access to courses.",
                                icon: BookOpen
                            },
                            {
                                title: "Career Growth",
                                desc: "Get certified and boost your career opportunities.",
                                icon: TrendingUp
                            }
                        ].map((feature, idx) => (
                            <AnimatedSection key={idx} delay={idx * 0.15}>
                                <motion.div
                                    className="bg-white rounded-3xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl hover:border-primary/10 transition-all group"
                                    whileHover={{ y: -8 }}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${featureIconBg} flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300`}>
                                        <feature.icon className={`w-7 h-7 ${featureIconColor} group-hover:text-white transition-colors duration-300`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-800 mb-3">{feature.title}</h3>
                                    <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <AnimatedSection className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of students already transforming their careers with LearnSphere
                    </p>
                    <Link to="/register">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-block"
                        >
                            <Button size="lg" className="rounded-full px-10 py-4 text-lg bg-white text-primary hover:bg-neutral-100 shadow-2xl">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5 inline" />
                            </Button>
                        </motion.div>
                    </Link>
                </div>
            </AnimatedSection>

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

export default LandingPage;
