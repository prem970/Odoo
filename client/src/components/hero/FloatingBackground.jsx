import React, { useRef, Suspense } from 'react';
import { useMobile } from '../../hooks/useMobile';

/**
 * Lightweight 3D Floating background for hero section
 * Uses native CSS animations instead of Three.js to prevent crashes
 */
const FloatingBackground = ({ className = '' }) => {
    const isMobile = useMobile();

    // Use simple CSS-based animated background that won't crash
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-sky/5" />

            {/* Animated floating shapes using CSS */}
            {!isMobile && (
                <>
                    {/* Floating card shapes */}
                    <div
                        className="absolute w-48 h-32 bg-white/30 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 animate-float"
                        style={{
                            left: '10%',
                            top: '20%',
                            animationDelay: '0s',
                            transform: 'rotate(-5deg)'
                        }}
                    />
                    <div
                        className="absolute w-40 h-28 bg-white/25 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 animate-float"
                        style={{
                            right: '15%',
                            top: '30%',
                            animationDelay: '1s',
                            transform: 'rotate(5deg)'
                        }}
                    />
                    <div
                        className="absolute w-36 h-24 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 animate-float"
                        style={{
                            left: '5%',
                            bottom: '25%',
                            animationDelay: '2s',
                            transform: 'rotate(3deg)'
                        }}
                    />

                    {/* Floating chart bars */}
                    <div
                        className="absolute flex items-end gap-2 animate-float"
                        style={{ left: '20%', bottom: '30%', animationDelay: '0.5s' }}
                    >
                        <div className="w-4 h-12 bg-blue-500/30 rounded-t" />
                        <div className="w-4 h-16 bg-teal-500/30 rounded-t" />
                        <div className="w-4 h-20 bg-primary/30 rounded-t" />
                        <div className="w-4 h-14 bg-yellow-500/30 rounded-t" />
                    </div>

                    {/* Floating circles */}
                    <div
                        className="absolute w-6 h-6 bg-yellow-400/40 rounded-full animate-float"
                        style={{ right: '25%', bottom: '20%', animationDelay: '1.5s' }}
                    />
                    <div
                        className="absolute w-4 h-4 bg-sky-400/40 rounded-full animate-float"
                        style={{ right: '30%', top: '25%', animationDelay: '2.5s' }}
                    />
                    <div
                        className="absolute w-8 h-8 bg-primary/30 rounded-full animate-float"
                        style={{ left: '35%', top: '15%', animationDelay: '0.8s' }}
                    />

                    {/* Progress ring (CSS version) */}
                    <div
                        className="absolute w-16 h-16 border-4 border-primary/20 rounded-full animate-float"
                        style={{
                            right: '10%',
                            top: '45%',
                            animationDelay: '1.2s',
                            borderRightColor: 'transparent',
                            transform: 'rotate(-45deg)'
                        }}
                    />
                </>
            )}
        </div>
    );
};

export { FloatingBackground };
