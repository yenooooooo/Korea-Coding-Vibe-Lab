import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const FeedbackButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '30px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                <div style={{ position: 'relative' }}>
                    <MessageCircle color="white" size={28} />

                    {/* Notification Dot (Optional Logic Needed) */}
                    {/* <div style={{
                        position: 'absolute', top: -2, right: -2,
                        width: '10px', height: '10px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid #1e293b'
                    }} /> */}
                </div>

                {/* Tooltip on Hover */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            style={{
                                position: 'absolute',
                                left: '70px',
                                background: 'rgba(15, 23, 42, 0.9)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                whitespace: 'nowrap',
                                pointerEvents: 'none',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            문의하기
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default FeedbackButton;
