import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, Video, Users, CheckCircle } from 'lucide-react';

const LiveClasses = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/live-classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSessions(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading sessions...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="relative rounded-[2rem] overflow-hidden bg-primary p-8 md:p-12 text-white min-h-[300px] flex flex-col justify-center shadow-2xl shadow-primary/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Video className="w-64 h-64" />
                </div>
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none italic font-medium px-4 py-1">
                        Interactive Learning
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        <span className="text-white">Transform Your</span> <span className="text-amber-300">Skillset</span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-100 leading-relaxed font-medium">
                        Connect with industry experts in real-time. Join our scheduled interactive
                        <span className="text-white font-bold italic mx-1.5">Live</span> sessions and master new domains.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Button className="rounded-full h-14 px-8 bg-white text-primary hover:bg-neutral-100 border-none font-bold text-lg shadow-lg transition-transform hover:scale-105">
                            Get Notified
                        </Button>
                        <Button variant="outline" className="rounded-full h-14 px-8 border-white/30 bg-transparent text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-transform hover:scale-105">
                            <span className="text-white">Experience Live Learning</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 text-center space-y-6 shadow-sm">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 rotate-3 group-hover:rotate-0 transition-transform">
                            <Video className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-neutral-900">Our Live Portal is Launching Soon</h2>
                        <p className="text-neutral-500 max-w-md mx-auto leading-relaxed">
                            We're putting the finishing touches on our real-time streaming infrastructure.
                            Expect 4K quality, interactive whiteboards, and instant mentor chat.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                            <div className="p-6 bg-neutral-50 rounded-3xl space-y-2 border border-neutral-100/50">
                                <div className="text-2xl font-black text-primary">4K</div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Ultra HD Streaming</div>
                            </div>
                            <div className="p-6 bg-neutral-50 rounded-3xl space-y-2 border border-neutral-100/50">
                                <div className="text-2xl font-black text-primary">Zero</div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Latency Chat</div>
                            </div>
                            <div className="p-6 bg-neutral-50 rounded-3xl space-y-2 border border-neutral-100/50">
                                <div className="text-2xl font-black text-primary">Cloud</div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Session Recording</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border-neutral-200 overflow-hidden shadow-sm">
                        <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 pb-6 pt-8 px-8">
                            <CardTitle className="text-xl font-black flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Preparation Guide
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {[
                                { icon: CheckCircle, text: "High-speed internet connection" },
                                { icon: CheckCircle, text: "Updated browser for WebRTC" },
                                { icon: CheckCircle, text: "Quiet environment for focus" },
                                { icon: CheckCircle, text: "Course materials ready for reference" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="mt-1 bg-green-100 p-1 rounded-full">
                                        <item.icon className="w-3 h-3 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-600 leading-tight">{item.text}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Server Status</span>
                        </div>
                        <h4 className="text-xl font-bold">Systems Ready</h4>
                        <p className="text-sm text-neutral-400 font-medium">
                            Our global relay network is active and waiting for your first stream.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveClasses;
