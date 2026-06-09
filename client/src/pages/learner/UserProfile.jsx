import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Trophy, Star, Shield, TrendingUp, User, Mail, Calendar, MapPin, Briefcase, Edit2 } from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const role = (authUser?.role || '').toString().trim().toUpperCase();
    const isMasterRole = role === 'ADMIN' || role === 'INSTRUCTOR' || role === 'MENTOR';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/learner/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setProfile(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-500 animate-pulse">Loading profile...</p>
        </div>
    );
    if (!profile) return <div className="p-8 text-center text-red-500">Failed to load profile.</div>;

    const { user, totalPoints, currentBadge, nextBadge, progress, badges } = profile;

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            {/* Page Header (Only for Masters) */}
            {isMasterRole && (
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Account Overview</h1>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Manage your professional profile and system settings</p>
                    </div>
                </div>
            )}

            {/* Hero Section (Only for Learners) */}
            {!isMasterRole && (
                <div className="relative rounded-[2rem] overflow-hidden bg-primary p-8 md:p-12 text-white shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <User className="w-48 h-48 text-white" />
                    </div>
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <Badge variant="secondary" className="bg-white/20 text-white border-none italic font-medium px-4 py-1">
                            Personal Achievement Hub
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            <span className="text-white">Transform Your</span> <span className="text-amber-300">Skillset</span>
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-100 font-medium leading-relaxed">
                            Track your career trajectory, earn exclusive badges, and join Live sessions to accelerate your growth.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button onClick={() => navigate('/courses/explore')} className="rounded-full h-14 px-8 bg-white text-primary hover:bg-neutral-100 border-none font-bold text-lg shadow-lg">
                                Explore Courses
                            </Button>
                            <Button onClick={() => navigate('/live-classes')} variant="outline" className="rounded-full h-14 px-8 border-white/30 bg-transparent text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
                                <span className="text-white">Experience Live Learning</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Content */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", isMasterRole && "items-start")}>
                {/* ID Card */}
                <Card className="lg:col-span-1 rounded-[2.5rem] border-neutral-100 shadow-sm overflow-hidden h-fit sticky top-24">
                    <div className="h-24 bg-primary/5" />
                    <CardContent className="-mt-12 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-neutral-100 flex items-center justify-center text-3xl font-bold text-primary shadow-lg mb-4">
                            {user.full_name ? user.full_name[0] : 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">{user.full_name}</h2>
                        <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest font-black font-sans">
                            {role}
                        </Badge>

                        <Button
                            variant="ghost"
                            className="mt-6 w-full rounded-2xl border border-neutral-200 hover:border-primary hover:bg-primary/5 text-neutral-600 hover:text-primary transition-all text-xs font-bold gap-2 py-6"
                            onClick={() => navigate('/settings')}
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </Button>

                        <div className="w-full mt-8 space-y-4 pt-8 border-t border-neutral-50">
                            <div className="flex items-center gap-3 text-sm text-neutral-500 px-2">
                                <Mail className="w-4 h-4 text-primary/60" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-500 px-2">
                                <Calendar className="w-4 h-4 text-primary/60" />
                                <span>Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-500 px-2">
                                <Shield className="w-4 h-4 text-primary/60" />
                                <span>Level {Math.floor(totalPoints / 100) + 1} Member</span>
                            </div>
                        </div>

                        {!isMasterRole && (
                            <div className="w-full mt-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-[11px] text-neutral-500">
                                Your learning journey at LearnSphere started {new Date(user.created_at).toLocaleDateString()}. Keep growing!
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Main Stats / Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Points Box (Only for Learners) */}
                    {!isMasterRole && (
                        <div className="bg-white rounded-[2rem] p-8 border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Total Points</p>
                                <p className="text-5xl font-black text-primary">{totalPoints}</p>
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="flex justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-2">
                                    <span>Next: {nextBadge ? nextBadge.name : 'Max Level'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Section */}
                    <div className="bg-white rounded-[2rem] p-8 border border-neutral-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-neutral-900">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                </div>
                                Recent Activity
                            </h2>
                            <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                                <span>Less</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-neutral-100"></div>
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-primary"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-4">
                            <div className="min-w-[700px]">
                                <CalendarHeatmap
                                    startDate={subDays(new Date(), 365)}
                                    endDate={new Date()}
                                    values={profile.activityLog || []}
                                    classForValue={(value) => {
                                        if (!value || value.count === 0) return 'color-empty';
                                        if (value.count >= 3) return 'color-scale-4';
                                        return 'color-scale-2';
                                    }}
                                />
                            </div>
                        </div>
                        <style>{`
                            .react-calendar-heatmap text { font-size: 8px; fill: #a3a3a3; }
                            .react-calendar-heatmap rect { rx: 2px; }
                            .react-calendar-heatmap .color-empty { fill: #f5f5f5; }
                            .react-calendar-heatmap .color-scale-2 { fill: rgba(113, 75, 103, 0.4); } 
                            .react-calendar-heatmap .color-scale-4 { fill: #714B67; }
                        `}</style>
                    </div>

                    {/* Badges Section (Only for Learners) */}
                    {!isMasterRole && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-neutral-900">Achievements</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {profile.badges && profile.badges.map((badge) => {
                                    const isUnlocked = totalPoints >= badge.min_points;
                                    return (
                                        <div key={badge.id} className={`text-center p-6 rounded-[2rem] transition-all border ${isUnlocked ? 'border-primary/20 bg-primary/[0.02]' : 'opacity-30 grayscale bg-neutral-50 border-transparent'}`}>
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto ${isUnlocked ? 'bg-amber-100 text-amber-500' : 'bg-neutral-200 text-neutral-400'}`}>
                                                <Trophy className="h-7 w-7" />
                                            </div>
                                            <p className="font-bold text-xs text-neutral-900">{badge.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Professional Info (For Masters) */}
                    {isMasterRole && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="rounded-[2rem] border-neutral-100 shadow-sm border p-6">
                                <CardTitle className="text-base mb-4 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" /> Experience
                                </CardTitle>
                                <p className="text-sm text-neutral-500 italic">No formal bio provided yet. Add your professional experience in settings.</p>
                            </Card>
                            <Card className="rounded-[2rem] border-neutral-100 shadow-sm border p-6">
                                <CardTitle className="text-base mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> Location
                                </CardTitle>
                                <p className="text-sm text-neutral-500">Not shared</p>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
