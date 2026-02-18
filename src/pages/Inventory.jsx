import React from 'react';
import { motion } from 'framer-motion';

const Inventory = () => {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', paddingTop: '40px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '30px'
                }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>🎒 인벤토리 (Inventory)</h1>
                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
                        보유 중인 아이템과 자산을 관리하는 공간입니다.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    background: 'rgba(30, 41, 59, 0.3)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚧</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#cbd5e1' }}>준비 중인 페이지입니다</h2>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>
                            곧 멋진 인벤토리 시스템이 업데이트될 예정입니다!<br />
                            조금만 기다려주세요.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Inventory;
