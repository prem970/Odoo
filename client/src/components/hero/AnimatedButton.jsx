import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Enhanced CTA button with hover lift, glow shadow, and arrow animation
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional classes
 * @param {'primary' | 'secondary'} props.variant - Button variant
 * @param {'default' | 'lg'} props.size - Button size
 * @param {boolean} props.showArrow - Show animated arrow
 */
const AnimatedButton = React.forwardRef(({
    children,
    className = '',
    variant = 'primary',
    size = 'default',
    showArrow = false,
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden";

    const variants = {
        primary: "bg-primary text-white",
        secondary: "bg-white border-2 border-primary text-primary"
    };

    const sizes = {
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 text-lg"
    };

    return (
        <motion.button
            ref={ref}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            whileHover={{
                y: -4,
                boxShadow: variant === 'primary'
                    ? "0 20px 40px -10px rgba(113, 75, 103, 0.5)"
                    : "0 10px 30px -10px rgba(113, 75, 103, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
            }}
            {...props}
        >
            {/* Shimmer overlay on hover */}
            <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "linear" }}
            />

            {/* Button content */}
            <span className="relative z-10 flex items-center">
                {children}

                {/* Animated arrow */}
                {showArrow && (
                    <motion.svg
                        className="ml-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                    </motion.svg>
                )}
            </span>

            {/* Glow pulse effect for primary variant */}
            {variant === 'primary' && (
                <motion.span
                    className="absolute inset-0 rounded-xl"
                    animate={{
                        boxShadow: [
                            "0 0 0 0 rgba(113, 75, 103, 0)",
                            "0 0 0 8px rgba(113, 75, 103, 0.1)",
                            "0 0 0 0 rgba(113, 75, 103, 0)"
                        ]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                />
            )}
        </motion.button>
    );
});

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
