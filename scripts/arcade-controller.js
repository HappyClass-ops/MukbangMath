// ==========================================
// 1. TEACHER CHEAT MODE (7 Taps)
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
            localStorage.setItem('teacherCheatMode', 'true');
            alert("✅ GHOST MODE ACTIVATED\nScores and data will NOT be saved to Firebase while testing.");
        } else if (pass !== null) {
            alert("❌ Incorrect Passcode.");
        }
    }
    
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000); 
});

// ==========================================
// 2. PAGED CAROUSEL RENDERER & LOGIC
// ==========================================
function renderCarousel() {
    const container = document.getElementById('game-carousel');
    container.innerHTML = ""; 

    window.ARCADE_GAMES.forEach(game => {
        const btnHTML = game.disabled 
            ? `<button disabled class="w-full py-3 ${game.buttonColor} text-slate-500 font-black text-xl rounded-xl uppercase tracking-wider cursor-not-allowed">Coming Soon</button>`
            : `<button class="w-full py-3 ${game.buttonColor} hover:brightness-110 text-black font-black text-xl rounded-xl transition-all active:scale-95 uppercase tracking-wider" style="box-shadow: 0 0 15px ${game.themeColor};">Play Now</button>`;

        // Card Structure (Front Image, Back Description)
        const cardHTML = `
            <div class="carousel-card bg-black/60 backdrop-blur-md" 
                 style="border: 2px solid ${game.themeColor}; box-shadow: 0 0 15px ${game.themeColor};"
                 onclick="window.ArcadeAPI.handleCardTap(this, '${game.folder}/index.html', ${game.disabled})">
                
                <!-- FRONT: COVER ART -->
                <div class="card-front">
                    <img src="${game.coverArt}" onerror="this.src='${window.ROOT_ASSETS.fallbackImage}';" class="game-cover-img" alt="${game.title}">
                    <h3 class="text-3xl font-black mb-2 font-mono tracking-wider text-center" style="color: ${game.themeColor}; text-shadow: 0 0 15px ${game.themeColor};">${game.title}</h3>
                    <p class="text-slate-400 text-sm mt-4 animate-pulse">Tap to view details</p>
                </div>

                <!-- BACK: DETAILS & PLAY -->
                <div class="card-back bg-black/90 p-6 text-center">
                    <div class="text-5xl mb-2">${game.emoji}</div>
                    <h3 class="text-xl font-black mb-4 font-mono" style="color: ${game.themeColor};">${game.title}</h3>
                    <p class="text-slate-300 text-sm mb-6 flex-1 overflow-y-auto no-scrollbar">${game.description}</p>
                    ${btnHTML}
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

renderCarousel();

// ==========================================
// 3. API & INTERACTIONS
// ==========================================
let audioPlayer = null;

window.ArcadeAPI = {
    // 2-Tap Logic
    handleCardTap: (cardElement, url, isDisabled) => {
        if(isDisabled) return;
        
        // Play tap sound if available
        if(window.ROOT_ASSETS.tapSound) {
            new Audio(window.ROOT_ASSETS.tapSound).play().catch(e=>{});
        }

        const isRevealed = cardElement.classList.contains('is-revealed');
        
        if (!isRevealed) {
            // TAP 1: Close other cards, flip this one
            document.querySelectorAll('.carousel-card').forEach(c => c.classList.remove('is-revealed'));
            cardElement.classList.add('is-revealed');
        } else {
            // TAP 2: Launch Game
            window.location.href = url;
        }
    },
    
    // Page Arrows Logic
    scrollCarousel: (direction) => {
        if(window.ROOT_ASSETS.swipeSound) {
            new Audio(window.ROOT_ASSETS.swipeSound).play().catch(e=>{});
        }
        const carousel = document.getElementById('game-carousel');
        // Scroll exactly one card width + gap (300px + 24px)
        carousel.scrollBy({ left: 324 * direction, behavior: 'smooth' });
    },

    toggleMenuMusic: () => {
        const btn = document.getElementById('btnToggleMusic');
        if (window.ROOT_ASSETS.menuMusicFile) {
            if(!audioPlayer) { audioPlayer = new Audio(window.ROOT_ASSETS.menuMusicFile); audioPlayer.loop = true; }
            if(audioPlayer.paused) { audioPlayer.play(); btn.innerText = "🔇 Disable Arcade Music"; } 
            else { audioPlayer.pause(); btn.innerText = "🎵 Enable Arcade Music"; }
        } else {
            alert("No music file configured in assets.js! Add one to hear tunes.");
        }
    },
    showAdminIdeas: async () => { /* ... Same logic as before ... */ },
    sendIdea: async () => { /* ... Same logic as before ... */ },
    nukeLocalData: () => {
        if(confirm("⚠️ WARNING ⚠️\nThis will permanently delete all local high scores, unlocked skins, and profiles on this specific iPad/computer. \n\nAre you absolutely sure?")) {
            localStorage.clear();
            alert("☢️ Local Data Nuked. Refreshing page...");
            window.location.reload();
        }
    }
};