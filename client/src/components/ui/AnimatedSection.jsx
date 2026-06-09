import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

/**
 * Wrapper component that adds fade+slide reveal animation when section enters viewport
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.className - Additional classes
 * @param {'up' | 'left' | 'right' | 'scale'} props.animation - Animation type
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.duration - Animation duration in seconds
 */
const AnimatedSection = ({
    children,
    className = '',
    animation = 'up',
    delay = 0,
    duration = 0.6,
    threshold = 0.1,
    once = true
}) => {
    const [ref, isVisible] = useIntersectionObserver({
        threshold,
        triggerOnce: once
    });

    const variants = {
        up: {
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 }
        },
        left: {
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 }
        },
        right: {
            hidden: { opacity: 0, x: 50 },
            visible: { opacity: 1, x: 0 }
        },
        scale: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 }
        }
    };

    const selectedVariant = variants[animation] || variants.up;

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={selectedVariant}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

export { AnimatedSection };
