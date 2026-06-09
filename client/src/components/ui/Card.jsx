import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, variant = 'default', moduleColor, enhanced = false, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-neutral-200 bg-white text-neutral-950 shadow-sm transition-all duration-300",
                // Default hover
                !enhanced && "hover:shadow-md hover:-translate-y-1",
                // Enhanced hover with more lift and glow
                enhanced && "hover:shadow-xl hover:-translate-y-3 hover:border-primary/20",
                // Dashboard variant with top border
                variant === 'dashboard' && "border-t-4",
                variant === 'dashboard' && moduleColor === 'crm' && "border-t-module-crm hover:shadow-module-crm/20",
                variant === 'dashboard' && moduleColor === 'inventory' && "border-t-module-inventory hover:shadow-module-inventory/20",
                variant === 'dashboard' && moduleColor === 'finance' && "border-t-module-finance hover:shadow-module-finance/20",
                // Enhanced variant adds gradient overlay on hover
                enhanced && "relative overflow-hidden group",
                className
            )}
            {...props}
        >
            {/* Gradient overlay on hover for enhanced variant */}
            {enhanced && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            )}
            {props.children}
        </div>
    );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-2xl font-semibold leading-none tracking-tight text-primary", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-neutral-500", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
