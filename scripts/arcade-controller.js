// ==========================================
// 1. RENDER THE GRID
// ==========================================
function renderArcade() {
    const container = document.getElementById('game-carousel'); // We kept the ID so we don't break index.html
    container.className = "game-grid-container"; // Switch from carousel to grid
    container.innerHTML = ""; 

    window.ARCADE_GAMES.forEach(game => {
        // Use coverArt if it exists, otherwise show emoji
        const imageContent = game.coverArt 
            ? `<img src="${game.coverArt}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
               <div class="text-6xl" style="display:none;">${game.emoji}</div>`
            : `<div class="text-6xl">${game.emoji}</div>`;

        const actionButton = game.disabled 
            ? `<button disabled class="w-full py-3 bg-slate-800 text-slate-500 font-black text-xl rounded-xl uppercase cursor-not-allowed">Coming Soon</button>`
            : `<button onclick="window.location.href='${game.folder}/index.html'" class="w-full py-3 ${game.buttonColor} hover:brightness-110 text-black font-black text-xl rounded-xl transition-all active:scale-95 uppercase shadow-[0_0_15px_${game.themeColor}]">Play Now</button>`;

        container.innerHTML += `
            <div class="arcade-card bg-black/60 backdrop-blur-md p-6 flex flex-col items-center text-center" style="border: 2px solid ${game.themeColor};">
                <div class="image-box">
                    ${imageContent}
                </div>
                <h3 class="text-2xl font-black mb-2 font-mono" style="color: ${game.themeColor};">${game.title}</h3>
                <p class="text-slate-300 text-sm mb-6 flex-1">${game.description}</p>
                ${actionButton}
            </div>
        `;
    });
}

// Start it up!
renderArcade();

// ==========================================
// 2. TEACHER CHEAT & MUSIC (Simplified)
// ==========================================
let tapCount = 0;
document.getElementById('arcade-title').addEventListener('click', () => {
    tapCount++;
    if (tapCount >= 7) {
        const pass = prompt("TEACHER OVERRIDE\nEnter Passcode:");
        if (pass === "dogs123") {
            localStorage.setItem('isTeacherTesting', 'true');
            alert("✅ GHOST MODE ON: High scores will NOT be saved to the cloud.");
        }
        tapCount = 0;
    }
});

let menuMusic = null;
window.ArcadeAPI = {
    toggleMenuMusic: () => {
        const btn = document.getElementById('btnToggleMusic');
        if (!menuMusic) menuMusic = new Audio(window.ROOT_ASSETS.SoundOfArcadeMenu);
        
        if (menuMusic.paused) {
            menuMusic.play();
            btn.innerText = "🔇 Disable Arcade Music";
        } else {
            menuMusic.pause();
            btn.innerText = "🎵 Enable Arcade Music";
        }
    },
    // Idea Dropbox logic remains the same...
    sendIdea: async () => { /* ... existing code ... */ },
    showAdminIdeas: async () => { /* ... existing code ... */ }
};