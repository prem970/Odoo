/**
 * Points & Completion Popup
 * Purpose: Feedback for quiz points and rank progress.
 */
import React from 'react';

const PointsPopup = ({ points, rankProgress }) => {
    return (
        <div className="points-popup">
            <h2>You have earned {points} points!</h2>
            {/* Progress bar to next rank */}
        </div>
    );
};

export default PointsPopup;
