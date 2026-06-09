import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { Play, Pause } from 'lucide-react';

/**
 * Loop video component for hero section with fallback
 * @param {Object} props
 * @param {string} props.src - Video source URL
 * @param {string} props.fallbackImage - Fallback image for low bandwidth
 * @param {string} props.className - Additional classes
 */
const HeroVideo = ({
    src,
    fallbackImage,
    className = '',
    showControls = false
}) => {
    const videoRef = useRef(null);
    const [containerRef, isVisible] = useIntersectionObserver({ threshold: 0.3 });
    const [isPlaying, setIsPlaying] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Control playback based on visibility
    useEffect(() => {
        if (videoRef.current) {
            if (isVisible && isPlaying) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isVisible, isPlaying]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // If no video source, show animated placeholder
    if (!src || hasError) {
        return (
            <motion.div
                ref={containerRef}
                className={`relative rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200 shadow-2xl ${className}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                {/* Animated placeholder dashboard */}
                <div className="aspect-video bg-gradient-to-br from-white to-neutral-100 p-4 lg:p-6">
                    {/* Mock browser chrome */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="flex-1 h-6 bg-neutral-200 rounded-md ml-4" />
                    </div>

                    {/* Mock dashboard content */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="h-16 lg:h-20 rounded-lg bg-white shadow-sm border border-neutral-100 p-3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <div className="h-2 w-12 bg-neutral-200 rounded mb-2" />
                                <motion.div
                                    className="h-6 w-16 bg-primary/20 rounded"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Mock chart area */}
                    <div className="bg-white rounded-lg border border-neutral-100 p-4 shadow-sm">
                        <div className="h-2 w-24 bg-neutral-200 rounded mb-4" />
                        <div className="flex items-end gap-2 h-24">
                            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1 bg-primary/30 rounded-t"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.8 + i * 0.1,
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            className={`relative rounded-2xl overflow-hidden shadow-2xl group ${className}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
        >
            {/* Loading shimmer */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
            )}

            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
            >
                <source src={src} type="video/mp4" />
                <source src={src.replace('.mp4', '.webm')} type="video/webm" />
            </video>

            {/* Glass reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

            {/* Play/Pause button */}
            {showControls && (
                <button
                    onClick={togglePlay}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5 text-primary" />
                    ) : (
                        <Play className="h-5 w-5 text-primary" />
                    )}
                </button>
            )}

            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </motion.div>
    );
};

export { HeroVideo };
