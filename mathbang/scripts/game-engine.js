/**
 * MATH-BANG ASMR GAME ENGINE
 * React-based streamer simulation game
 */

const { useState, useEffect, useRef } = React;
const dbMB = window.globalDb;
const authMB = window.globalAuth;

const CUSTOM_AUDIO_URLS = { eatCrunch: '', eatSlurp: '', wrongBuzzer: '', pop: '', ding: '', bubble: '' };

const DrawPad = ({ problem, onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    useEffect(() => {
        const c = canvasRef.current;
        c.width = 800;
        c.height = 1000;
        const ctx = c.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#2d3436';
    }, []);
    
    const getPos = (e) => {
        const r = canvasRef.current.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (cx - r.left) * (800 / r.width), y: (cy - r.top) * (1000 / r.height) };
    };
    
    const startDraw = (e) => {
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        const p = getPos(e);
        ctx.moveTo(p.x, p.y);
    };
    
    const draw = (e) => {
        if(!isDrawing) return;
        e.preventDefault();
        const ctx = canvasRef.current.getContext('2d');
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };
    
    const endDraw = () => {
        setIsDrawing(false);
        canvasRef.current.getContext('2d').closePath();
    };
    
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col p-4 animate-[fadeIn_0.2s]">
            <div className="bg-white rounded-3xl flex-1 flex flex-col shadow-2xl overflow-hidden border-4 border-slate-200">
                <div className="bg-slate-200 p-4 flex justify-between items-center shadow-md z-10">
                    <div className="font-black text-xl text-slate-700">Solve: <span className="text-pink-600">{problem}</span></div>
                    <button onClick={onClose} className="text-2xl font-black text-slate-600">✕</button>
                </div>
                <canvas ref={canvasRef} onPointerDown={startDraw} onPointerMove={draw} onPointerUp={endDraw} onPointerLeave={endDraw} className="w-full h-full touch-none bg-[#fdfbf7]" style={{touchAction: 'none'}} />
            </div>
        </div>
    );
};

const CharacterSVG = ({ profile, isChewing, isMouthHovered, chewFrame, wrongFeedback }) => {
    const { base, hairColor, hairStyle, skin, shirt } = profile;
    const HAIR_COLORS = { black: { base: '#2d3436', front: '#1e272e' }, pink: { base: '#fd79a8', front: '#e84393' }, blonde: { base: '#f1c40f', front: '#d4ac0d' } };
    const colors = HAIR_COLORS[hairColor] || HAIR_COLORS.black;
    
    let sC = { shirt: shirt, hairBase: colors.base, hairFront: colors.front };
    if(skin==='school') sC.shirt='#0984e3';
    if(skin==='rocker') { sC.shirt='#2d3436'; sC.hairBase='#d63031'; sC.hairFront='#ff7675'; }
    if(skin==='cyber') sC.shirt='#2d3436';
    if(skin==='ninja') { sC.shirt='#f5cdb0'; }
    if(skin==='royal') sC.shirt='#c23616';
    
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="drop-shadow-xl overflow-visible">
            <path d="M 50 200 C 50 140, 150 140, 150 200 Z" fill={sC.shirt} />
            <circle cx="100" cy="110" r="55" fill={skin === 'ninja' ? '#f5cdb0' : '#ffe3d4'} />
            {wrongFeedback ? (
                <>
                    <path d="M 60 100 L 75 110 M 75 100 L 60 110" stroke="#2d3436" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 125 100 L 140 110 M 140 100 L 125 110" stroke="#2d3436" strokeWidth="4" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <circle cx="75" cy="105" r="5" fill="#2d3436" />
                    <circle cx="125" cy="105" r="5" fill="#2d3436" />
                </>
            )}
            <path d={isChewing && chewFrame === 1 ? "M 85 130 Q 100 140 115 130" : "M 85 130 Q 100 135 115 130"} stroke="#2d3436" strokeWidth="3" fill="none" />
        </svg>
    );
};

function MathBangApp() {
    const [gameState, setGameState] = useState('loading');
    const [view, setView] = useState('stream');
    const [showDraw, setShowDraw] = useState(false);
    const [playerProfile, setPlayerProfile] = useState({ name: '', base: 'boy', hairStyle: 'style1', hairColor: 'black', skin: 'default', shirt: '#a1c4fd' });
    const [likes, setLikes] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [unlockedSkins, setUnlockedSkins] = useState(['default']);
    const [mathSubject, setMathSubject] = useState('addition');
    const [problem, setProblem] = useState({ question: '', answer: '', options: [] });
    const [wrongFeedback, setWrongFeedback] = useState(false);
    const [isChewing, setIsChewing] = useState(false);
    const [chewFrame, setChewFrame] = useState(0);
    const [isMouthHovered, setIsMouthHovered] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

    const gameAreaRef = useRef(null);
    const audioCtxRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('mathbang_v4_save');
        if (saved) {
            const d = JSON.parse(saved);
            setPlayerProfile(d.playerProfile || { name: 'Streamer', base: 'boy', hairStyle: 'style1', hairColor: 'black', skin: 'default', shirt: '#a1c4fd' });
            setLikes(d.likes || 0);
            setCorrectAnswers(d.correctAnswers || 0);
            setUnlockedSkins(d.unlockedSkins || ['default']);
            setGameState('active');
        } else {
            setGameState('onboarding_char');
        }
    }, []);

    useEffect(() => {
        if (gameState === 'active') {
            localStorage.setItem('mathbang_v4_save', JSON.stringify({ playerProfile, likes, correctAnswers, unlockedSkins, gameState }));
        }
    }, [playerProfile, likes, correctAnswers, unlockedSkins, gameState]);

    useEffect(() => {
        if (gameState === 'active') {
            setProblem(generateMathProblem(mathSubject, correctAnswers));
        }
    }, [gameState, mathSubject, correctAnswers]);

    const playSound = (type) => {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        if (type === 'pop') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        } else if (type === 'ding') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        }
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    };

    const handlePointerDown = (e, index) => {
        if (isChewing || wrongFeedback) return;
        setDraggingIndex(index);
        updateDragPos(e);
    };

    const updateDragPos = (e) => {
        if (!gameAreaRef.current) return;
        const r = gameAreaRef.current.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
        setDragPos({ x, y });
    };

    const handlePointerUp = () => {
        if (draggingIndex === null) return;
        if (isMouthHovered) {
            if (problem.options[draggingIndex] === problem.answer) {
                setLikes(p => p + 10);
                playSound('pop');
                setIsChewing(true);
                let f = 0;
                const int = setInterval(() => {
                    setChewFrame(v => v === 0 ? 1 : 0);
                    f++;
                    if (f > 6) {
                        clearInterval(int);
                        setIsChewing(false);
                        setChewFrame(0);
                        setCorrectAnswers(pc => pc + 1);
                    }
                }, 150);
            } else {
                playSound('wrong');
                setLikes(p => Math.max(0, p - 5));
                setWrongFeedback(true);
                setTimeout(() => setWrongFeedback(false), 500);
            }
        }
        setDraggingIndex(null);
        setIsMouthHovered(false);
    };

    if (gameState === 'loading') return null;

    if (gameState === 'onboarding_char') {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4 font-sans">
                <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center border-8 border-pink-200">
                    <h1 className="text-3xl font-black text-pink-600 mb-4">Create Streamer</h1>
                    <input type="text" placeholder="Streamer Name" maxLength="12" value={playerProfile.name} onChange={e => setPlayerProfile({...playerProfile, name: e.target.value})} className="w-full bg-slate-200 border-2 border-slate-300 text-slate-900 rounded-lg p-2 mb-4 focus:outline-none" />
                    <button onClick={() => { setPlayerProfile({...playerProfile, base: 'boy'}); playSound('pop'); }} className="flex-1 py-3 rounded-2xl font-black border-b-4 bg-blue-400 text-white mb-2 w-full">👦 Boy</button>
                    <button onClick={() => { setPlayerProfile({...playerProfile, base: 'girl'}); playSound('pop'); }} className="flex-1 py-3 rounded-2xl font-black border-b-4 bg-pink-400 text-white mb-4 w-full">👧 Girl</button>
                    <button disabled={!playerProfile.name} onClick={() => { setGameState('onboarding_math'); playSound('ding'); }} className="w-full py-4 rounded-2xl font-black text-xl border-b-4 bg-yellow-400 text-yellow-900 disabled:bg-gray-400">START GAME 🎮</button>
                </div>
            </div>
        );
    }

    if (gameState === 'onboarding_math') {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4 font-sans">
                <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center border-8 border-blue-200">
                    <h1 className="text-3xl font-black text-blue-600 mb-2">Study Plan</h1>
                    <p className="text-slate-500 font-bold mb-6">What are we studying?</p>
                    <div className="flex flex-col gap-3 w-full mb-8">
                        {[{id:'addition',t:'➕ Addition'},{id:'subtraction',t:'➖ Subtraction'},{id:'multiplication',t:'✖️ Multiplication'},{id:'division',t:'➗ Division'},{id:'fractions',t:'🍕 Fractions'}].map(s => (
                            <button key={s.id} onClick={() => { setMathSubject(s.id); }} className="w-full py-3 rounded-2xl font-black bg-slate-200 text-slate-800">{s.t}</button>
                        ))}
                    </div>
                    <button onClick={() => { setGameState('active'); playSound('ding'); }} className="w-full py-4 rounded-2xl font-black text-xl border-b-4 bg-yellow-400 text-yellow-900">BEGIN ▶️</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex justify-center items-center font-sans select-none w-full h-[100dvh]">
            <div className="w-full max-w-md h-[100dvh] max-h-[850px] bg-white flex flex-col relative overflow-hidden shadow-2xl rounded-3xl">
                {view === 'stream' && (
                    <header className="bg-white/90 backdrop-blur-md p-3 shadow-sm z-40 flex flex-wrap justify-between items-center absolute top-0 w-full border-b border-slate-100">
                        <div className="flex gap-2">
                            <button onClick={() => window.location.href = '../index.html'} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-lg font-black">🏠</button>
                            <div className="bg-pink-100 text-pink-600 px-3 py-2 rounded-2xl font-black text-sm">❤️ {likes.toString().padStart(4, '0')}</div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => setShowDraw(true)} className="bg-slate-100 text-slate-600 px-2 py-2 rounded-xl text-lg">📝</button>
                            <button onClick={() => setView('mathSetup')} className="bg-blue-50 text-blue-700 px-2 py-2 rounded-xl text-lg">📚</button>
                            <button onClick={() => setView('wardrobe')} className="bg-pink-50 text-pink-700 px-2 py-2 rounded-xl text-lg">👗</button>
                        </div>
                    </header>
                )}

                {showDraw && <DrawPad problem={problem.question} onClose={() => setShowDraw(false)} />}

                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    {view === 'stream' && (
                        <div ref={gameAreaRef} className={`relative flex-1 bg-pink-50 w-full overflow-hidden flex flex-col items-center pt-24 ${wrongFeedback ? 'bg-red-100' : ''}`}>
                            <div className="absolute top-20 z-10 bg-white px-4 py-2 rounded-3xl shadow-lg border-4 border-pink-200 font-black text-base">
                                I want... <span className="text-pink-500">{problem.question}</span> = ?
                            </div>
                            
                            <div className="mt-8 mb-auto z-0 pointer-events-none relative w-full flex justify-center h-[50%]">
                                <CharacterSVG profile={playerProfile} isChewing={isChewing} chewFrame={chewFrame} isMouthHovered={isMouthHovered} wrongFeedback={wrongFeedback} />
                            </div>
                            
                            <div className="w-full h-[30%] bg-amber-100 rounded-t-[50px] flex justify-center items-center gap-2 px-2 pb-8 relative z-20">
                                {problem.options.map((opt, index) => (
                                    <div key={index} className="relative flex flex-col items-center w-1/3">
                                        <div onPointerDown={(e) => handlePointerDown(e, index)} onPointerMove={updateDragPos} onPointerUp={handlePointerUp} className="relative z-10 cursor-grab text-4xl" onMouseEnter={() => setIsMouthHovered(true)} onMouseLeave={() => setIsMouthHovered(false)}>
                                            {!isChewing && problem.options[index]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'mathSetup' && (
                        <div className="flex-1 bg-gradient-to-b from-blue-100 to-blue-50 flex flex-col items-center overflow-y-auto relative p-4">
                            <div className="sticky top-0 w-full p-4 bg-blue-200/90 z-30 flex justify-center gap-2 mb-4">
                                <button onClick={() => window.location.href = '../index.html'} className="bg-slate-800 text-white px-4 py-3 rounded-2xl font-black">🏠</button>
                                <button onClick={() => setView('stream')} className="bg-white text-blue-900 border-b-4 border-blue-300 px-8 py-3 rounded-2xl font-black">PLAY</button>
                            </div>
                            <h2 className="text-3xl font-black text-blue-800 mb-6">📚 Study Plan</h2>
                            <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-xs border-4 border-blue-100">
                                <h3 className="font-black text-slate-700 mb-4 text-center text-xl">Select Subject</h3>
                                <div className="flex flex-col gap-3">
                                    {[{id:'addition',t:'➕ Addition'},{id:'subtraction',t:'➖ Subtraction'},{id:'multiplication',t:'✖️ Multiplication'},{id:'division',t:'➗ Division'},{id:'fractions',t:'🍕 Fractions'}].map(s => (
                                        <button key={s.id} onClick={() => { setMathSubject(s.id); setView('stream'); }} className="w-full py-3 rounded-2xl font-black bg-slate-200 text-slate-800">{s.t}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'wardrobe' && (
                        <div className="flex-1 bg-gradient-to-b from-pink-200 to-pink-50 flex flex-col items-center overflow-y-auto relative pb-20 p-4">
                            <div className="sticky top-0 w-full p-4 bg-pink-200/90 z-30 flex justify-center gap-2 mb-4">
                                <button onClick={() => window.location.href = '../index.html'} className="bg-slate-800 text-white px-4 py-3 rounded-2xl font-black">🏠</button>
                                <button onClick={() => setView('stream')} className="bg-white text-pink-800 border-b-4 border-pink-300 px-8 py-3 rounded-2xl font-black">PLAY</button>
                            </div>
                            <h2 className="text-2xl font-black text-pink-800 mb-4">Premium Skins</h2>
                            <div className="w-full max-w-xs space-y-4">
                                {[{id:'default',n:'Casual',c:0},{id:'school',n:'School',c:100},{id:'rocker',n:'Rocker',c:200}].map(s => {
                                    const hS = unlockedSkins.includes(s.id);
                                    return (
                                        <div key={s.id} className={`bg-white p-4 rounded-3xl border-4 flex items-center gap-4 ${hS ? 'border-pink-400 bg-pink-50' : 'border-pink-100'}`}>
                                            <div className="flex-1"><div className="font-bold text-slate-800">{s.n}</div></div>
                                            {hS ? <button className="bg-pink-400 text-white font-bold px-3 py-2 rounded-xl text-sm">Equipped</button> : <button className="bg-slate-300 text-slate-600 font-bold px-3 py-2 rounded-xl text-sm cursor-not-allowed">Locked</button>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const rootMathBang = ReactDOM.createRoot(document.getElementById('mathbang-root'));
rootMathBang.render(<MathBangApp />);