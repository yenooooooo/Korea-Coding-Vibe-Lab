import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop = ({ containerRef }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = containerRef?.current;

        const toggleVisibility = () => {
            const containerScrolled = container ? container.scrollTop > 50 : false;
            const windowScrolled = window.scrollY > 200;
            setIsVisible(containerScrolled || windowScrolled);
        };

        toggleVisibility();

        if (container) container.addEventListener('scroll', toggleVisibility);
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            if (container) container.removeEventListener('scroll', toggleVisibility);
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [containerRef]);

    const scrollToTop = () => {
        const container = containerRef?.current;
        if (container && container.scrollTop > 0) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (window.scrollY > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '40px',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(124, 58, 237, 0.9)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                        zIndex: 999,
                        backdropFilter: 'blur(8px)',
                    }}
                    whileHover={{
                        scale: 1.1,
                        backgroundColor: 'rgba(139, 92, 246, 1)',
                        boxShadow: '0 6px 16px rgba(124, 58, 237, 0.6)'
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowUp size={24} strokeWidth={2.5} />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
