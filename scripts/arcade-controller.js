// ==========================================
// 1. RENDER THE GRID
// ==========================================
function renderArcade() {
    // Target the existing div but change its classes to use our new grid system
    const container = document.getElementById('game-carousel'); 
    container.className = "game-grid-container w-full max-w-4xl px-4 mb-10"; 
    container.innerHTML = ""; 

    window.ARCADE_GAMES.forEach(game => {
        // Pro Fix: Clean, crash-proof image handling
        let imageContent;
        if (game.coverArt && game.coverArt.trim() !== "") {
            // If image link dies, silently replace the entire box with the emoji
            imageContent = `<img src="${game.coverArt}" alt="${game.title}" onerror="this.parentElement.innerHTML='<div class=\\'text-6xl\\'>${game.emoji}</div>';">`;
        } else {
            imageContent = `<div class="text-6xl">${game.emoji}</div>`;
        }

        const actionButton = game.disabled 
            ? `<button disabled class="w-full py-3 bg-slate-800 text-slate-500 font-black text-xl rounded-xl uppercase tracking-wider cursor-not-allowed">Coming Soon</button>`
            : `<button onclick="window.location.href='${game.folder}/index.html'" class="w-full py-3 ${game.buttonColor} hover:brightness-110 text-black font-black text-xl rounded-xl transition-all active:scale-95 uppercase tracking-wider" style="box-shadow: 0 0 15px ${game.themeColor};">Play Now</button>`;

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