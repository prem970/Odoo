import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

/**
 * Animated number counter that counts up when visible
 * @param {Object} props
 * @param {number} props.end - Target number
 * @param {number} props.duration - Animation duration in seconds
 * @param {string} props.prefix - Prefix text (e.g., '$')
 * @param {string} props.suffix - Suffix text (e.g., '%')
 * @param {string} props.className - Additional classes
 */
const CountUp = ({
    end,
    duration = 2,
    prefix = '',
    suffix = '',
    className = '',
    decimals = 0
}) => {
    const [count, setCount] = useState(0);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

    useEffect(() => {
        if (!isVisible) return;

        let startTime = null;
        const startValue = 0;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (end - startValue) * easeOut;

            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    const formattedCount = decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toLocaleString();

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        >
            {prefix}{formattedCount}{suffix}
        </motion.span>
    );
};

export { CountUp };
