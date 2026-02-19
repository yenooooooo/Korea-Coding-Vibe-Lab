import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Download, BookOpen, Users, FileText, CheckCircle } from 'lucide-react';

/**
 * StarterPack 컴포넌트
 * 바이브 코딩을 시작하기 위한 가이드와 자료
 * - 3단계 체크리스트
 * - 필요한 자료 안내
 * - 링크 모음
 */
const StarterPack = () => {
    const navigate = useNavigate();

    const handleStepAction = (action) => {
        switch(action) {
            case 'signup':
                navigate('/signup');
                break;
            case 'learn':
                navigate('/learn');
                break;
            case 'demo':
                navigate('/demo');
                break;
            default:
                break;
        }
    };

    const handleDownloadPDF = () => {
        // PDF 다운로드 로직 (실제 구현 시 PDF 파일 경로 필요)
        alert('스타터 팩 가이드 PDF를 준비 중입니다. 곧 다운로드 가능합니다!');
    };

    const steps = [
        {
            number: 1,
            title: '계정 생성',
            description: '바이브 코딩 커뮤니티에 가입하고 프로필을 만드세요',
            icon: '👤',
            action: '지금 가입하기',
            actionKey: 'signup',
            duration: '5분'
        },
        {
            number: 2,
            title: 'AI 도구 준비',
            description: 'ChatGPT, Claude 등의 AI 도구를 준비하세요. (선택사항)',
            icon: '🤖',
            action: '알아보기',
            actionKey: 'learn',
            duration: '10분'
        },
        {
            number: 3,
            title: '첫 프롬프트 작성',
            description: '간단한 프롬프트로 첫 번째 프로젝트를 시작하세요',
            icon: '✨',
            action: '시작하기',
            actionKey: 'demo',
            duration: '20분'
        }
    ];

    const resources = [
        {
            title: '입문자 가이드',
            description: '바이브 코딩의 기본 개념부터 시작',
            icon: '📖'
        },
        {
            title: '프롬프트 템플릿',
            description: '작성할 수 있는 프롬프트 예시 모음',
            icon: '📝'
        },
        {
            title: '커뮤니티 포럼',
            description: '다른 학습자들과 질문/답변 나누기',
            icon: '💬'
        },
        {
            title: 'FAQ',
            description: '자주 묻는 질문과 답변',
            icon: '❓'
        }
    ];

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 20px'
        }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '60px'
                }}
            >
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 12px 0'
                }}>
                    🚀 스타터 팩
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    바이브 코딩을 시작하기 위해 필요한 모든 것이 여기에 있습니다
                </p>
            </motion.div>

            {/* 3단계 체크리스트 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '60px'
                }}
            >
                {steps.map((step, idx) => (
                    <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                        whileHover={{ y: -8 }}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '16px',
                            padding: '28px',
                            backdropFilter: 'blur(20px)',
                            position: 'relative',
                            transition: 'all 0.3s'
                        }}
                    >
                        {/* 스텝 번호 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '16px'
                        }}>
                            {step.number}
                        </div>

                        {/* 아이콘 */}
                        <div style={{
                            fontSize: '2.5rem',
                            marginBottom: '12px'
                        }}>
                            {step.icon}
                        </div>

                        {/* 제목 */}
                        <h3 style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            margin: '0 0 12px 0'
                        }}>
                            {step.title}
                        </h3>

                        {/* 설명 */}
                        <p style={{
                            color: '#cbd5e1',
                            fontSize: '0.9rem',
                            margin: '0 0 20px 0',
                            lineHeight: '1.5'
                        }}>
                            {step.description}
                        </p>

                        {/* 소요 시간 */}
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.8rem',
                            margin: '0 0 16px 0'
                        }}>
                            ⏱️ 소요시간: {step.duration}
                        </p>

                        {/* 버튼 */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStepAction(step.actionKey)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(99, 102, 241, 0.2)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '10px',
                                color: '#818cf8',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {step.action}
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>

            {/* 필요한 자료 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{
                    marginBottom: '60px'
                }}
            >
                <h3 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: '0 0 24px 0',
                    textAlign: 'center'
                }}>
                    📚 필요한 자료
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                }}>
                    {resources.map((resource, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.6 + idx * 0.05 }}
                            whileHover={{ y: -4 }}
                            style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                marginBottom: '12px'
                            }}>
                                {resource.icon}
                            </div>
                            <h4 style={{
                                color: '#818cf8',
                                fontSize: '1rem',
                                fontWeight: '700',
                                margin: '0 0 8px 0'
                            }}>
                                {resource.title}
                            </h4>
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.85rem',
                                margin: 0
                            }}>
                                {resource.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* PDF 다운로드 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                style={{
                    background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.1))',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: '16px',
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                <h3 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    margin: '0 0 12px 0'
                }}>
                    📥 스타터 팩 완벽 가이드
                </h3>
                <p style={{
                    color: '#cbd5e1',
                    fontSize: '0.95rem',
                    margin: '0 0 24px 0',
                    lineHeight: '1.6'
                }}>
                    바이브 코딩 시작부터 첫 프로젝트 완성까지의 모든 과정을 담은 PDF 가이드입니다.<br />
                    오프라인에서도 언제 어디서나 볼 수 있습니다.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    style={{
                        padding: '14px 32px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                        transition: 'all 0.3s'
                    }}
                >
                    <Download size={20} />
                    스타터 팩 다운로드 (PDF)
                </motion.button>

                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    margin: '20px 0 0 0'
                }}>
                    약 15MB • 모든 기기에서 열람 가능
                </p>
            </motion.div>

            {/* 마지막 격려 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                style={{
                    textAlign: 'center',
                    marginTop: '60px',
                    paddingTop: '40px',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <p style={{
                    color: '#cbd5e1',
                    fontSize: '1rem',
                    margin: '0 0 12px 0',
                    lineHeight: '1.6'
                }}>
                    ✨ 위의 3단계를 완료하면 당신은 이미 바이브 코딩 커뮤니티의 일원입니다!<br />
                    더 이상 혼자가 아니에요. 함께 성장해요! 💪
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStepAction('demo')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <CheckCircle size={18} />
                    지금 바로 시작하기
                </motion.button>
            </motion.div>
        </div>
    );
};

export default StarterPack;
