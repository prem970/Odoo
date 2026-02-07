/**
 * Reporting Dashboard
 * Features: Metrics Cards (Total, Yet Start, In Progress, Completed).
 * Users Table: progress tracking with customizable columns side panel.
 */
import React from 'react';

const Reporting = () => {
    return (
        <div className="reporting-dashboard">
            <div className="overview-cards">
                {/* Metrics cards for filtering */}
            </div>
            <div className="table-container">
                {/* Progress table with 9 detailed columns */}
            </div>
            <div className="column-settings-panel">
                {/* Show/Hide column checkboxes */}
            </div>
        </div>
    );
};

export default Reporting;
