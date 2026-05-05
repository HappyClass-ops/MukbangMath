// ==========================================
// PAC-MATH SETTINGS & PROGRESS
// ==========================================

window.PacSettings = {
    unlocks: { hard: false, expert: false, god: false, deepSea: false, scuba: false },
    highScores: [],

    save() {
        localStorage.setItem('pacMath_saveData', JSON.stringify({ 
            unlocks: this.unlocks, 
            highScores: this.highScores 
        }));
    },

    load() {
        try {
            const saved = localStorage.getItem('pacMath_saveData');
            if (saved) {
                const p = JSON.parse(saved);
                this.unlocks = p.unlocks || this.unlocks;
                this.highScores = p.highScores || [];
                
                const sH = document.getElementById('skinHard');
                const sE = document.getElementById('skinExpert');
                const sG = document.getElementById('skinGod');
                const sS = document.getElementById('skinScuba');
                const lDS = document.getElementById('levelDeepSea');
                
                if (this.unlocks.hard && sH) { sH.classList.remove('locked'); sH.style.backgroundColor = '#00CCFF'; }
                if (this.unlocks.expert && sE) { sE.classList.remove('locked'); sE.style.backgroundColor = '#FF3333'; }
                if (this.unlocks.god && sG) { sG.classList.remove('locked'); sG.style.backgroundColor = 'gold'; }
                if (this.unlocks.scuba && sS) { sS.classList.remove('locked'); sS.style.backgroundColor = '#1e90ff'; }
                if (this.unlocks.deepSea && lDS) { 
                    lDS.classList.remove('locked'); 
                    lDS.innerText = '🌊 Deep Sea Level'; 
                    lDS.style.backgroundColor = '#0066cc'; 
                    lDS.style.borderColor = 'white';
                }
            }
        } catch (e) {
            console.error("Failed to load progress:", e);
        }
    }
};
