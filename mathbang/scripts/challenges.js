// ==========================================
// MASTER CHEF CHALLENGES & KITCHEN MINIGAMES
// ==========================================

// 1. THE UNLOCK LOGIC
window.MATHBANG_CHALLENGES = [
    { unlocksFoodId: 'steak', reqType: 'ramenEaten', reqName: 'Spicy Ramens', reqCount: 15 },
    { unlocksFoodId: 'caviar', reqType: 'tanghuluEaten', reqName: 'Tanghulus', reqCount: 15 },
    { unlocksFoodId: 'feast', reqType: 'kakigoriEaten', reqName: 'Shaved Ices', reqCount: 15 }
];

// 2. THE MODULAR KITCHEN MINIGAMES
window.MATHBANG_MINIGAMES = [
    {
        id: 'kakigori',
        name: 'Shaved Ice',
        emoji: '🍧',
        colorTheme: 'blue',
        // The self-contained React Component for this game
        Component: ({ onBack, onServe, playSound }) => {
            const [iceLevel, setIceLevel] = React.useState(0);
            const [syrupInfo, setSyrupInfo] = React.useState(null);

            return (
                <div className="flex-1 bg-blue-50 w-full p-6 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center z-20">
                        <h2 className="text-2xl font-bold text-blue-800">Kakigori</h2>
                        <button onClick={onBack} className="bg-white p-3 rounded-xl shadow-sm font-bold hover:bg-slate-100">Back ❌</button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative mt-12">
                        <div className="relative w-48 h-48 flex items-end justify-center z-10 mb-8">
                            <div className="absolute bottom-0 w-32 h-16 bg-white/50 rounded-b-full border-4 border-blue-200 z-30"></div>
                            <div className="absolute bottom-12 bg-white rounded-t-full shadow-inner z-20 overflow-hidden" style={{width:`${60+(iceLevel*12)}px`,height:`${20+(iceLevel*15)}px`}}>
                                <div className="w-full h-full absolute bottom-0 left-0 transition-all duration-[2000ms] mix-blend-multiply" style={{backgroundColor:syrupInfo?.color||'transparent',height:syrupInfo?.poured?'100%':syrupInfo?.isPouring?'50%':'0%',opacity:0.9}} />
                            </div>
                            <div className="absolute text-5xl z-40 bottom-[-10px]">🥣</div>
                        </div>
                        <div className="h-24 flex items-center justify-center">
                            {iceLevel < 5 ? (
                                <button onClick={()=>{setIceLevel(l=>l+1);playSound('pop');}} className="bg-blue-500 text-white w-20 h-20 rounded-full font-black text-xl shadow-lg active:scale-95">❄️</button>
                            ) : !syrupInfo?.poured ? (
                                <div className="flex gap-4">
                                    {[{id:'str',color:'#ff4d6d'},{id:'mel',color:'#06d6a0'},{id:'blu',color:'#118ab2'}].map(s=>(
                                        <button key={s.id} onClick={()=>{setSyrupInfo({color:s.color,isPouring:true});setTimeout(()=>setSyrupInfo({color:s.color,isPouring:false,poured:true}),2000);}} className="w-16 h-20 rounded-xl shadow-md border-b-4" style={{backgroundColor:s.color,borderColor:'rgba(0,0,0,0.2)'}} />
                                    ))}
                                </div>
                            ) : (
                                // Passes the result back to the main engine!
                                <button onClick={() => onServe('custom_kakigori', 2, { color: syrupInfo.color })} className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-full font-black text-xl shadow-lg animate-bounce">Serve! 😋</button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    },
    {
        id: 'tanghulu',
        name: 'Tanghulu',
        emoji: '🍡',
        colorTheme: 'red',
        Component: ({ onBack, onServe, playSound }) => {
            const [skewerFruits, setSkewerFruits] = React.useState([]);
            const [isDipped, setIsDipped] = React.useState(false);
            const [isDippingAnim, setIsDippingAnim] = React.useState(false);

            return (
                <div className="flex-1 bg-red-50 w-full p-6 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center z-20">
                        <h2 className="text-2xl font-bold text-red-800">Tanghulu</h2>
                        <button onClick={onBack} className="bg-white p-3 rounded-xl shadow-sm font-bold hover:bg-slate-100">Back ❌</button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-between py-10 relative">
                        <div className={`relative flex flex-col items-center h-48 transition-transform duration-700 ease-in-out z-10 ${isDippingAnim?'translate-y-32':'translate-y-0'}`}>
                            <div className="absolute w-2 h-56 bg-amber-200 rounded-full shadow-inner z-0 top-4"></div>
                            <div className="flex flex-col gap-1 z-10 mt-8">
                                {skewerFruits.map((f,i)=>(<div key={i} className="text-5xl relative">{f}{isDipped&&<div className="absolute inset-0 bg-white/50 rounded-full blur-[2px]"></div>}</div>))}
                            </div>
                        </div>
                        <div className="w-full flex justify-center items-end h-40 relative z-20">
                            {skewerFruits.length < 3 ? (
                                <div className="flex gap-4 bg-white/50 p-4 rounded-3xl w-full justify-center">
                                    {['🍓','🍇','🍊'].map(f=><button key={f} onClick={()=>{setSkewerFruits(p=>[f,...p]);playSound('pop');}} className="text-5xl bg-white w-20 h-20 rounded-2xl shadow-md active:scale-90">{f}</button>)}
                                </div>
                            ) : !isDipped ? (
                                <button onClick={()=>{setIsDippingAnim(true);setTimeout(()=>{setIsDippingAnim(false);setIsDipped(true);},1500);}} className="mb-4 bg-red-500 text-white px-8 py-4 rounded-full font-black text-xl shadow-lg animate-pulse">Dip in Sugar!</button>
                            ) : (
                                <button onClick={() => onServe('custom_tanghulu', 3, { fruits: skewerFruits })} className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-full font-black text-xl shadow-lg animate-bounce z-20 mb-8">Serve! 😋</button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    },
    {
        id: 'ramen',
        name: 'Spicy Ramen',
        emoji: '🍜',
        colorTheme: 'orange',
        Component: ({ onBack, onServe, playSound }) => {
            const [ramenStep, setRamenStep] = React.useState(0);
            
            return (
                <div className="flex-1 bg-orange-50 w-full p-6 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center z-20">
                        <h2 className="text-2xl font-bold text-orange-800">Spicy Ramen</h2>
                        <button onClick={onBack} className="bg-white p-3 rounded-xl shadow-sm font-bold hover:bg-slate-100">Back ❌</button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative mt-8">
                        <div className="relative w-56 h-48 mb-12 flex justify-center">
                            <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-2xl z-10 relative">
                                <ellipse cx="50" cy="20" rx="45" ry="15" fill={ramenStep>=4?"#c23616":ramenStep>=1?"#dcdde1":"#7f8fa6"} className="transition-colors duration-1000"/>
                                <path d="M 5 20 L 10 70 C 10 80, 90 80, 90 70 L 95 20 Z" fill="#2f3640" />
                                <ellipse cx="50" cy="20" rx="45" ry="15" fill="none" stroke="#718093" strokeWidth="3" />
                            </svg>
                            {ramenStep>=3 && (<div className={`absolute z-20 flex justify-center w-full ${ramenStep===3?'animate-[slowDrop_1.2s_ease-in_forwards]':'top-4'}`}>{ramenStep===3?(<div className="w-16 h-16 bg-yellow-200 border-4 border-yellow-400 rounded-md flex items-center justify-center overflow-hidden shadow-lg"><div className="w-full h-full opacity-50" style={{backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 4px, #d4ac0d 4px, #d4ac0d 8px)'}}></div></div>):<div className="text-5xl opacity-90 drop-shadow-md">🍜</div>}</div>)}
                            {(ramenStep===1||ramenStep===2) && (<div className="absolute inset-0 z-20 overflow-hidden top-4 h-12 w-32 left-12">{[1,2,3,4].map(i=><div key={i} className="absolute bg-white/50 rounded-full animate-[bubbleUp_1s_infinite]" style={{width:12,height:12,left:`${Math.random()*80}%`,animationDelay:`${Math.random()}s`}}/>)}</div>)}
                            {ramenStep===4 && (<div className="absolute top-[-60px] right-0 animate-[pourStream_1s_ease-out_forwards] z-30"><div className="bg-red-500 w-12 h-16 rounded-md rotate-[-45deg] relative"><div className="absolute bottom-[-20px] left-[-10px] w-4 h-16 bg-red-600 blur-[2px]"></div></div></div>)}
                        </div>
                        <button onClick={()=>{playSound('pop');if(ramenStep===0){setRamenStep(1);setTimeout(()=>setRamenStep(2),2000);}else if(ramenStep===2)setRamenStep(3);else if(ramenStep===3)setRamenStep(4);else if(ramenStep===4){ onServe('custom_ramen', 4, null); }}} disabled={ramenStep===1} className={`px-8 py-4 rounded-full font-black text-xl shadow-lg active:scale-95 transition-all z-40 ${ramenStep===4?'bg-yellow-400 text-yellow-900 animate-bounce':ramenStep===1?'bg-slate-300 text-slate-500':'bg-orange-500 text-white'}`}>
                            {ramenStep===0?"🔥 Boil Water":ramenStep===1?"Boiling...":ramenStep===2?"Add Noodles 🟨":ramenStep===3?"Add Spice! 🌶️":"Serve! 😋"}
                        </button>
                    </div>
                </div>
            );
        }
    }
];