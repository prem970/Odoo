import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const themeColors = {
    crm: {
        primary: '#3B82F6', // Blue
        secondary: '#14B8A6' // Teal
    },
    inventory: {
        primary: '#F97316', // Orange
        secondary: '#EF4444' // Red
    },
    finance: {
        primary: '#8B5CF6', // Purple
        secondary: '#10B981' // Green
    },
    default: {
        primary: '#714B67', // Deep Plum
        secondary: '#E3B341' // Mustard
    }
};

/**
 * Custom animated bar that grows from bottom
 */
const AnimatedBar = (props) => {
    const { x, y, width, height, fill, isAnimating } = props;
    const [animatedHeight, setAnimatedHeight] = useState(0);
    const animationRef = useRef(null);

    useEffect(() => {
        if (isAnimating) {
            // Reset and start animation
            setAnimatedHeight(0);

            const startTime = performance.now();
            const duration = 800; // ms

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out cubic)
                const easeOut = 1 - Math.pow(1 - progress, 3);

                setAnimatedHeight(height * easeOut);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            animationRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        } else {
            setAnimatedHeight(height);
        }
    }, [height, isAnimating]);

    // Calculate y position based on animated height
    const animatedY = y + height - animatedHeight;

    return (
        <rect
            x={x}
            y={animatedY}
            width={width}
            height={animatedHeight}
            fill={fill}
            rx={4}
            ry={4}
        />
    );
};

const BarChartComponent = ({ title, data, dataKey, series, moduleName = 'default', className, animated = true }) => {
    const colors = themeColors[moduleName] || themeColors.default;
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isVisible && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isVisible, hasAnimated]);

    return (
        <Card className={className} ref={ref}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey={dataKey}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {series.map((item, index) => (
                                <Bar
                                    key={item.key}
                                    dataKey={item.key}
                                    name={item.name}
                                    fill={index === 0 ? colors.primary : colors.secondary}
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                    shape={animated ? (props) => (
                                        <AnimatedBar
                                            {...props}
                                            isAnimating={hasAnimated}
                                        />
                                    ) : undefined}
                                    animationDuration={animated && hasAnimated ? 800 : 0}
                                    animationEasing="ease-out"
                                >
                                    {data.map((entry, cellIndex) => (
                                        <Cell
                                            key={`cell-${cellIndex}`}
                                            style={{
                                                transition: 'opacity 0.3s ease',
                                                opacity: hasAnimated ? 1 : 0
                                            }}
                                        />
                                    ))}
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export { BarChartComponent };
