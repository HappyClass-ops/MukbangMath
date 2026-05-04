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
    
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000); // Reset taps if 2 seconds pass
});

// ==========================================
// 2. NETFLIX CAROUSEL RENDERER
// ==========================================
function renderCarousel() {
    const container = document.getElementById('game-carousel');
    container.innerHTML = ""; // Clear it

    window.ARCADE_GAMES.forEach(game => {
        // The Invisible Safety Net for broken images
        const imageHTML = game.coverArt 
            ? `<img src="${game.coverArt}" onerror="this.src='${window.ROOT_ASSETS.fallbackImage}'; this.style.display='none'; this.nextElementSibling.style.display='block';" class="game-cover-img" alt="${game.title}">
               <div class="text-6xl mb-4 hidden-emoji" style="display:none;">${game.emoji}</div>`
            : `<div class="text-6xl mb-4">${game.emoji}</div>`;

        const btnHTML = game.disabled 
            ? `<button disabled class="w-full py-3 ${game.buttonColor} text-slate-500 font-black text-xl rounded-xl uppercase tracking-wider cursor-not-allowed">Coming Soon</button>`
            : `<button onclick="window.location.href='${game.folder}/index.html'" class="w-full py-3 ${game.buttonColor} hover:brightness-110 text-black font-black text-xl rounded-xl transition-all active:scale-95 uppercase tracking-wider" style="box-shadow: 0 0 15px ${game.themeColor};">Play Now</button>`;

        const cardHTML = `
            <div class="carousel-card bg-black/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center text-center" style="border: 2px solid ${game.themeColor}; box-shadow: 0 0 10px ${game.themeColor}, inset 0 0 10px ${game.themeColor};">
                <div class="image-bounding-box mb-4 flex justify-center items-center">
                    ${imageHTML}
                </div>
                <h3 class="text-2xl font-black mb-2 font-mono" style="color: ${game.themeColor};">${game.title}</h3>
                <p class="text-slate-300 text-sm mb-6 flex-1">${game.description}</p>
                ${btnHTML}
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Run it immediately
renderCarousel();

// ==========================================
// 3. MUSIC & IDEAS ENGINE
// ==========================================
// (Kept standard Synth for safety, but looks for assets.js file if provided)
let audioPlayer = null;

window.ArcadeAPI = {
    toggleMenuMusic: () => {
        const btn = document.getElementById('btnToggleMusic');
        
        if (window.ROOT_ASSETS.menuMusicFile) {
            // Use real MP3 if provided
            if(!audioPlayer) {
                audioPlayer = new Audio(window.ROOT_ASSETS.menuMusicFile);
                audioPlayer.loop = true;
            }
            if(audioPlayer.paused) {
                audioPlayer.play();
                btn.innerText = "🔇 Disable Arcade Music";
            } else {
                audioPlayer.pause();
                btn.innerText = "🎵 Enable Arcade Music";
            }
        } else {
            alert("No music file configured in assets.js! Add one to hear tunes.");
        }
    },
    showAdminIdeas: async () => {
        const pwd = prompt("Enter Admin Password:");
        if(pwd !== "dogs123") {
            if(pwd !== null) alert("Incorrect Password! Access Denied. 🛑");
            return;
        }
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
        if(confirm("⚠️ WARNING ⚠️\nThis will permanently delete all local high scores, unlocked skins, and profiles on this specific iPad/computer. \n\nAre you absolutely sure?")) {
            localStorage.clear();
            alert("☢️ Local Data Nuked. Refreshing page...");
            window.location.reload();
        }
    }
};
