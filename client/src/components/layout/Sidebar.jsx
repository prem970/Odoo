import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Box, BarChart3, Settings, Menu, X, LogOut, User, Archive, Video, BookOpen, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ className, isOpen, onClose }) => {
    const { user, logout } = useAuth();

    // Normalize role
    const role = (user?.role || '').toString().trim().toUpperCase();

    let navItems = [];

    if (role === 'ADMIN') {
        navItems = [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
            { label: 'Users', icon: Users, path: '/admin/users' },
            { label: 'My Profile', icon: User, path: '/user/profile' },
            { label: 'Settings', icon: Settings, path: '/settings' },
        ];
    } else if (role === 'INSTRUCTOR' || role === 'MENTOR' || role === 'TEACHER') {
        navItems = [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/instructor/dashboard' }, // Fixed path for instructor
            { label: 'Explore Courses', icon: Archive, path: '/courses/explore' },
            { label: 'Live Classes', icon: Video, path: '/live-classes' },
            { label: 'My Profile', icon: User, path: '/user/profile' },
            { label: 'Settings', icon: Settings, path: '/settings' },
        ];
    } else {
        // Learner / User / Default
        navItems = [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
            { label: 'Explore Courses', icon: Archive, path: '/courses/explore' },
            { label: 'Live Classes', icon: Video, path: '/live-classes' },
            { label: 'Upcoming Quizzes', icon: BookOpen, path: '/quizzes' },
            { label: 'Assignments', icon: FileText, path: '/assignments' },
            { label: 'My Profile', icon: User, path: '/user/profile' },
        ];
    }

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-neutral-50 border-r border-neutral-200 transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    className
                )}
            >
                <div className="flex h-16 items-center px-6 border-b border-neutral-200 gap-2 shrink-0">
                    <Logo className="h-8 w-8" />
                    <span className="text-2xl font-bold text-primary tracking-tight">LearnSphere</span>
                    <button className="ml-auto lg:hidden" onClick={onClose}>
                        <X className="h-6 w-6 text-neutral-500" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-neutral-600 hover:bg-primary/5 hover:text-primary"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "stroke-[2.5px]" : "stroke-2"
                                    )} />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 shrink-0 border-t border-neutral-200">
                    <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {getInitials(user?.full_name || user?.name)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-neutral-900">{user?.full_name || user?.name || 'Guest User'}</p>
                            <p className="text-xs text-neutral-500 truncate capitalize">{user?.role || 'Guest'}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export { Sidebar };
