import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const Typewriter = ({ words, wait = 3000, className }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor effect
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    useEffect(() => {
        if (subIndex === words[index].length + 1 && !reverse) {
            setReverse(true);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 50 : subIndex === words[index].length ? wait : 100, parseInt(Math.random() * 200)));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, wait]);

    return (
        <span className={className}>
            {words[index].substring(0, subIndex)}
            <motion.span
                animate={{ opacity: blink ? 1 : 0 }}
                transition={{ duration: 0.1 }}
                className="font-light text-primary ml-1"
            >
                |
            </motion.span>
        </span>
    );
};
