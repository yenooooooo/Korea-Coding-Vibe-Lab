import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, RotateCcw } from 'lucide-react';

/**
 * InteractiveDemo 컴포넌트
 * 사용자가 AI와 상호작용하며 바이브 코딩의 흐름을 체험합니다
 * - 프롬프트 입력 (직접 입력 또는 템플릿)
 * - AI 시뮬레이션 (3초 로딩 애니메이션)
 * - 결과물 실행 (실제 동작하는 미니 앱)
 */
const InteractiveDemo = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentDemo, setCurrentDemo] = useState(null);
    const [demoOutputs, setDemoOutputs] = useState({});
    const inputRef = useRef(null);

    // 3가지 데모 예시
    const demos = {
        calculator: {
            name: '🧮 계산기',
            prompt: '숫자 두 개를 더해주는 계산기를 만들어줘',
            description: '간단한 더하기 계산기 앱',
            component: <CalculatorDemo />
        },
        todoapp: {
            name: '✅ 할일앱',
            prompt: '할일을 추가하고 삭제하는 앱을 만들어줘',
            description: '할일 목록 관리 앱',
            component: <TodoAppDemo />
        },
        guessing: {
            name: '🎮 숫자 맞추기',
            prompt: '1부터 100 사이의 숫자를 맞추는 게임을 만들어줘',
            description: '숫자 맞추기 게임',
            component: <GuessingGameDemo />
        }
    };

    const handleUseTemplate = (demoKey) => {
        setPrompt(demos[demoKey].prompt);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);

        // AI 시뮬레이션: 3초 대기
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 프롬프트 기반으로 데모 선택
        let selectedDemo = null;
        if (prompt.includes('계산') || prompt.includes('더') || prompt.includes('계산기')) {
            selectedDemo = 'calculator';
        } else if (prompt.includes('할일') || prompt.includes('todo') || prompt.includes('할 일')) {
            selectedDemo = 'todoapp';
        } else if (prompt.includes('숫자') || prompt.includes('게임') || prompt.includes('맞추')) {
            selectedDemo = 'guessing';
        } else {
            // 기본값: 랜덤 선택
            selectedDemo = Object.keys(demos)[Math.floor(Math.random() * Object.keys(demos).length)];
        }

        setCurrentDemo(selectedDemo);
        setDemoOutputs(prev => ({
            ...prev,
            [selectedDemo]: true
        }));
        setIsLoading(false);
    };

    const handleReset = () => {
        setPrompt('');
        setCurrentDemo(null);
        setDemoOutputs({});
        if (inputRef.current) inputRef.current.focus();
    };

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
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 12px 0'
                }}>
                    ✨ 바이브 코딩 직접 체험
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    프롬프트를 입력하고 AI가 만든 결과를 바로 확인해보세요!
                </p>
            </motion.div>

            {/* 프롬프트 입력 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                        padding: '12px',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="AI에게 만들어줄 걸 요청해보세요..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: '#e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none',
                                fontFamily: 'inherit',
                                placeholder: '#94a3b8'
                            }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            style={{
                                background: isLoading ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                padding: '12px 24px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: isLoading ? 0.6 : 1,
                                transition: 'all 0.3s'
                            }}
                        >
                            <Send size={16} />
                            {isLoading ? '생성 중...' : '요청'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            {/* 템플릿 예시 */}
            {!currentDemo && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ marginBottom: '32px' }}
                >
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        marginBottom: '16px'
                    }}>
                        💡 아래 예시를 사용해보세요:
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px'
                    }}>
                        {Object.entries(demos).map(([key, demo]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUseTemplate(key)}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s',
                                    textAlign: 'center'
                                }}
                            >
                                {demo.name}
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#94a3b8',
                                    fontWeight: '400',
                                    marginTop: '4px'
                                }}>
                                    {demo.description}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 로딩 상태 */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '20px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{ fontSize: '3rem', marginBottom: '20px' }}
                    >
                        ✨
                    </motion.div>
                    <h3 style={{
                        color: '#e2e8f0',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 12px 0'
                    }}>
                        AI가 코드를 생성하고 있어요...
                    </h3>
                    <p style={{
                        color: '#94a3b8',
                        margin: 0,
                        fontSize: '0.95rem'
                    }}>
                        보통 1-5분이 소요됩니다
                    </p>
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                            marginTop: '20px',
                            color: '#818cf8',
                            fontWeight: '600'
                        }}
                    >
                        💫 조금만 기다려주세요...
                    </motion.div>
                </motion.div>
            )}

            {/* 결과 출력 */}
            {currentDemo && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* 결과 헤더 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                        <div>
                            <p style={{
                                color: '#22c55e',
                                fontSize: '0.9rem',
                                margin: '0 0 4px 0',
                                fontWeight: '600'
                            }}>
                                ✅ 완성! 코드가 생성되었습니다
                            </p>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                margin: 0
                            }}>
                                당신이 요청한 "{prompt}"의 결과물입니다
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            style={{
                                background: 'rgba(99, 102, 241, 0.2)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '10px',
                                padding: '10px 16px',
                                color: '#818cf8',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <RotateCcw size={16} />
                            다시 시도
                        </motion.button>
                    </div>

                    {/* 데모 컴포넌트 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                            border: '2px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '20px',
                            padding: '40px',
                            backdropFilter: 'blur(20px)',
                            minHeight: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {demos[currentDemo].component}
                    </motion.div>

                    {/* 피드백 */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{
                            marginTop: '24px',
                            padding: '20px',
                            background: 'rgba(168, 85, 247, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{
                            color: '#e2e8f0',
                            fontSize: '0.95rem',
                            margin: 0,
                            lineHeight: '1.6'
                        }}>
                            🎉 <strong>이렇게 쉬워요!</strong> AI와 함께면 누구나 이런 앱을 만들 수 있습니다.<br />
                            지금 바로 <strong>바이브 코딩</strong>을 시작해보세요!
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

// ========== 미니 데모 컴포넌트들 ==========

/**
 * 계산기 데모
 */
const CalculatorDemo = () => {
    const [num1, setNum1] = React.useState('');
    const [num2, setNum2] = React.useState('');
    const [result, setResult] = React.useState(null);

    const handleCalculate = () => {
        const n1 = parseFloat(num1);
        const n2 = parseFloat(num2);
        if (!isNaN(n1) && !isNaN(n2)) {
            setResult(n1 + n2);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
            <h4 style={{
                color: '#e2e8f0',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                🧮 덧셈 계산기
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="number"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    placeholder="첫 번째 숫자"
                    style={{
                        padding: '12px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        textAlign: 'center'
                    }}
                />
                <input
                    type="number"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    placeholder="두 번째 숫자"
                    style={{
                        padding: '12px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        textAlign: 'center'
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCalculate}
                    style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                    }}
                >
                    계산하기
                </motion.button>
                {result !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            padding: '16px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            borderRadius: '8px',
                            border: '2px solid #22c55e',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 4px 0' }}>
                            결과
                        </p>
                        <p style={{ color: '#22c55e', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                            {result}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

/**
 * 할일앱 데모
 */
const TodoAppDemo = () => {
    const [todos, setTodos] = React.useState(['React 배우기', '프롬프트 작성하기', '결과 확인하기']);
    const [input, setInput] = React.useState('');

    const addTodo = () => {
        if (input.trim()) {
            setTodos([...todos, input]);
            setInput('');
        }
    };

    const removeTodo = (index) => {
        setTodos(todos.filter((_, i) => i !== index));
    };

    return (
        <div style={{ width: '100%', maxWidth: '350px' }}>
            <h4 style={{
                color: '#e2e8f0',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                ✅ 할일 관리
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="할일 추가..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTodo}
                    style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}
                >
                    추가
                </motion.button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todos.map((todo, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        whileHover={{ x: 4 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        <span style={{
                            color: '#e2e8f0',
                            fontSize: '0.95rem',
                            flex: 1
                        }}>
                            ✓ {todo}
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeTodo(index)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}
                        >
                            삭제
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

/**
 * 숫자 맞추기 게임 데모
 */
const GuessingGameDemo = () => {
    const [gameState, setGameState] = React.useState(() => {
        const target = Math.floor(Math.random() * 100) + 1;
        return { target, guess: '', attempts: 0, message: '' };
    });

    const handleGuess = () => {
        const guess = parseInt(gameState.guess);
        if (isNaN(guess)) {
            setGameState(prev => ({ ...prev, message: '숫자를 입력해주세요!' }));
            return;
        }

        const newAttempts = gameState.attempts + 1;
        let message = '';

        if (guess === gameState.target) {
            message = `🎉 정답! ${newAttempts}번 만에 맞혔어요!`;
        } else if (guess < gameState.target) {
            message = '📈 더 큰 숫자를 시도해보세요!';
        } else {
            message = '📉 더 작은 숫자를 시도해보세요!';
        }

        setGameState(prev => ({
            ...prev,
            attempts: newAttempts,
            message,
            guess: ''
        }));
    };

    const resetGame = () => {
        const target = Math.floor(Math.random() * 100) + 1;
        setGameState({ target, guess: '', attempts: 0, message: '' });
    };

    return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
            <h4 style={{
                color: '#e2e8f0',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                🎮 1-100 숫자 맞추기
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    margin: 0,
                    textAlign: 'center'
                }}>
                    숨겨진 숫자를 맞춰보세요!
                </p>
                <input
                    type="number"
                    min="1"
                    max="100"
                    value={gameState.guess}
                    onChange={(e) => setGameState(prev => ({ ...prev, guess: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                    placeholder="1-100 사이의 숫자"
                    style={{
                        padding: '12px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        textAlign: 'center'
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGuess}
                    disabled={gameState.message.includes('정답')}
                    style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: gameState.message.includes('정답') ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        opacity: gameState.message.includes('정답') ? 0.6 : 1
                    }}
                >
                    제출
                </motion.button>
                {gameState.message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            padding: '12px',
                            background: gameState.message.includes('정답')
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '8px',
                            border: gameState.message.includes('정답')
                                ? '2px solid #22c55e'
                                : '2px solid #3b82f6',
                            textAlign: 'center',
                            color: gameState.message.includes('정답') ? '#22c55e' : '#3b82f6',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}
                    >
                        {gameState.message}
                    </motion.div>
                )}
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    margin: 0,
                    textAlign: 'center'
                }}>
                    시도: {gameState.attempts}회
                </p>
                {gameState.message.includes('정답') && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        style={{
                            padding: '10px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            borderRadius: '8px',
                            color: '#22c55e',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        다시 플레이
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default InteractiveDemo;
