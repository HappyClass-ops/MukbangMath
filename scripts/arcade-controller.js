// ==========================================
// 1. RENDER THE NETFLIX CAROUSEL
// ==========================================
function renderArcade() {
    const container = document.getElementById('game-carousel'); 
    container.className = "game-scroller w-full max-w-6xl mx-auto mb-10"; 
    container.innerHTML = ""; 

    window.ARCADE_GAMES.forEach(game => {
        const actionButton = game.disabled 
            ? `<button disabled class="w-full py-4 bg-slate-800 text-slate-500 font-black text-xl rounded-xl uppercase tracking-wider cursor-not-allowed shadow-[0_0_15px_${game.themeColor}]">Coming Soon</button>`
            : `<button onclick="window.location.href='${game.folder}/index.html'" class="play-btn w-full py-4 ${game.buttonColor} hover:brightness-110 text-black font-black text-xl rounded-xl transition-all active:scale-95 uppercase tracking-wider shadow-[0_0_15px_${game.themeColor}]">Play Now</button>`;

        container.innerHTML += `
            <div class="arcade-card" style="border: 2px solid ${game.themeColor}; box-shadow: 0 0 15px ${game.themeColor};" onclick="toggleCard(this, event)">
                
                <!-- 1. The Breathing Background Image -->
                <img src="${game.coverArt}" class="card-bg-img" onerror="this.src='${window.ROOT_ASSETS.ImageSafetyNet}'" alt="${game.title}">
                
                <!-- 2. Front Layer (Title Only) -->
                <div class="card-front">
                    <h3 class="text-3xl font-black font-mono text-center tracking-wider uppercase" style="color: ${game.themeColor}; text-shadow: 0 0 10px #000, 0 0 20px ${game.themeColor};">${game.title}</h3>
                </div>

                <!-- 3. Back Layer (Description & Button) -->
                <div class="card-back">
                    <h3 class="text-2xl font-black mb-4 font-mono text-center uppercase" style="color: ${game.themeColor}; text-shadow: 0 0 10px ${game.themeColor};">${game.title}</h3>
                    <p class="text-slate-200 text-sm mb-8 text-center font-bold">${game.description}</p>
                    ${actionButton}
                </div>
            </div>
        `;
    });

    // MAKE PC SCROLLING NICE (Mouse wheel scrolls horizontally)
    container.addEventListener('wheel', (evt) => {
        if (evt.deltaY !== 0) {
            evt.preventDefault();
            container.scrollLeft += evt.deltaY;
        }
    });
}

// TAP LOGIC FOR MOBILE: Tap to reveal button, tap elsewhere to hide
window.toggleCard = function(cardElement, event) {
    // If they click the Play button itself, don't interrupt the link
    if (event.target.closest('.play-btn')) return;
    
    // Check if this card is currently flipped
    const isFlipped = cardElement.classList.contains('flipped');
    
    // Un-flip all cards
    document.querySelectorAll('.arcade-card').forEach(c => c.classList.remove('flipped'));
    
    // If it wasn't flipped, flip this specific one
    if (!isFlipped) {
        cardElement.classList.add('flipped');
    }
};

renderArcade();

// ==========================================
// 2. TEACHER CHEAT (7 Taps)
// ==========================================
let tapCount = 0;
let tapTimer;

document.getElementById('arcade-title').addEventListener('click', () => {
    tapCount++;
    clearTimeout(tapTimer);
    if (tapCount >= 7) {
        tapCount = 0;
        const pass = prompt("TEACHER OVERRIDE\nEnter Passcode:");
        if (pass === "dogs123") {
            localStorage.setItem('isTeacherTesting', 'true');
            alert("✅ GHOST MODE ACTIVATED\nScores will NOT be saved to Firebase while testing.");
        } else if (pass !== null) alert("❌ Incorrect Passcode.");
    }
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000); 
});

// ==========================================
// 3. MUSIC & ADMIN IDEAS
// ==========================================
let audioPlayer = null;
window.ArcadeAPI = {
    toggleMenuMusic: () => { /* ... existing music logic ... */ },
    showAdminIdeas: async () => { /* ... existing admin logic ... */ },
    sendIdea: async () => { /* ... existing send idea logic ... */ },
    nukeLocalData: () => { /* ... existing nuke logic ... */ }
};