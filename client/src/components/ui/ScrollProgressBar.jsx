import React from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';

/**
 * Fixed scroll progress bar at top of viewport
 * Shows reading progress with a plum-colored bar
 */
const ScrollProgressBar = () => {
    const progress = useScrollProgress();

    return (
        <div
            className="scroll-progress-bar"
            style={{ transform: `scaleX(${progress})` }}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Page scroll progress"
        />
    );
};

export { ScrollProgressBar };
