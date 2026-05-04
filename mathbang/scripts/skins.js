// ==========================================
// STREAMER WARDROBE (Config-Driven SVGs)
// ==========================================

window.MATHBANG_SKINS = [
    { 
        id: 'default', name: 'Casual', cost: 0, icon: '👕', desc: 'Your everyday clothes.',
        applyOverrides: (c) => c, // Returns default colors
        renderBack: () => null, 
        renderFront: () => null 
    },
    { 
        id: 'school', name: 'School Uniform', cost: 1000, icon: '🎓', desc: 'Study hard, eat harder!',
        applyOverrides: (c) => ({ ...c, shirt: '#0984e3' }),
        renderBack: () => null,
        renderFront: () => <path d="M 70 140 L 100 170 L 130 140 Z" fill="#dfe6e9" /> // The tie/collar
    },
    { 
        id: 'rocker', name: 'Punk Rocker', cost: 2500, icon: '🎸', desc: 'Loud crunching ASMR!',
        applyOverrides: (c) => ({ ...c, shirt: '#2d3436', hairBase: '#d63031', hairFront: '#ff7675' }),
        renderBack: () => null,
        renderFront: () => (
            <>
                <path d="M 75 140 L 75 200 M 125 140 L 125 200" stroke="#b2bec3" strokeWidth="4" />
                <circle cx="100" cy="125" r="3" fill="silver" /> {/* Piercing */}
            </>
        )
    },
    { 
        id: 'cyber', name: 'Cyberpunk', cost: 5000, icon: '🕶️', desc: 'Stream from the future.',
        applyOverrides: (c) => ({ ...c, shirt: '#2d3436' }),
        renderBack: () => null,
        renderFront: () => <rect x="50" y="95" width="100" height="25" rx="10" fill="#00cec9" opacity="0.8" /> // Visor
    },
    { 
        id: 'ninja', name: 'Ninja Stealth', cost: 10000, icon: '🥷', desc: 'Silent chewing skills.',
        hideNormalMouth: true,
        applyOverrides: (c) => ({ ...c, shirt: '#1e272e', hairBase: '#1e272e', hairFront: '#2d3436', skinTone: '#f5cdb0' }),
        renderBack: () => <path d="M 45 110 C 45 180, 155 180, 155 110 Z" fill="#2d3436" />, // Mask base
        renderFront: () => null
    },
    { 
        id: 'royal', name: 'Royal Majesty', cost: 25000, icon: '👑', desc: 'Fit for a king/queen.',
        applyOverrides: (c) => ({ ...c, shirt: '#e1b12c' }),
        renderBack: () => <path d="M 50 140 L 30 200 L 170 200 L 150 140 Z" fill="#c23616" />, // Cape back
        renderFront: () => <path d="M 60 50 L 70 20 L 100 40 L 130 20 L 140 50 Z" fill="#f1c40f" /> // Crown
    }
];