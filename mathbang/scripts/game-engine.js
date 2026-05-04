// ==========================================
// MATH-BANG REACT ENGINE (Fully Modular + Ghost Mode)
// ==========================================

const { useState, useEffect, useRef } = React;
const dbMB = window.globalDb;
const authMB = window.globalAuth;

// LINK TO THE LEGO BLOCKS
const ASSETS = window.MATHBANG_ASSETS;
const FOOD_DATABASE = window.MATHBANG_FOODS;
const SKINS = window.MATHBANG_SKINS;
const CHALLENGES = window.MATHBANG_CHALLENGES;
const MINIGAMES = window.MATHBANG_MINIGAMES;
const { HAIR_COLORS, SHIRT_COLORS } = window.MATHBANG_SETTINGS;
const MathEngine = window.MathEngine;

// --- GHOST OVERRIDE TOOLS (Teacher Only) ---
const GhostTools = ({ setLikes, isGhostMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!isGhostMode) return null;

    return (
        <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
            {isOpen && (
                <div className="bg-blue-900 border-2 border-blue-400 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 animate-[floatUp_0.3s_ease-out]">
                    <h4 className="text-white font-black text-[10px] text-center border-b border-blue-400 pb-2 mb-1">GHOST TOOLS</h4>
                    <button onClick={() => setLikes(prev => prev + 5000)} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] active:scale-95">+ 5K Likes</button>
                    <button onClick={() => setLikes(prev => prev + 50000)} className="bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] active:scale-95">+ 50K Likes</button>
                    <button onClick={() => { localStorage.removeItem('isTeacherTesting'); window.location.reload(); }} className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] active:scale-95">Disable Ghost</button>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 bg-blue-600 rounded-full shadow-lg border-2 border-white text-2xl flex items-center justify-center active:scale-90">
                {isOpen ? '❌' : '👻'}
            </button>
        </div>
    );
};

const DrawPad = ({ problem, onClose }) => {
    const canvasRef = useRef(null); const [isDrawing, setIsDrawing] = useState(false);
    useEffect(() => { const c = canvasRef.current; c.width = 800; c.height = 1000; const ctx = c.getContext('2d'); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#2d3436'; }, []);
    const getPos = (e) => { const r = canvasRef.current.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY; return { x: (cx - r.left) * (800 / r.width), y: (cy - r.top) * (1000 / r.height) }; };
    const startDraw = (e) => { setIsDrawing(true); const ctx = canvasRef.current.getContext('2d'); ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); };
    const draw = (e) => { if(!isDrawing) return; e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const endDraw = () => { setIsDrawing(false); canvasRef.current.getContext('2d').closePath(); };
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col p-4 animate-[fadeIn_0.2s]">
            <div className="bg-white rounded-3xl flex-1 flex flex-col shadow-2xl overflow-hidden border-4 border-slate-200">
                <div className="bg-slate-200 p-4 flex justify-between items-center shadow-md z-10"><div className="font-black text-xl text-slate-700">Solve: <span className="text-pink-600">{problem}</span></div><div className="flex gap-2"><button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,800,1000)} className="bg-white px-4 py-2 rounded-xl font-bold shadow-sm active:scale-95 text-slate-600">Clear</button><button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold shadow-sm active:scale-95">Close</button></div></div>
                <canvas ref={canvasRef} onPointerDown={startDraw} onPointerMove={draw} onPointerUp={endDraw} onPointerLeave={endDraw} className="w-full h-full touch-none bg-[#fdfbf7]" style={{backgroundImage: 'linear-gradient(#e5e7eb 2px, transparent 2px), linear-gradient(90deg, #e5e7eb 2px, transparent 2px)', backgroundSize: '2rem 2rem'}}></canvas>
            </div>
        </div>
    );
};

const CharacterSVG = ({ profile, isChewing, isMouthHovered, chewFrame, wrongFeedback }) => {
    const { base, hairColor, hairStyle, skin, shirt } = profile; 
    const baseColors = HAIR_COLORS[hairColor] || HAIR_COLORS.black;
    let styleObj = { shirt: shirt, hairBase: baseColors.base, hairFront: baseColors.front, skinTone: '#ffe3d4' };
    const skinConfig = SKINS.find(s => s.id === skin) || SKINS[0];
    styleObj = skinConfig.applyOverrides(styleObj);
    
    const rH = () => { if(base==='boy'){ if(hairStyle==='style1') return <path d="M 40 110 A 60 60 0 0 1 160 110 Z" fill={styleObj.hairBase} />; if(hairStyle==='style2') return <path d="M 35 110 L 45 35 L 70 50 L 100 15 L 130 50 L 155 35 L 165 110 Z" strokeLinejoin="round" fill={styleObj.hairBase} />; if(hairStyle==='style3') return <path d="M 35 110 A 65 65 0 0 1 165 110 Z" fill={styleObj.hairBase} />; } else { if(hairStyle==='style1') return <path d="M 40 110 A 60 60 0 0 1 160 110 L 165 200 L 135 200 L 135 130 L 65 130 L 65 200 L 35 200 Z" fill={styleObj.hairBase} />; if(hairStyle==='style2') return <><path d="M 40 110 A 60 60 0 0 1 160 110 Z" fill={styleObj.hairBase} /><circle cx="30" cy="130" r="20" fill={styleObj.hairBase}/><circle cx="170" cy="130" r="20" fill={styleObj.hairBase}/></>; if(hairStyle==='style3') return <path d="M 35 110 A 65 65 0 0 1 165 110 L 165 150 C 165 170, 35 170, 35 150 Z" fill={styleObj.hairBase} />; } };
    const rB = () => { if(base==='boy'){ if(hairStyle==='style1') return <path d="M 40 110 A 60 60 0 0 1 160 110 Q 130 90 100 95 Q 70 90 40 110 Z" fill={styleObj.hairFront} />; if(hairStyle==='style2') return <path d="M 40 110 A 60 60 0 0 1 160 110 L 140 85 L 120 100 L 100 70 L 80 100 L 60 85 Z" fill={styleObj.hairFront} />; if(hairStyle==='style3') return <path d="M 35 110 A 65 65 0 0 1 165 110 Q 130 70 100 100 Q 70 70 35 110 Z" fill={styleObj.hairFront} />; } else { if(hairStyle==='style1') return <path d="M 40 110 A 60 60 0 0 1 160 110 L 160 95 Q 100 85 40 95 Z" fill={styleObj.hairFront} />; if(hairStyle==='style2') return <path d="M 40 110 A 60 60 0 0 1 160 110 L 160 90 Q 100 100 40 80 Z" fill={styleObj.hairFront} />; if(hairStyle==='style3') return <path d="M 35 110 A 65 65 0 0 1 165 110 Q 130 100 100 80 Q 70 100 35 110 Z" fill={styleObj.hairFront} />; } };
    
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="drop-shadow-xl overflow-visible">
            {rH()} {skinConfig.renderBack()}
            <path d="M 50 200 C 50 140, 150 140, 150 200 Z" fill={styleObj.shirt} />
            <circle cx="100" cy="110" r="55" fill={styleObj.skinTone} />
            {wrongFeedback ? (<><path d="M 60 100 L 75 110 M 75 100 L 60 110" stroke="#2d3436" strokeWidth="4" strokeLinecap="round" /><path d="M 125 100 L 140 110 M 140 100 L 125 110" stroke="#2d3436" strokeWidth="4" strokeLinecap="round" /><path d="M 90 145 C 100 135, 110 145, 110 145" stroke="#2d3436" strokeWidth="3" fill="none" /></>) : isChewing ? (<><ellipse cx="65" cy="125" rx="12" ry="7" fill="#ff7675" opacity="0.8" /><ellipse cx="135" cy="125" rx="12" ry="7" fill="#ff7675" opacity="0.8" /><path d="M 55 105 C 65 95, 75 105, 75 105" stroke="#2d3436" strokeWidth="4" fill="none" strokeLinecap="round" /><path d="M 125 105 C 135 95, 145 105, 145 105" stroke="#2d3436" strokeWidth="4" fill="none" strokeLinecap="round" />{!skinConfig.hideNormalMouth && (chewFrame === 0 ? <ellipse cx="100" cy="135" rx="8" ry="5" fill="#2d3436" /> : <ellipse cx="100" cy="135" rx="14" ry="7" fill="#2d3436" />)}</>) : isMouthHovered ? (<><circle cx="65" cy="105" r="7" fill="#2d3436" /><circle cx="135" cy="105" r="7" fill="#2d3436" />{!skinConfig.hideNormalMouth && <path d="M 85 130 C 100 160, 115 130, 85 130 Z" fill="#ff7675" stroke="#2d3436" strokeWidth="3" strokeLinejoin="round" />}</>) : (<>{!skinConfig.hideNormalMouth && <ellipse cx="65" cy="120" rx="8" ry="5" fill="#ffb6c1" opacity="0.6" />}{!skinConfig.hideNormalMouth && <ellipse cx="135" cy="120" rx="8" ry="5" fill="#ffb6c1" opacity="0.6" />}<circle cx="65" cy="105" r="6" fill="#2d3436" /><circle cx="135" cy="105" r="6" fill="#2d3436" /><circle cx="67" cy="102" r="2" fill="#fff" /><circle cx="137" cy="102" r="2" fill="#fff" />{!skinConfig.hideNormalMouth && <path d="M 90 135 C 100 145, 110 135, 110 135" stroke="#2d3436" strokeWidth="3" fill="none" strokeLinecap="round" />}</>)}
            {rB()} {skinConfig.renderFront()}
        </svg>
    );
};

function MathBangApp() {
    const [gameState, setGameState] = useState('loading'); 
    const [view, setView] = useState('stream'); 
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [showDraw, setShowDraw] = useState(false);
    const [playerProfile, setPlayerProfile] = useState({ name: '', base: 'boy', hairStyle: 'style1', hairColor: 'black', skin: 'default', shirt: '#a1c4fd' });
    const [likes, setLikes] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [unlockedSkins, setUnlockedSkins] = useState(['default']);
    const [unlockedFoods, setUnlockedFoods] = useState(['cracker']);
    const [currentFoodId, setCurrentFoodId] = useState('cracker');
    const [stats, setStats] = useState({ ramenEaten: 0, tanghuluEaten: 0, kakigoriEaten: 0 });
    
    const [mathSubject, setMathSubject] = useState('addition');
    const [problem, setProblem] = useState({ question: '', answer: '', options: [] });
    const [wrongFeedback, setWrongFeedback] = useState(false);
    const [shopChallenge, setShopChallenge] = useState({ active: false, food: null, problem: null });
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentBitesLeft, setCurrentBitesLeft] = useState(1);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const [isMouthHovered, setIsMouthHovered] = useState(false);
    const [isChewing, setIsChewing] = useState(false);
    const [chewFrame, setChewFrame] = useState(0);
    const [particles, setParticles] = useState([]);
    const [shopNotif, setShopNotif] = useState(false);
    const [lastAffordableCount, setLastAffordableCount] = useState(0);
    const [customData, setCustomData] = useState({ color: '#ff4d6d', fruits: [] });

    const gameAreaRef = useRef(null); const audioCtxRef = useRef(null);
    const currentFood = FOOD_DATABASE.find(f => f.id === currentFoodId) || FOOD_DATABASE[0];
    const mathLevel = Math.min(3, Math.floor(correctAnswers / 10) + 1);

    // 1. Initial Load & Ghost Check
    useEffect(() => {
        const checkGhost = localStorage.getItem('isTeacherTesting') === 'true';
        setIsGhostMode(checkGhost);

        if (checkGhost) {
            setLikes(10000); 
            setGameState('active');
            return;
        }

        const saved = localStorage.getItem('mathbang_v7_save');
        if (saved) {
            const d = JSON.parse(saved);
            setPlayerProfile(d.playerProfile);
            setLikes(d.likes); setCorrectAnswers(d.correctAnswers);
            setUnlockedSkins(d.unlockedSkins); setUnlockedFoods(d.unlockedFoods);
            setCurrentFoodId(d.currentFoodId); setCurrentBitesLeft(d.currentBitesLeft);
            setStats(d.stats);
            setGameState('active');
        } else setGameState('onboarding_char');
    }, []);

    // 2. Save Logic (Blocked if Ghost Mode)
    useEffect(() => {
        if (gameState === 'active' && !isGhostMode) {
            localStorage.setItem('mathbang_v7_save', JSON.stringify({ playerProfile, likes, correctAnswers, unlockedSkins, unlockedFoods, currentFoodId, currentBitesLeft, stats }));
        }
    }, [playerProfile, likes, correctAnswers, unlockedSkins, unlockedFoods, currentFoodId, currentBitesLeft, stats, gameState]);

    const syncToCloud = async () => {
        if(!playerProfile.name || isGhostMode) return;
        try {
            await dbMB.collection("mukbang_leaderboard").doc(authMB.currentUser?.uid || playerProfile.name).set({ name: playerProfile.name, likes: likes, foodEmoji: currentFood.emoji, skin: playerProfile.skin, profile: playerProfile, date: new Date().toISOString() }, { merge: true });
            const snapshot = await dbMB.collection("mukbang_leaderboard").get();
            const allScores = snapshot.docs.map(d => d.data());
            allScores.sort((a,b) => b.likes - a.likes);
            setLeaderboard(allScores.slice(0, 10));
        } catch(e) {}
    };

    const playSound = (type) => {
        let customUrl = ASSETS[type] || '';
        if(type==='eat' && (currentFoodId==='custom_ramen'||currentFoodId==='noodles')) customUrl = ASSETS.eatSlurp;
        else if(type==='eat') customUrl = ASSETS.eatCrunch;
        if (customUrl) { new Audio(customUrl).play().catch(e=>{}); return; }
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioCtxRef.current; if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        if (type === 'eat') {
            if (currentFoodId === 'custom_ramen' || currentFoodId === 'noodles') { osc.type='triangle'; osc.frequency.setValueAtTime(600,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(150,ctx.currentTime+0.3); gain.gain.setValueAtTime(0.5,ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01,ctx.currentTime+0.3); }
            else { const n = ctx.createBufferSource(); const b = ctx.createBuffer(1, ctx.sampleRate*0.15, ctx.sampleRate); const d = b.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; n.buffer=b; const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1000; gain.gain.setValueAtTime(0.5,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.15); n.connect(f); f.connect(gain); gain.connect(ctx.destination); n.start(); return; }
        } else if(type==='wrong') { osc.type='sawtooth'; osc.frequency.setValueAtTime(150,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(80,ctx.currentTime+0.3); gain.gain.setValueAtTime(0.3,ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01,ctx.currentTime+0.3); }
        else if(type==='pop') { osc.type='square'; osc.frequency.setValueAtTime(800,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+0.1); gain.gain.setValueAtTime(0.1,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.1); }
        else if(type==='ding') { osc.type='sine'; osc.frequency.setValueAtTime(800,ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200,ctx.currentTime+0.1); gain.gain.setValueAtTime(0.2,ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01,ctx.currentTime+0.3); }
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.3);
    };

    useEffect(() => { if (gameState === 'active') setProblem(MathEngine.generate(mathSubject, correctAnswers)); }, [gameState, mathSubject, correctAnswers]);

    const handlePointerDown = (e, index) => { if(isChewing||wrongFeedback) return; setDraggingIndex(index); updateDragPos(e); };
    const updateDragPos = (e) => { if(!gameAreaRef.current)return; const r=gameAreaRef.current.getBoundingClientRect(); const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; setDragPos({x,y}); setIsMouthHovered(y>r.height*0.3&&y<r.height*0.55&&x>r.width/2-80&&x<r.width/2+80); };
    
    const handlePointerUp = () => {
        if(draggingIndex === null) return;
        if(isMouthHovered) {
            if(problem.options[draggingIndex] === problem.answer) {
                setLikes(p => p + currentFood.power); playSound('eat'); setIsChewing(true);
                let f = 0; const int = setInterval(() => {
                    setChewFrame(v=>v===0?1:0); f++;
                    if (f > 6) { 
                        clearInterval(int); setIsChewing(false); setChewFrame(0); 
                        setCurrentBitesLeft(prev => {
                            const nb = prev - 1;
                            if(nb <= 0) {
                                if(currentFood.consumable) {
                                    setStats(s => { let ns = {...s}; if(currentFood.id==='custom_ramen') ns.ramenEaten++; if(currentFood.id==='custom_tanghulu') ns.tanghuluEaten++; if(currentFood.id==='custom_kakigori') ns.kakigoriEaten++; return ns; });
                                    setCurrentFoodId('cracker'); return 1;
                                } return currentFood.bites;
                            } return nb;
                        }); setCorrectAnswers(pc => pc + 1); 
                    }
                }, 150);
                setParticles(p => [...p, { id: Date.now(), text: `+${currentFood.power}❤️` }]);
            } else {
                playSound('wrong'); setLikes(p => Math.max(0, p - currentFood.power)); setWrongFeedback(true);
                setTimeout(()=>setWrongFeedback(false), 500); setParticles(p => [...p, { id: Date.now(), text: `-${currentFood.power}💔` }]);
            }
        }
        setDraggingIndex(null); setIsMouthHovered(false);
    };

    const triggerBuyChallenge = (food) => { playSound('ding'); setShopChallenge({ active: true, food: food, problem: MathEngine.generate(mathSubject, correctAnswers, Math.min(3, mathLevel + 1)) }); };
    const handleChallengeAnswer = (answer) => {
        if(answer === shopChallenge.problem.answer) {
            playSound('eat'); setLikes(l=>l-shopChallenge.food.cost); setUnlockedFoods(p=>!p.includes(shopChallenge.food.id)?[...p,shopChallenge.food.id]:p);
            setCurrentFoodId(shopChallenge.food.id); setCurrentBitesLeft(shopChallenge.food.bites);
            setShopChallenge({active:false, food:null, problem:null}); setView('stream'); setParticles(p => [...p, { id: Date.now()+1, text: `🎉 UNLOCKED!` }]);
        } else { playSound('wrong'); setShopChallenge({active:false, food:null, problem:null}); alert("Wrong answer! Try again!"); }
    };

    useEffect(() => {
        const getFoodUnlockStatus = (f) => {
            if(!f.isSecret) return true;
            const chal = CHALLENGES.find(c => c.unlocksFoodId === f.id);
            if (chal && stats[chal.reqType] >= chal.reqCount) return true;
            return false;
        };
        const aF = FOOD_DATABASE.filter(f => f.cost>0 && likes>=f.cost && !unlockedFoods.includes(f.id) && getFoodUnlockStatus(f)).length;
        const aS = SKINS.filter(s => s.cost>0 && likes>=s.cost && !unlockedSkins.includes(s.id)).length;
        if(aF+aS > lastAffordableCount && view!=='shop' && view!=='wardrobe') { setShopNotif(true); playSound('ding'); }
        setLastAffordableCount(aF+aS);
    }, [likes, unlockedSkins, unlockedFoods, view, stats]);

    const renderFoodGraphic = (inDragMode, optText='full') => {
        const bScale = Math.max(0.5, currentBitesLeft / currentFood.bites); const iDS = inDragMode ? 1.3 : bScale * 0.8; 
        if (mathSubject === 'fractions') {
            const count = parseInt(optText)||0; const items=[]; for(let i=0;i<Math.min(count,12);i++) items.push(<div key={i} className="text-2xl drop-shadow-md">{currentFood.emoji}</div>);
            return <div style={{transform:`scale(${iDS})`}} className="flex flex-wrap justify-center gap-1 w-20 max-h-24 overflow-hidden pointer-events-none">{items}{count>12&&<span className="text-lg font-black text-white bg-slate-800 rounded-full px-2 mt-1">+{count-12}</span>}</div>;
        }
        if (currentFood.renderFood) { return <div style={{transform:`scale(${iDS})`, transition:'transform 0.2s'}}>{currentFood.renderFood(currentBitesLeft, customData)}</div>; }
        return <div style={{transform:`scale(${iDS})`, transition:'transform 0.2s'}}><div className="text-6xl drop-shadow-xl">{currentFood.emoji}</div></div>;
    };

    const ActiveMinigame = MINIGAMES.find(m => m.id === view);

    if (gameState === 'loading') return null;
    if (gameState === 'onboarding_char') {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4 font-sans">
                <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center border-8 border-pink-200 animate-[fadeIn_0.5s] overflow-y-auto max-h-[90dvh] custom-scrollbar">
                    <h1 className="text-3xl font-black text-pink-600 mb-4 text-center">Create Streamer</h1>
                    <div className="w-full bg-slate-100 rounded-3xl p-4 flex flex-col items-center mb-6 border-4 border-slate-200 shadow-inner"><span className="text-slate-400 font-bold mb-2 tracking-widest text-sm">LIVE PREVIEW</span><div className="w-48 h-48 bg-white border-4 border-slate-300 rounded-full overflow-hidden flex justify-center items-center shadow-md relative"><div className="w-[150%] h-[150%] relative top-10"><CharacterSVG profile={playerProfile} isChewing={false} chewFrame={0} isMouthHovered={false} wrongFeedback={false} /></div></div></div>
                    <input type="text" placeholder="Streamer Name" maxLength="12" value={playerProfile.name} onChange={e=>setPlayerProfile({...playerProfile, name:e.target.value})} className="w-full bg-white border-4 border-slate-200 rounded-xl p-4 text-center font-bold text-xl mb-4 focus:border-pink-400 outline-none shadow-sm" />
                    <div className="flex w-full gap-2 mb-4">
                        <button onClick={()=>{setPlayerProfile({...playerProfile,base:'boy'});playSound('pop');}} className={`flex-1 py-3 rounded-2xl font-black border-b-4 transition-transform ${playerProfile.base==='boy'?'bg-blue-400 text-white border-blue-500':'bg-slate-100 text-slate-400 border-slate-200'}`}>👦 BOY</button>
                        <button onClick={()=>{setPlayerProfile({...playerProfile,base:'girl'});playSound('pop');}} className={`flex-1 py-3 rounded-2xl font-black border-b-4 transition-transform ${playerProfile.base==='girl'?'bg-pink-400 text-white border-pink-500':'bg-slate-100 text-slate-400 border-slate-200'}`}>👧 GIRL</button>
                    </div>
                    <div className="w-full mb-4"><h3 className="font-bold text-slate-600 mb-2 text-center text-sm">Hairstyle</h3><div className="flex gap-2">{['style1','style2','style3'].map(s=><button key={s} onClick={()=>{setPlayerProfile({...playerProfile,hairStyle:s});playSound('pop');}} className={`flex-1 py-2 rounded-xl font-bold text-xs border-2 transition-colors ${playerProfile.hairStyle===s?'bg-pink-100 border-pink-400 text-pink-700':'bg-white border-slate-200 text-slate-500'}`}>{s.replace('style','Hair ')}</button>)}</div></div>
                    <div className="w-full mb-6"><h3 className="font-bold text-slate-600 mb-2 text-center text-sm">Hair Color</h3><div className="flex justify-center gap-3">{Object.keys(HAIR_COLORS).map(c=><button key={c} onClick={()=>{setPlayerProfile({...playerProfile,hairColor:c});playSound('pop');}} className={`w-12 h-12 rounded-full shadow-md border-4 transition-transform ${playerProfile.hairColor===c?'border-pink-400 scale-110':'border-white hover:scale-105'}`} style={{backgroundColor:HAIR_COLORS[c].base}}></button>)}</div></div>
                    <button disabled={!playerProfile.name} onClick={()=>{setGameState('onboarding_math');playSound('ding');}} className={`w-full py-4 rounded-2xl font-black text-xl border-b-4 transition-transform ${playerProfile.name?'bg-yellow-400 text-yellow-900 border-yellow-500 active:translate-y-1':'bg-slate-200 text-slate-400 border-slate-300'}`}>NEXT ➡️</button>
                </div>
            </div>
        );
    }
    if (gameState === 'onboarding_math') {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4 font-sans">
                <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center border-8 border-blue-200 animate-[fadeIn_0.5s]">
                    <h1 className="text-3xl font-black text-blue-600 mb-2 text-center">Study Plan</h1>
                    <p className="text-slate-500 font-bold mb-6 text-center">What are we studying today?</p>
                    <div className="flex flex-col gap-3 w-full mb-8">{[{id:'addition',t:'➕ Addition'},{id:'subtraction',t:'➖ Subtraction'},{id:'multiplication',t:'✖️ Multiplication'},{id:'division',t:'➗ Division'},{id:'fractions',t:'🍕 Fractions'}].map(s=><button key={s.id} onClick={()=>{setMathSubject(s.id);playSound('pop');}} className={`px-4 py-3 rounded-xl font-bold text-lg transition-transform ${mathSubject===s.id?'bg-blue-500 text-white shadow-inner scale-105':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s.t}</button>)}</div>
                    <button onClick={()=>{setGameState('active');playSound('ding');}} className="w-full py-4 rounded-2xl font-black text-xl border-b-4 bg-yellow-400 text-yellow-900 border-yellow-500 active:translate-y-1">START STREAM! 🎥</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex justify-center items-center font-sans select-none relative w-full h-[100dvh]">
            <div className="w-full max-w-md h-[100dvh] max-h-[850px] bg-white flex flex-col relative overflow-hidden shadow-2xl sm:rounded-3xl">
                
                {/* BLUE BANNER */}
                {isGhostMode && (
                    <div className="fixed top-0 left-0 w-full bg-blue-600 text-white text-center py-1 font-bold z-[100] text-[10px] uppercase tracking-widest shadow-md">
                        👻 Ghost Mode Active - Save Data Frozen 👻
                    </div>
                )}

                {/* GHOST TOOLS BUTTON */}
                <GhostTools setLikes={setLikes} isGhostMode={isGhostMode} />

                {/* GLOBAL HEADERS */}
                {(view === 'stream' || view === 'kitchen' || view === 'shop' || view === 'wardrobe' || view === 'leaderboard' || view === 'mathSetup') && (
                    <header className={`p-2 sm:p-3 shadow-sm z-40 flex flex-wrap justify-between items-center absolute top-0 w-full border-b backdrop-blur-md gap-y-2 ${isGhostMode ? 'mt-6' : ''} ${view==='stream'?'bg-white/90 border-slate-100':view==='kitchen'?'bg-teal-100/90 border-teal-200':view==='shop'?'bg-amber-200/90 border-amber-300':view==='wardrobe'?'bg-pink-200/90 border-pink-300':view==='leaderboard'?'bg-yellow-200/90 border-yellow-300':'bg-blue-200/90 border-blue-300'}`}>
                        <div className="flex gap-2">
                            {/* THE FIXED HOME LINK */}
                            <button onClick={() => window.location.href = '../index.html'} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-lg font-black border-b-4 border-slate-900 active:translate-y-1 hover:bg-slate-700">🏠</button>
                            {view === 'stream' && <div className="bg-pink-100 text-pink-600 px-3 py-2 rounded-2xl font-black text-sm border-b-4 border-pink-200 flex flex-col items-center"><span>❤️ {likes.toLocaleString()}</span><span className="text-[10px] uppercase text-pink-400">Lv.{mathLevel}</span></div>}
                            {view !== 'stream' && <button onClick={()=>setView('stream')} className="bg-white text-slate-800 px-4 py-2 rounded-xl font-black text-sm shadow-sm active:scale-95">⬅️ Return</button>}
                        </div>
                        {view === 'stream' && (
                            <div className="flex gap-1 sm:gap-1.5">
                                <button onClick={() => setShowDraw(true)} className="bg-slate-100 text-slate-600 px-2 py-2 rounded-xl text-lg border-b-4 border-slate-200">📝</button>
                                <button onClick={() => { syncToCloud(); setView('leaderboard'); }} className="bg-yellow-100 text-yellow-600 px-2 py-2 rounded-xl text-lg border-b-4 border-yellow-200">🏆</button>
                                <button onClick={() => setView('mathSetup')} className="bg-blue-50 text-blue-700 px-2 py-2 rounded-xl text-lg border-b-4 border-blue-200">📚</button>
                                <button onClick={() => setView('wardrobe')} className="bg-pink-50 text-pink-700 px-2 py-2 rounded-xl text-lg border-b-4 border-pink-200">👗</button>
                                <button onClick={() => setView('kitchen')} className="bg-teal-50 text-teal-800 px-2 py-2 rounded-xl text-lg border-b-4 border-teal-200">🍳</button>
                                <button onClick={() => { setView('shop'); setShopNotif(false); }} className={`px-2 sm:px-3 py-2 rounded-xl text-lg font-black transition-all active:translate-y-1 border-b-4 relative ${shopNotif?'bg-yellow-400 text-yellow-900 border-yellow-500 animate-pulse':'bg-amber-100 text-amber-700 border-amber-300'}`}>🏪{shopNotif&&<div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-white animate-bounce">!</div>}</button>
                            </div>
                        )}
                    </header>
                )}

                {/* MODALS */}
                {showDraw && <DrawPad problem={problem.question} onClose={() => setShowDraw(false)} />}
                {shopChallenge.active && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
                        <div className="bg-white p-6 rounded-3xl w-full max-w-xs flex flex-col items-center border-4 border-yellow-400 shadow-2xl animate-[bob_2s_infinite_ease-in-out]">
                            <h2 className="text-2xl font-black text-yellow-500 mb-2">Boss Challenge!</h2>
                            <p className="text-center text-slate-600 font-bold mb-6">Solve this to buy {shopChallenge.food.emoji}!</p>
                            <div className="text-4xl font-black text-slate-800 mb-8 bg-slate-100 px-8 py-4 rounded-2xl border-4 border-slate-200">{shopChallenge.problem.question}</div>
                            <div className="grid grid-cols-2 gap-4 w-full mb-4">{shopChallenge.problem.options.map((opt, i) => <button key={i} onClick={() => handleChallengeAnswer(opt)} className="bg-blue-500 text-white font-black text-2xl py-4 rounded-2xl border-b-4 border-blue-700 active:translate-y-1">{opt}</button>)}</div>
                            <button onClick={() => setShopChallenge({active:false,food:null,problem:null})} className="text-slate-400 font-bold mt-2 hover:text-slate-600">Cancel</button>
                        </div>
                    </div>
                )}

                {/* VIEWS */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    {view === 'stream' && (
                        <div ref={gameAreaRef} className={`relative flex-1 bg-pink-50 w-full overflow-hidden flex flex-col items-center pt-32 sm:pt-28 ${wrongFeedback ? 'shake-anim bg-red-100' : ''}`} onPointerMove={e=>draggingIndex!==null&&updateDragPos(e)} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                            <div className="absolute right-4 top-[30%] bg-white/90 p-2 rounded-full shadow-xl border-4 border-amber-200 flex flex-col items-center gap-2 z-30 animate-[fadeIn_0.5s]">
                                <div className="text-2xl mb-1">{currentFood.emoji}</div>
                                <div className="flex flex-col gap-1">{Array.from({length: currentFood.bites}).map((_, i) => <div key={i} className={`w-5 h-5 rounded-full border-2 border-amber-300 ${i < currentBitesLeft ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-slate-100 opacity-50'}`}></div>).reverse()}</div>
                                <div className="text-[10px] font-black text-amber-600 mt-1 uppercase">Bites</div>
                            </div>
                            <div className="absolute top-28 sm:top-20 z-10 bg-white px-4 sm:px-5 py-2 rounded-3xl rounded-br-none shadow-lg border-4 border-pink-200 font-black text-base sm:text-lg text-slate-700 animate-[bob_2s_infinite_ease-in-out] max-w-[90%] text-center">I want... <span className="text-pink-500">{problem.question}</span> = ?</div>
                            <div className="mt-8 mb-auto z-0 pointer-events-none relative w-full flex justify-center h-[50%]"><CharacterSVG profile={playerProfile} isChewing={isChewing} chewFrame={chewFrame} isMouthHovered={isMouthHovered} wrongFeedback={wrongFeedback} /></div>
                            <div className="w-full h-[30%] bg-amber-100 rounded-t-[50px] shadow-[0_-20px_30px_rgba(0,0,0,0.1)] flex justify-center items-center gap-2 px-2 pb-8 relative z-20 border-t-[12px] border-amber-200">
                                {problem.options.map((opt, index) => (
                                    <div key={index} className="relative flex flex-col items-center w-1/3">
                                        <div className="w-full max-w-[80px] h-10 bg-white rounded-[100%] shadow-inner border-b-[4px] border-slate-200 absolute bottom-[-10px] z-0"></div>
                                        <div onPointerDown={(e)=>handlePointerDown(e,index)} className={`relative z-10 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform flex flex-col items-center touch-none ${draggingIndex===index?'opacity-0':'opacity-100'}`}>
                                            {!isChewing && currentBitesLeft>0 && renderFoodGraphic(false, opt)}
                                            <div className="absolute -bottom-4 bg-white border-2 border-slate-800 text-slate-800 font-black rounded-full px-2 py-0.5 shadow-md text-xs sm:text-sm">{opt}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {draggingIndex !== null && !isChewing && (
                                <div className="absolute z-[100] pointer-events-none flex flex-col items-center" style={{ left: dragPos.x, top: dragPos.y, transform: 'translate(-50%, -50%)' }}>
                                    {renderFoodGraphic(true, problem.options[draggingIndex])}
                                    <div className="absolute -bottom-6 bg-white border-4 border-pink-500 text-pink-600 font-black rounded-full px-4 py-1 shadow-xl text-xl">{problem.options[draggingIndex]}</div>
                                </div>
                            )}
                            {particles.map(p => <div key={p.id} className={`absolute z-50 text-2xl font-black ${p.text.includes('-')?'animate-[floatDownRed_1s_ease-out_forwards] text-red-500':'animate-[floatUp_1s_ease-out_forwards] text-pink-500'} pointer-events-none`} style={{top:'30%',left:'40%'}}>{p.text}</div>)}
                        </div>
                    )}

                    {view === 'kitchen' && (
                        <div className="flex-1 bg-gradient-to-b from-teal-100 to-teal-50 w-full flex flex-col items-center overflow-y-auto relative pt-16">
                            <h2 className="text-3xl font-black text-teal-800 mb-8 mt-6">Kitchen</h2>
                            <div className="flex flex-col gap-4 w-full max-w-xs pb-10">
                                {MINIGAMES.map(game => (
                                    <button key={game.id} onClick={() => setView(game.id)} className={`bg-white border-4 border-${game.colorTheme}-200 rounded-3xl p-5 shadow-lg active:scale-95 flex items-center gap-4`}>
                                        <span className="text-5xl">{game.emoji}</span><span className={`font-bold text-${game.colorTheme}-700 text-lg`}>{game.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {ActiveMinigame && (
                        <ActiveMinigame.Component 
                            playSound={playSound}
                            onBack={() => setView('kitchen')}
                            onServe={(foodId, bites, newCustomData) => {
                                if(newCustomData) setCustomData(newCustomData);
                                setCurrentFoodId(foodId);
                                setCurrentBitesLeft(bites);
                                setView('stream');
                            }}
                        />
                    )}

                    {view === 'mathSetup' && (
                        <div className="flex-1 bg-gradient-to-b from-blue-100 to-blue-50 flex flex-col items-center overflow-y-auto relative pt-16">
                            <h2 className="text-3xl font-black text-blue-800 mb-6 mt-6">📚 Study Plan</h2>
                            <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-xs mb-6 border-4 border-blue-100">
                                <h3 className="font-black text-slate-700 mb-4 text-center text-xl">Select Subject</h3>
                                <div className="flex flex-col gap-3">
                                    {[{id:'addition',t:'➕ Addition'},{id:'subtraction',t:'➖ Subtraction'},{id:'multiplication',t:'✖️ Multiplication'},{id:'division',t:'➗ Division'},{id:'fractions',t:'🍕 Fractions'}].map(s=><button key={s.id} onClick={()=>{setMathSubject(s.id);setView('stream');playSound('ding');}} className={`px-4 py-3 rounded-xl font-bold text-lg transition-transform ${mathSubject===s.id?'bg-blue-500 text-white shadow-inner scale-105':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s.t}</button>)}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'wardrobe' && (
                        <div className="flex-1 bg-gradient-to-b from-pink-200 to-pink-50 flex flex-col items-center overflow-y-auto relative pb-20 custom-scrollbar pt-16">
                            <div className="w-40 h-40 mt-4 bg-white border-4 border-pink-100 rounded-full shadow-md overflow-hidden flex justify-center items-center"><div className="w-[150%] h-[150%] relative top-10"><CharacterSVG profile={playerProfile} isChewing={false} chewFrame={0} isMouthHovered={false} wrongFeedback={false} /></div></div>
                            <div className="bg-white p-4 rounded-3xl shadow-sm w-full max-w-xs mt-4"><h3 className="font-black text-slate-700 mb-2 text-center">Hair Style</h3><div className="flex justify-between gap-2">{['style1','style2','style3'].map(s=><button key={s} onClick={()=>{setPlayerProfile(p=>({...p,hairStyle:s}));playSound('pop');}} className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${playerProfile.hairStyle===s?'bg-pink-100 border-pink-400 text-pink-700':'bg-white border-slate-200 text-slate-500'}`}>{s.replace('style','Hair ')}</button>)}</div></div>
                            <div className="bg-white p-4 rounded-3xl shadow-sm w-full max-w-xs mt-4"><h3 className="font-black text-slate-700 mb-2 text-center">Hair Color</h3><div className="flex justify-between gap-2">{Object.keys(HAIR_COLORS).map(c=><button key={c} onClick={()=>{setPlayerProfile(p=>({...p,hairColor:c}));playSound('pop');}} className={`w-12 h-12 rounded-full shadow-md border-4 transition-transform ${playerProfile.hairColor===c?'scale-110 border-pink-400':'border-white hover:scale-105'}`} style={{backgroundColor:HAIR_COLORS[c].base}} />)}</div></div>
                            <div className="bg-white p-4 rounded-3xl shadow-sm w-full max-w-xs mt-4 mb-6"><h3 className="font-black text-slate-700 mb-2 text-center">Shirt Color</h3><div className="flex flex-wrap justify-center gap-3">{SHIRT_COLORS.map(c=><button key={c} onClick={()=>{setPlayerProfile(p=>({...p,shirt:c}));playSound('pop');}} className={`w-12 h-12 rounded-full shadow-md border-4 transition-transform ${playerProfile.shirt===c?'scale-110 border-pink-400':'border-white hover:scale-105'}`} style={{backgroundColor:c}} />)}</div></div>
                            <h2 className="text-2xl font-black text-pink-800 mb-4">Premium Skins</h2>
                            <div className="w-full max-w-xs space-y-4">
                                {SKINS.map(s => {
                                    const hS = unlockedSkins.includes(s.id); const iE = playerProfile.skin === s.id; const cB = likes >= s.cost;
                                    return (
                                        <div key={s.id} className={`bg-white p-4 rounded-3xl border-4 flex items-center gap-4 ${iE?'border-pink-400 bg-pink-50':'border-pink-100'}`}>
                                            <div className="text-4xl">{s.icon}</div><div className="flex-1"><div className="font-bold text-slate-800">{s.name}</div><div className="text-xs text-slate-500">{s.desc}</div></div>
                                            {iE ? <button className="bg-pink-400 text-white font-bold px-3 py-2 rounded-xl text-sm">Equipped</button> : hS ? <button onClick={()=>{setPlayerProfile(p=>({...p,skin:s.id}));playSound('pop');}} className="bg-slate-100 font-bold px-3 py-2 rounded-xl text-sm border-b-4 border-slate-200">Wear</button> : <button disabled={!cB} onClick={()=>{setLikes(l=>l-s.cost);setUnlockedSkins(sk=>[...sk,s.id]);setPlayerProfile(p=>({...p,skin:s.id}));playSound('ding');}} className={`px-3 py-2 font-bold rounded-xl text-sm border-b-4 ${cB?'bg-yellow-400 text-yellow-900 border-yellow-500':'bg-slate-100 text-slate-400 border-slate-200'}`}>{s.cost} ❤️</button>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {view === 'shop' && (
                        <div className="flex-1 flex flex-col bg-amber-50 relative overflow-hidden pt-16">
                            <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
                                <h2 className="text-3xl font-black text-amber-900 mb-6 flex items-center gap-2 mt-2"><span>🏪</span> Food Menu</h2>
                                <div className="space-y-4">
                                    {FOOD_DATABASE.filter(f => f.type !== 'custom').map(food => {
                                        const hasFood = unlockedFoods.includes(food.id); const isEq = currentFoodId === food.id; const canAfford = likes >= food.cost;
                                        if (food.isSecret) {
                                            const chal = CHALLENGES.find(c => c.unlocksFoodId === food.id);
                                            if (chal && stats[chal.reqType] < chal.reqCount) {
                                                return (
                                                    <div key={food.id} className="p-4 rounded-2xl flex items-center gap-4 border-4 bg-slate-100 border-slate-300 opacity-80">
                                                        <div className="text-4xl filter grayscale blur-[2px]">❓</div><div className="flex-1"><h3 className="font-bold text-lg text-slate-500">???</h3><p className="text-red-500 font-bold text-xs mt-1">Master Chef Challenge!</p><p className="text-slate-500 text-xs mt-1">Eat {chal.reqCount} {chal.reqName} ({stats[chal.reqType]}/{chal.reqCount})</p></div><button disabled className="px-4 py-3 bg-slate-300 text-slate-500 font-bold rounded-xl text-md">🔒 Locked</button>
                                                    </div>
                                                );
                                            }
                                        }
                                        return (
                                            <div key={food.id} className={`p-4 rounded-2xl flex items-center gap-4 border-4 shadow-sm transition-colors ${isEq?'bg-amber-100 border-amber-300':'bg-white border-transparent'}`}>
                                                <div className="text-5xl drop-shadow-sm">{food.emoji}</div><div className="flex-1"><h3 className="font-black text-lg text-slate-800">{food.name}</h3><p className="text-amber-600 font-bold text-sm">+{food.power} / math solve</p></div>
                                                {isEq ? <button className="px-4 py-2 bg-amber-400 text-amber-900 font-black rounded-xl text-md shadow-inner">Eating</button> : hasFood ? <button onClick={()=>{setCurrentFoodId(food.id);setCurrentBitesLeft(food.bites);playSound('pop');setView('stream');}} className="px-4 py-2 bg-slate-100 font-black text-slate-600 rounded-xl text-md border-b-4 border-slate-300 hover:bg-slate-200 active:translate-y-1 active:border-b-0 transition-all">Equip</button> : <button onClick={()=>canAfford?triggerBuyChallenge(food):null} disabled={!canAfford} className={`px-4 py-3 font-black rounded-xl text-md shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${canAfford?'bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-300':'bg-slate-100 border-slate-200 text-slate-400 opacity-60'}`}>Buy ({food.cost} ❤️)</button>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'leaderboard' && (
                        <div className="flex-1 bg-gradient-to-b from-yellow-100 to-yellow-50 flex flex-col overflow-y-auto pt-16">
                            <div className="p-6 pb-20">
                                <h2 className="text-3xl font-black text-yellow-800 mb-6 text-center">🏆 Top Streamers</h2>
                                <div className="space-y-3">
                                    {leaderboard.length===0 && <p className="text-center text-slate-500 font-bold">Loading Cloud Database...</p>}
                                    {leaderboard.map((lb,i)=>{
                                        const cP = lb.profile || {base:'girl',skin:lb.skin,hairStyle:'style1',hairColor:'black',shirt:'#a1c4fd'};
                                        return (
                                            <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4 border-4 border-yellow-200 shadow-sm">
                                                <div className="text-2xl font-black text-slate-400">#{i+1}</div>
                                                <div className="w-14 h-14 bg-slate-100 rounded-full border-2 border-slate-200 flex items-center justify-center text-2xl overflow-hidden relative"><div className="w-[150%] h-[150%] relative top-4"><CharacterSVG profile={cP} isChewing={false} chewFrame={0} isMouthHovered={false} wrongFeedback={false} /></div></div>
                                                <div className="flex-1"><h3 className="font-bold text-lg text-slate-800 truncate">{lb.name}</h3><p className="text-pink-500 font-black text-sm">{lb.likes} ❤️</p></div>
                                                <div className="text-4xl drop-shadow-sm">{lb.foodEmoji}</div>
                                            </div>
                                        );
                                    })}
                                </div>
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