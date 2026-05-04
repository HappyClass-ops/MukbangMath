// ==========================================
// 1. RENDER THE NETFLIX CAROUSEL
// ==========================================
function renderArcade() {
    const container = document.getElementById('game-carousel'); 
    container.innerHTML = ""; 

    // Loop through the games in arcade-config.js
    window.ARCADE_GAMES.forEach(game => {
        // Skip anything marked as disabled (we will hardcode the coming soon card)
        if (game.disabled) return;

        // Build the Full-Bleed Card
        container.innerHTML += `
            <div class="arcade-card group" style="border: 2px solid ${game.themeColor}; box-shadow: 0 0 15px ${game.themeColor};">
                
                <!-- 1. The Faded Background Image -->
                <img src="${game.coverArt}" onerror="this.src='${window.ROOT_ASSETS.ImageSafetyNet}'" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-10 transition-opacity duration-500">
                
                <!-- 2. The Big Emoji (Disappears on Tap/Hover) -->
                <div class="absolute inset-0 flex items-center justify-center text-8xl group-hover:opacity-0 transition-opacity duration-500 drop-shadow-2xl">
                    ${game.emoji}
                </div>

                <!-- 3. The Content (Appears on Tap/Hover) -->
                <div class="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/50">
                    <h3 class="text-3xl font-black mb-4 font-mono text-center" style="color: ${game.themeColor}; text-shadow: 0 0 10px ${game.themeColor};">${game.title}</h3>
                    <p class="text-slate-200 text-sm mb-8 text-center font-bold">${game.description}</p>
                    <button onclick="window.location.href='${game.folder}/index.html'" class="w-full py-4 ${game.buttonColor} hover:brightness-110 text-black font-black text-xl rounded-xl transition-all active:scale-95 uppercase tracking-wider shadow-lg">PLAY NOW</button>
                </div>
            </div>
        `;
    });

    // AUTO-APPEND THE "COMING SOON" MYSTERY CARD AT THE END
    container.innerHTML += `
        <div class="arcade-card group opacity-70" style="border: 2px solid #475569;">
            <div class="absolute inset-0 flex items-center justify-center text-8xl grayscale group-hover:opacity-0 transition-opacity duration-500">🚀</div>
            <div class="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/50">
                <h3 class="text-3xl font-black mb-4 font-mono text-center text-slate-500">MYSTERY GAME</h3>
                <p class="text-slate-400 text-sm mb-8 text-center font-bold">A new challenger is approaching... Keep studying to prepare!</p>
                <button disabled class="w-full py-4 bg-slate-800 text-slate-500 font-black text-xl rounded-xl uppercase tracking-wider cursor-not-allowed">Coming Soon</button>
            </div>
        </div>
    `;
}

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
        } else if (pass !== null) {
            alert("❌ Incorrect Passcode.");
        }
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
        document.getElementById('modal-submit-idea').classList.add('hidden'); // Close idea modal
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
        if(confirm("⚠️ WARNING ⚠️\nThis will permanently delete all local high scores and unlocked skins on this specific device. \n\nAre you sure?")) {
            localStorage.clear();
            alert("☢️ Local Data Nuked. Refreshing page...");
            window.location.reload();
        }
    }
};