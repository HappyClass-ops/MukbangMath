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
    if (event.target.closest('.play-btn')) return;
    
    const isFlipped = cardElement.classList.contains('flipped');
    document.querySelectorAll('.arcade-card').forEach(c => c.classList.remove('flipped'));
    
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
    toggleMenuMusic: () => {
        const btn = document.getElementById('btnToggleMusic');
        
        // This looks directly at your assets.js dictionary!
        if (window.ROOT_ASSETS.SoundOfArcadeMenu) {
            if(!audioPlayer) {
                audioPlayer = new Audio(window.ROOT_ASSETS.SoundOfArcadeMenu);
                audioPlayer.loop = true;
            }
            if(audioPlayer.paused) {
                audioPlayer.play();
                btn.innerText = "🔇 Disable Arcade Music";
                btn.classList.add('bg-cyan-900', 'border-cyan-500', 'text-cyan-200');
            } else {
                audioPlayer.pause();
                btn.innerText = "🎵 Enable Arcade Music";
                btn.classList.remove('bg-cyan-900', 'border-cyan-500', 'text-cyan-200');
            }
        } else {
            alert("No music file configured in assets.js!");
        }
    },
    
    showAdminIdeas: async () => {
        const pwd = prompt("Enter Admin Password:");
        if(pwd !== "dogs123") {
            if(pwd !== null) alert("Incorrect Password! Access Denied. 🛑");
            return;
        }
        document.getElementById('modal-submit-idea').classList.add('hidden');
        document.getElementById('modal-admin-ideas').classList.remove('hidden');
        const listEl = document.getElementById('admin-ideas-list');
        listEl.innerHTML = "<div class='text-center text-slate-500 font-mono py-10'>Decrypting Vault...</div>";
        
        try {
            const snap = await window.globalDb.collection("arcade_ideas").orderBy("timestamp", "desc").get();
            if(snap.empty) { listEl.innerHTML = "<div class='text-center text-slate-500 font-mono py-10'>No ideas submitted.</div>"; return; }
            let html = "";
            snap.forEach(doc => {
                const d = doc.data();
                html += `<div class="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3">
                            <div class="flex justify-between items-start mb-2"><span class="font-black text-purple-400 font-mono">${d.author}</span><span class="text-xs text-slate-500">${d.date}</span></div>
                            <p class="text-slate-300 whitespace-pre-wrap">${d.text}</p>
                         </div>`;
            });
            listEl.innerHTML = html;
        } catch(e) { listEl.innerHTML = "<div class='text-center text-red-500 font-mono py-10'>Error loading vault.</div>"; }
    },

    sendIdea: async () => {
        const author = document.getElementById('ideaAuthor').value.trim() || "Anonymous";
        const text = document.getElementById('ideaText').value.trim();
        if(!text) { alert("Please type an idea first!"); return; }
        try {
            await window.globalDb.collection("arcade_ideas").add({ author: author, text: text, date: new Date().toLocaleDateString(), timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            alert("Idea sent! 🚀");
            document.getElementById('ideaAuthor').value = ""; document.getElementById('ideaText').value = "";
            document.getElementById('modal-submit-idea').classList.add('hidden');
        } catch(e) { alert("Failed to send idea. Check connection."); }
    },

    nukeLocalData: () => {
        if(confirm("⚠️ WARNING ⚠️\nThis will permanently delete all local high scores and unlocked skins on this device. \n\nAre you sure?")) {
            localStorage.clear();
            alert("☢️ Local Data Nuked. Refreshing page...");
            window.location.reload();
        }
    }
};