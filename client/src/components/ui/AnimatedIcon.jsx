import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Animated icon wrapper with multiple animation variants
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {'pulse' | 'rotate' | 'rise' | 'bounce'} props.animation - Animation type
 * @param {string} props.className - Additional classes
 */
const AnimatedIcon = ({
    icon: Icon,
    animation = 'pulse',
    className = '',
    color,
    size = 28,
    ...props
}) => {
    const animations = {
        pulse: {
            animate: {
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
            },
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        rotate: {
            animate: {
                rotate: 360
            },
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "linear"
            }
        },
        rise: {
            initial: { y: 10, opacity: 0.5 },
            animate: {
                y: [10, 0, 10],
                opacity: [0.5, 1, 0.5]
            },
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        bounce: {
            animate: {
                y: [0, -5, 0]
            },
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const selectedAnimation = animations[animation] || animations.pulse;

    return (
        <motion.div
            className={cn("inline-flex", className)}
            {...selectedAnimation}
            {...props}
        >
            <Icon size={size} className={color} />
        </motion.div>
    );
};

export { AnimatedIcon };
