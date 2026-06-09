import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile devices
 * @param {number} breakpoint - Width breakpoint for mobile (default 768px)
 * @returns {boolean} isMobile - Whether device is mobile
 */
export const useMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile, { passive: true });

        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
};

export default useMobile;
