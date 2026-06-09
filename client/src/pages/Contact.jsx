import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-800 mb-6">
                            Get in <span className="text-primary">Touch</span>
                        </h1>
                        <p className="text-xl text-neutral-500 mb-12 leading-relaxed">
                            Have questions about our courses or need assistance? We're here to help you on your learning journey.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-800 mb-1">Email Us</h3>
                                    <p className="text-neutral-600">support@LearnSpherecom</p>
                                    <p className="text-neutral-600">partners@LearnSpherecom</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-800 mb-1">Call Us</h3>
                                    <p className="text-neutral-600">+91 9876543210</p>
                                    <p className="text-neutral-600">Mon-Fri, 9am - 6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-800 mb-1">Visit Us</h3>
                                    <p className="text-neutral-600">Avinashi Road, Peelamedu</p>
                                    <p className="text-neutral-600">Coimbatore, Tamil Nadu 641004</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl">
                        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Send us a Message</h2>

                        {status === 'success' ? (
                            <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
                                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                <p>Thank you for contacting us. We'll get back to you shortly.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setStatus('')}
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your name"
                                        required
                                        className="bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                        required
                                        className="bg-neutral-50 border-neutral-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you?"
                                        required
                                        rows={4}
                                        className="flex w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-colors"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 h-12 text-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

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

export default Contact;
