import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when an element enters the viewport
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Margin around root
 * @param {boolean} options.triggerOnce - Only trigger once
 * @returns {[React.RefObject, boolean]} [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);
    const hasTriggered = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (triggerOnce && hasTriggered.current) return;
                    setIsIntersecting(true);
                    hasTriggered.current = true;
                } else if (!triggerOnce) {
                    setIsIntersecting(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isIntersecting];
};

export default useIntersectionObserver;
