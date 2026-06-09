import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Logo = ({ className = "h-10 w-10 text-primary" }) => {
    return (
        <div className={`flex items-center justify-center rounded-xl bg-primary/10 ${className}`}>
            <GraduationCap className="w-2/3 h-2/3" />
        </div>
    );
};
