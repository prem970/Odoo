import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated headline with staggered word fade-up and self-drawing underline
 * @param {Object} props
 * @param {string} props.text - Main headline text
 * @param {string} props.highlightText - Text to highlight with animated underline
 * @param {string} props.className - Additional classes
 */
const AnimatedHeadline = ({
    text = "The platform for",
    highlightText = "modern growth",
    className = ""
}) => {
    const words = text.split(' ');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1
            }
        }
    };

    const wordVariants = {
        hidden: {
            opacity: 0,
            y: 40,
            rotateX: -45
        },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100
            }
        }
    };

    const underlineVariants = {
        hidden: {
            scaleX: 0,
            originX: 0
        },
        visible: {
            scaleX: 1,
            transition: {
                delay: 0.8,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <motion.h1
            className={`text-5xl lg:text-7xl font-bold text-primary tracking-tight mb-8 perspective-container ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Regular words with stagger animation */}
            <span className="preserve-3d">
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        className="inline-block mr-[0.3em]"
                        variants={wordVariants}
                    >
                        {word}
                    </motion.span>
                ))}
            </span>

            <br className="hidden lg:block" />

            {/* Highlighted text with drawing underline */}
            <motion.span
                className="relative inline-block transform -rotate-1"
                variants={wordVariants}
            >
                <span className="text-primary">{highlightText}</span>

                {/* Animated sketch underline */}
                <motion.span
                    className="absolute bottom-0 left-0 w-full h-[8px] bg-accent-mustard/30 -z-10 rotate-1 origin-left"
                    variants={underlineVariants}
                />

                {/* Secondary decorative line */}
                <motion.span
                    className="absolute -bottom-1 left-[5%] w-[90%] h-[3px] bg-accent-mustard/50 -z-10 -rotate-1 origin-left"
                    variants={underlineVariants}
                    transition={{ delay: 1 }}
                />
            </motion.span>
        </motion.h1>
    );
};

export { AnimatedHeadline };
