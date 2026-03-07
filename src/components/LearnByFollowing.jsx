import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Copy, Check, Zap, BookOpen, Code, Lightbulb, Trophy } from 'lucide-react';

/**
 * LearnByFollowing 컴포넌트
 * 입문자를 위한 5분 단계별 가이드 튜토리얼
 * - 5가지 튜토리얼 제공
 * - 단계별 프롬프트 + 결과 시각화
 * - 진행도 트래킹
 */
const LearnByFollowing = () => {
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [copiedPrompt, setCopiedPrompt] = useState(null);
    const [completedTutorials, setCompletedTutorials] = useState(new Set());

    // 5가지 튜토리얼 데이터
    const tutorials = [
        {
            id: 'first_prompt',
            title: '첫 번째 프롬프트',
            emoji: '🌱',
            difficulty: '입문',
            duration: '3분',
            description: 'AI에게 처음 요청해보기',
            steps: [
                {
                    title: '프롬프트란?',
                    description: '프롬프트는 AI에게 주는 명령어입니다. 무엇을 만들고 싶은지 명확하게 설명하면 됩니다.',
                    prompt: '안녕, 나를 위해 간단한 인사말을 만들어줄 수 있을까?',
                    result: '물론이지! 항상 도움이 되어서 기쁩니다. 무엇을 만들고 싶은지 알려주면 제가 도와드릴게요!'
                },
                {
                    title: '명확한 설명이 중요',
                    description: '프롬프트가 상세할수록 더 좋은 결과를 얻습니다.',
                    prompt: 'React로 버튼을 클릭하면 색이 바뀌는 컴포넌트를 만들어줘',
                    result: 'function ColorButton() { const [color, setColor] = useState("blue"); return (<button onClick={() => setColor("red")}>색 변경</button>); }'
                },
                {
                    title: '첫 성공! 🎉',
                    description: '축하합니다! 이제 당신은 AI 개발자의 길을 시작했습니다.',
                    prompt: '',
                    result: '다음 단계로 나아갈 준비가 되셨나요?'
                }
            ]
        },
        {
            id: 'calculator',
            title: '계산기 만들기',
            emoji: '🧮',
            difficulty: '초급',
            duration: '5분',
            description: '덧셈, 뺄셈을 할 수 있는 계산기 앱 만들기',
            steps: [
                {
                    title: '요구사항 정의',
                    description: '먼저 무엇을 만들 건지 명확히 해야 합니다.',
                    prompt: '',
                    result: '✓ 두 개의 입력 필드\n✓ 덧셈/뺄셈 버튼\n✓ 결과 표시 영역\n✓ 예쁜 UI'
                },
                {
                    title: '프롬프트 작성',
                    description: '이제 AI에게 계산기를 만들어달라고 요청합니다.',
                    prompt: 'React로 두 개의 숫자를 입력받아서 덧셈과 뺄셈을 할 수 있는 계산기를 만들어줘. UI는 파란색과 보라색 그래디언트로 만들고 예쁘게 해줘.',
                    result: 'function Calculator() {\n  const [num1, setNum1] = useState("");\n  const [num2, setNum2] = useState("");\n  const [result, setResult] = useState(null);\n  ...'
                },
                {
                    title: '결과물 확인',
                    description: 'AI가 만든 코드를 복사해서 당신의 프로젝트에 붙여넣으면 됩니다!',
                    prompt: '',
                    result: '🎉 계산기가 완성되었습니다!\n당신은 코드를 한 줄도 작성하지 않았지만 멋진 앱을 만들었어요.'
                }
            ]
        },
        {
            id: 'todoapp',
            title: '할일 관리 앱',
            emoji: '✅',
            difficulty: '중급',
            duration: '7분',
            description: 'React 상태 관리로 할일을 추가/삭제하는 앱',
            steps: [
                {
                    title: '상태 관리 이해하기',
                    description: '할일 목록을 저장하려면 useState를 사용해야 합니다.',
                    prompt: '',
                    result: 'const [todos, setTodos] = useState([]); // 할일 목록 저장'
                },
                {
                    title: '기능 명시하기',
                    description: '사용자가 할 수 있는 모든 기능을 나열합니다.',
                    prompt: '',
                    result: '✓ 할일 추가\n✓ 할일 삭제\n✓ 할일 완료 표시\n✓ 남은 할일 개수 표시'
                },
                {
                    title: 'AI에게 요청',
                    description: '상세한 요구사항과 함께 AI에게 요청합니다.',
                    prompt: 'React로 할일 관리 앱을 만들어줘. 기능: 1) 입력창에서 할일 추가 2) 각 항목 옆에 삭제 버튼 3) 완료 체크박스 4) 남은 할일 개수 표시. 디자인은 깔끔하고 현대적으로.',
                    result: 'function TodoApp() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState("");\n  ...'
                },
                {
                    title: '완성! 🚀',
                    description: '축하합니다! 이제 상태 관리를 이해하는 개발자가 되었습니다.',
                    prompt: '',
                    result: '다음은 더 복잡한 프로젝트에 도전해볼 준비가 되셨나요?'
                }
            ]
        },
        {
            id: 'game',
            title: '게임 만들기',
            emoji: '🎮',
            difficulty: '고급',
            duration: '10분',
            description: '숫자 맞추기 게임 만들기',
            steps: [
                {
                    title: '게임 로직 설계',
                    description: '게임의 규칙과 흐름을 정의합니다.',
                    prompt: '',
                    result: '1. 1-100 사이의 랜덤 숫자 생성\n2. 사용자 입력받기\n3. 더 크다/작다 피드백\n4. 정답 시 축하 메시지'
                },
                {
                    title: '상태 관리 설계',
                    description: '게임 상태를 어떻게 저장할지 생각합니다.',
                    prompt: '',
                    result: 'const [target, setTarget] = useState();\nconst [guess, setGuess] = useState("");\nconst [attempts, setAttempts] = useState(0);'
                },
                {
                    title: 'AI에게 요청',
                    description: '복잡한 게임도 AI는 쉽게 만들 수 있습니다.',
                    prompt: 'React로 1-100 사이의 숫자를 맞추는 게임을 만들어줘. 기능: 1) 게임 시작하면 난수 생성 2) 사용자가 숫자 입력 3) "더 크다" "더 작다" 힌트 제공 4) 정답 시 시도 횟수 표시 5) 다시 플레이 버튼. 디자인은 재미있고 상호작용적으로.',
                    result: 'function GuessingGame() {\n  const [target, setTarget] = useState(Math.floor(Math.random() * 100) + 1);\n  ...'
                },
                {
                    title: '축하합니다! 🏆',
                    description: '당신은 이제 실제 게임 개발을 할 수 있는 능력을 가지고 있습니다.',
                    prompt: '',
                    result: '다음 단계: 더 복잡한 게임? 멀티플레이어? 데이터베이스? 모두 가능합니다!'
                }
            ]
        },
        {
            id: 'own_idea',
            title: '나만의 아이디어',
            emoji: '💡',
            difficulty: '전문가',
            duration: '자유로운 시간',
            description: '당신이 원하는 것을 자유롭게 만들기',
            steps: [
                {
                    title: '아이디어 결정',
                    description: '당신이 만들고 싶은 것을 생각해봅시다.',
                    prompt: '',
                    result: '예시:\n- 음악 플레이어\n- 영화 추천 앱\n- 일기장\n- 다이어트 추적기\n- 퀴즈 게임\n- SNS'
                },
                {
                    title: '요구사항 정의',
                    description: '당신의 앱에 필요한 기능들을 모두 나열합니다.',
                    prompt: '',
                    result: '예: 음악 플레이어라면\n✓ 음악 파일 업로드\n✓ 재생/일시정지\n✓ 볼륨 조절\n✓ 재생 목록\n✓ 현재 시간 표시'
                },
                {
                    title: '상세한 프롬프트 작성',
                    description: '당신의 아이디어를 구체적으로 AI에게 설명합니다.',
                    prompt: '당신이 만들고 싶은 앱에 대해 상세히 설명하고, 사용할 기술(React, CSS 등)을 명시하면 됩니다.',
                    result: '예: "React로 간단한 음악 플레이어를 만들어줘. 기능: 1) 음악 재생/일시정지 2) 재생 시간 표시 3) 볼륨 조절 4) 다음곡 버튼..."'
                },
                {
                    title: '당신의 창작물 공유',
                    description: '완성된 앱을 커뮤니티와 공유하고 피드백을 받으세요!',
                    prompt: '',
                    result: '🌟 당신의 멋진 작품을 갤러리에 올려보세요!\n다른 사람들의 응원이 당신의 동기가 될 것입니다.'
                }
            ]
        }
    ];

    const handleStartTutorial = (tutorialId) => {
        setSelectedTutorial(tutorialId);
        setCurrentStep(0);
    };

    const handleNextStep = () => {
        const tutorial = tutorials.find(t => t.id === selectedTutorial);
        if (currentStep < tutorial.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // 튜토리얼 완료
            setCompletedTutorials(new Set([...completedTutorials, selectedTutorial]));
            setSelectedTutorial(null);
            setCurrentStep(0);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const copyPrompt = (prompt) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    // 튜토리얼 선택 화면
    if (!selectedTutorial) {
        return (
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: '40px 20px'
            }}>
                {/* 헤더 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: '40px', textAlign: 'center' }}
                >
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: '0 0 12px 0'
                    }}>
                        💡 따라하기 튜토리얼
                    </h2>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '1rem',
                        margin: 0
                    }}>
                        단계별로 따라하며 AI와 함께 앱을 만들어보세요
                    </p>
                </motion.div>

                {/* 튜토리얼 카드 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                    gap: '20px'
                }}>
                    {tutorials.map((tutorial, idx) => (
                        <motion.div
                            key={tutorial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            whileHover={{ y: -8 }}
                            onClick={() => handleStartTutorial(tutorial.id)}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                padding: '24px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.3s',
                                position: 'relative'
                            }}
                        >
                            {/* 완료 배지 */}
                            {completedTutorials.has(tutorial.id) && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#22c55e'
                                }}>
                                    ✓ 완료
                                </div>
                            )}

                            <div style={{
                                fontSize: '2.5rem',
                                marginBottom: '16px'
                            }}>
                                {tutorial.emoji}
                            </div>

                            <h3 style={{
                                color: 'white',
                                fontSize: '1.3rem',
                                fontWeight: '700',
                                margin: '0 0 8px 0'
                            }}>
                                {tutorial.title}
                            </h3>

                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.95rem',
                                margin: '0 0 16px 0',
                                lineHeight: '1.5'
                            }}>
                                {tutorial.description}
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div>
                                    <span style={{
                                        display: 'inline-block',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: '#818cf8',
                                        marginRight: '8px'
                                    }}>
                                        {tutorial.difficulty}
                                    </span>
                                </div>
                                <div style={{
                                    color: '#94a3b8',
                                    fontSize: '0.85rem'
                                }}>
                                    ⏱️ {tutorial.duration}
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ x: 4 }}
                                style={{
                                    marginTop: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#818cf8',
                                    fontWeight: '600',
                                    gap: '6px'
                                }}
                            >
                                시작하기
                                <ArrowRight size={16} />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // 튜토리얼 진행 화면
    const tutorial = tutorials.find(t => t.id === selectedTutorial);
    const step = tutorial.steps[currentStep];
    const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ fontSize: '2rem' }}>
                        {tutorial.emoji}
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0
                        }}>
                            {tutorial.title}
                        </h2>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.9rem',
                            margin: '4px 0 0 0'
                        }}>
                            {currentStep + 1} / {tutorial.steps.length}
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTutorial(null)}
                    style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        color: '#818cf8',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}
                >
                    나가기
                </motion.button>
            </motion.div>

            {/* 진행도 바 */}
            <div style={{
                marginBottom: '32px'
            }}>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                            borderRadius: '4px'
                        }}
                    />
                </div>
            </div>

            {/* 단계 콘텐츠 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '20px',
                        padding: '40px',
                        backdropFilter: 'blur(20px)',
                        marginBottom: '32px'
                    }}
                >
                    {/* 단계 제목 */}
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        margin: '0 0 16px 0'
                    }}>
                        {step.title}
                    </h3>

                    {/* 단계 설명 */}
                    <p style={{
                        color: '#cbd5e1',
                        fontSize: '1rem',
                        margin: '0 0 32px 0',
                        lineHeight: '1.6'
                    }}>
                        {step.description}
                    </p>

                    {/* 프롬프트 (있는 경우) */}
                    {step.prompt && (
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                margin: '0 0 12px 0',
                                textTransform: 'uppercase',
                                fontWeight: '600'
                            }}>
                                📋 AI에게 이렇게 요청하세요
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start'
                            }}>
                                <p style={{
                                    color: '#e2e8f0',
                                    fontSize: '0.95rem',
                                    margin: 0,
                                    flex: 1,
                                    fontStyle: 'italic',
                                    lineHeight: '1.6'
                                }}>
                                    "{step.prompt}"
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => copyPrompt(step.prompt)}
                                    style={{
                                        background: copiedPrompt === step.prompt ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                        border: copiedPrompt === step.prompt ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: copiedPrompt === step.prompt ? '#22c55e' : '#818cf8',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {copiedPrompt === step.prompt ? (
                                        <>
                                            <Check size={16} />
                                            복사됨
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            복사
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* 결과 */}
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '12px',
                        padding: '20px'
                    }}>
                        <p style={{
                            color: '#22c55e',
                            fontSize: '0.85rem',
                            margin: '0 0 12px 0',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            ✨ 예상 결과
                        </p>
                        <p style={{
                            color: '#cbd5e1',
                            fontSize: '0.95rem',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            lineHeight: '1.6'
                        }}>
                            {step.result}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* 네비게이션 버튼 */}
            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'space-between'
            }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    style={{
                        padding: '12px 24px',
                        background: currentStep === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '10px',
                        color: '#818cf8',
                        cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: currentStep === 0 ? 0.5 : 1,
                        transition: 'all 0.3s'
                    }}
                >
                    <ArrowLeft size={18} />
                    이전
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextStep}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                        transition: 'all 0.3s'
                    }}
                >
                    {currentStep === tutorial.steps.length - 1 ? (
                        <>
                            <Trophy size={18} />
                            완료!
                        </>
                    ) : (
                        <>
                            다음
                            <ArrowRight size={18} />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default LearnByFollowing;
