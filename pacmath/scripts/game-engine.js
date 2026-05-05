// ==========================================
// PAC-MATH GAME ENGINE (Main Controller)
// ==========================================

(function() {
    const dbPM = window.globalDb;
    const Audio = window.PacMathAudio;
    const MathEngine = window.PacMathEngine;
    const Settings = window.PacSettings;
    const Skins = window.PacSkins;
    const Entities = window.PacEntities;

    const isGhostMode = localStorage.getItem('isTeacherTesting') === 'true';
    let godMode = false;

    let pacMap = [];
    let animationId = null;
    let ghostHunterTimer = null;
    let lastEatTime = 0;
    let deathFrame = 0;
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    window.PacGameInterface = {
        engineState: 'stopped',
        nextVx: 0,
        nextVy: 0,
        selectedSpeed: 2,
        currentLevel: 'classic',

        addScore(pts) { 
            MathEngine.addScore(pts); 
        },

        spawnGhost(type) {
            let s = this.selectedSpeed; 
            let gSpd = (s === 1) ? 1 : s / 2;
            if (type === 'wanderer') {
                Entities.ghosts.push({ x: 190, y: 230, tX: 190, tY: 230, vx: -1, vy: 0, spd: gSpd, baseSpd: gSpd, c: '#FFB8FF', type: 'wanderer', state: 'normal' });
            } else if (type === 'tracker') {
                Entities.ghosts.push({ x: 190, y: 150, tX: 190, tY: 150, vx: 1, vy: 0, spd: gSpd, baseSpd: gSpd, c: 'red', type: 'tracker', state: 'normal' });
            }
        },

        startGame() {
            Audio.init();
            pacMap = JSON.parse(JSON.stringify(this.currentLevel === 'underwater' ? window.PACMATH_UNDERWATER_MAP : window.PACMATH_BASE_MAP));
            Entities.reset(this.selectedSpeed);
            this.nextVx = 0;
            this.nextVy = 0;
            this.engineState = 'starting';
            document.getElementById('heartContainer').style.display = 'block';
            
            const msg = document.getElementById('startupMsg');
            const txt = document.getElementById('startupText');
            if (msg && txt) {
                msg.classList.remove('hidden');
                txt.innerText = "READY!";
            }
            
            Audio.playGameStart();
            Audio.playBGM(this.currentLevel);
            
            let hasStarted = false;
            const finishStart = () => {
                if(hasStarted) return;
                hasStarted = true;
                if (txt) txt.innerText = "GOOD LUCK!";
                setTimeout(() => {
                    if (msg) msg.classList.add('hidden');
                    this.engineState = 'running';
                }, 1000);
            };

            if (Audio.startSnd) {
                Audio.startSnd.onended = finishStart;
            }
            setTimeout(finishStart, 4500); // Fallback

            if (!animationId) this.loop();
        },

        stopLoop() {
            this.engineState = 'stopped';
            cancelAnimationFrame(animationId);
            animationId = null;
        },

        triggerGameOver(won = false) {
            this.engineState = 'stopped';
            Audio.setMusicVolume('review');
            document.getElementById('endTitle').innerText = won ? "YOU WIN!" : "GAME OVER";
            document.getElementById('endTitle').style.color = won ? "#00FF00" : "#FF3333";
            document.getElementById('endScore').innerText = MathEngine.score;
            this.generateReportCard();
            document.getElementById('endScreen').classList.remove('hidden');
            document.getElementById('heartContainer').style.display = 'none';
            
            if (isGhostMode) {
                console.log("👻 Ghost Mode: Score not saved to cloud.");
                return;
            }

            setTimeout(async () => {
                let qualify = false;
                try {
                    const snap = await dbPM.collection("highScores").orderBy("score", "desc").limit(5).get();
                    const scores = snap.docs.map(d => d.data().score);
                    if (scores.length < 5 || MathEngine.score > scores[scores.length - 1]) qualify = true;
                } catch(e) {
                    if (Settings.highScores.length < 5 || MathEngine.score > Settings.highScores[Settings.highScores.length - 1].score) qualify = true;
                }
                
                if (qualify && MathEngine.score > 0) {
                    const pN = prompt("Great job! You made the Top 5! Enter your name for the CLASS leaderboard:") || "Player";
                    try {
                        await dbPM.collection("highScores").add({
                            name: pN,
                            score: MathEngine.score,
                            date: new Date().toLocaleDateString(),
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (e) {
                        Settings.highScores.push({ name: pN, score: MathEngine.score });
                        Settings.highScores.sort((a, b) => b.score - a.score);
                        Settings.highScores = Settings.highScores.slice(0, 5);
                        Settings.save();
                    }
                }
            }, 500);
        },

        triggerSkinPopup(t, s) {
            Audio.stopEatPellet();
            this.engineState = 'paused';
            Audio.setMusicVolume('paused');
            Audio.playLevelUp();
            document.getElementById('skinUnlockTitle').innerText = t;
            document.getElementById('unlockedSkinName').innerText = s;
            document.getElementById('skinUnlockModal').classList.remove('hidden');
        },

        triggerGhostHunterMode() {
            this.engineState = 'running';
            Audio.setMusicVolume('playing');
            Entities.ghosts.forEach(g => {
                g.state = 'blue';
                g.spd = 1;
            });
            clearTimeout(ghostHunterTimer);
            ghostHunterTimer = setTimeout(() => {
                Entities.ghosts.forEach(g => {
                    if (g.state === 'blue') {
                        g.state = 'normal';
                        g.spd = g.baseSpd;
                    }
                });
            }, 10000);
        },

        resumeGame(s, gS = false) {
            this.engineState = 'running';
            Audio.setMusicVolume('playing');
            if (gS) Entities.pac.invinc = 150;
            Entities.ghosts.forEach(g => {
                if (g.state === 'normal') {
                    g.x = 190;
                    g.y = (g.type === 'tracker') ? 150 : 230;
                    g.tX = 190;
                    g.tY = g.y;
                    g.vx = (g.type === 'tracker') ? 1 : -1;
                    g.vy = 0;
                }
            });
        },

        loop() {
            if (window.PacGameInterface.engineState === 'running' || window.PacGameInterface.engineState === 'dying') {
                window.PacGameInterface.pacUpdate();
            }
            window.PacGameInterface.pacDraw();
            if (window.PacGameInterface.engineState !== 'stopped') {
                animationId = requestAnimationFrame(() => window.PacGameInterface.loop());
            }
        },

        pacUpdate() {
            if (this.engineState === 'dying') {
                deathFrame++;
                if (deathFrame > 90) { // Approx 1.5s
                    this.triggerGameOver(false);
                }
                return;
            }
            if (this.engineState !== 'running') return;

            if (Date.now() - lastEatTime > 200) {
                Audio.stopEatPellet();
            }

            Entities.moveEnt(Entities.pac, true, pacMap);
            Entities.ghosts.forEach(g => Entities.moveEnt(g, false, pacMap));
            
            if (Entities.pac.invinc > 0) Entities.pac.invinc--;
            if (Entities.pac.vx !== 0 || Entities.pac.vy !== 0) {
                Entities.pac.mO += 0.05 * Entities.pac.mD;
                if (Entities.pac.mO >= 0.3 || Entities.pac.mO <= 0) Entities.pac.mD *= -1;
            }

            Entities.ghosts.forEach((g, i) => {
                if (Math.hypot(Entities.pac.x - g.x, Entities.pac.y - g.y) < Entities.pac.r * 1.8) {
                    if (g.state === 'blue') {
                        Audio.playEatGhost();
                        this.addScore(200);
                        g.state = 'eaten';
                        g.x = -100;
                        g.tX = -100;
                    } else if (g.state === 'normal' && Entities.pac.invinc <= 0 && !godMode) {
                        MathEngine.hearts--;
                        this.updateHeartsUI();
                        Audio.stopEatPellet();
                        if (MathEngine.hearts <= 0) {
                            this.engineState = 'dying';
                            deathFrame = 0;
                            Audio.setMusicVolume('paused');
                            Audio.playDeath();
                        } else {
                            Audio.playDamage();
                            this.resumeGame(false, true);
                        }
                    }
                }
            });

            let gX = Math.floor(Entities.pac.x / window.PACMATH_TILE_SIZE);
            let gY = Math.floor(Entities.pac.y / window.PACMATH_TILE_SIZE);
            if (gY >= 0 && gY < pacMap.length && gX >= 0 && gX < pacMap[0].length) {
                let item = pacMap[gY][gX];
                if (item === 0) {
                    pacMap[gY][gX] = 2;
                    lastEatTime = Date.now();
                    Audio.playEatPellet(true);
                    this.addScore(10);
                } else if (item === 3) {
                    pacMap[gY][gX] = 2;
                    MathEngine.processPowerUp(false);
                } else if (item === 4) {
                    pacMap[gY][gX] = 2;
                    MathEngine.processPowerUp(true);
                }
            }

            let dL = false;
            for (let r = 0; r < pacMap.length; r++) {
                for (let c = 0; c < pacMap[r].length; c++) {
                    if (pacMap[r][c] === 0 || pacMap[r][c] === 3 || pacMap[r][c] === 4) dL = true;
                }
            }
            if (!dL) this.triggerGameOver(true);
        },

        pacDraw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (pacMap.length === 0) return;
            
            const tileSize = window.PACMATH_TILE_SIZE;
            for (let r = 0; r < pacMap.length; r++) {
                for (let c = 0; c < pacMap[r].length; c++) {
                    let cell = pacMap[r][c];
                    if (cell === 1) {
                        ctx.fillStyle = this.currentLevel === 'underwater' ? '#003366' : '#1919A6';
                        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                        ctx.fillStyle = this.currentLevel === 'underwater' ? '#0066cc' : 'black';
                        ctx.fillRect(c * tileSize + 2, r * tileSize + 2, tileSize - 4, tileSize - 4);
                    } else if (cell === 0) {
                        ctx.fillStyle = this.currentLevel === 'underwater' ? '#aaddff' : '#FFB8AE';
                        ctx.beginPath();
                        ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 3, 0, Math.PI * 2);
                        ctx.fill();
                        if (this.currentLevel === 'underwater') {
                            ctx.fillStyle = 'rgba(255,255,255,0.5)';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2 - 1, r * tileSize + tileSize / 2 - 1, 1, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    } else if (cell === 3) {
                        if (this.currentLevel === 'underwater') {
                            ctx.fillStyle = '#8e44ad';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2 + 2, 8, 0, Math.PI, true);
                            ctx.fill();
                            ctx.fillStyle = '#e056fd';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2 + 2, 8, 0, Math.PI, false);
                            ctx.fill();
                            ctx.fillStyle = 'white';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 4, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            ctx.fillStyle = '#00FF00';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 6, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    } else if (cell === 4) {
                        if (this.currentLevel === 'underwater') {
                            ctx.fillStyle = '#eb4d4b';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2 + 2, 10, 0, Math.PI, true);
                            ctx.fill();
                            ctx.fillStyle = '#ff7979';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2 + 2, 10, 0, Math.PI, false);
                            ctx.fill();
                            ctx.fillStyle = (Date.now() % 400 < 200) ? 'red' : 'gold';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 5, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            ctx.fillStyle = (Date.now() % 400 < 200) ? 'red' : 'white';
                            ctx.beginPath();
                            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 9, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }

            if (this.currentLevel === 'underwater') {
                const numBubbles = 10;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                for (let i = 0; i < numBubbles; i++) {
                    let bx = (Date.now() / 20 + i * 50) % canvas.width;
                    let by = canvas.height - ((Date.now() / 30 + i * 100) % canvas.height);
                    ctx.beginPath();
                    ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.strokeStyle = 'rgba(46, 204, 113, 0.6)';
                ctx.lineWidth = 4;
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    let px = 30 + i * 70;
                    ctx.moveTo(px, canvas.height);
                    ctx.quadraticCurveTo(px + Math.sin(Date.now()/500 + i)*10, canvas.height - 20, px, canvas.height - 40);
                    ctx.stroke();
                }
            }

            Entities.ghosts.forEach(g => {
                if (g.state === 'eaten') return;
                let isUW = this.currentLevel === 'underwater';
                ctx.fillStyle = g.state === 'blue' ? '#3399FF' : (isUW ? 'rgba(232, 67, 147, 0.8)' : g.c);
                
                if (isUW) {
                    ctx.beginPath();
                    ctx.arc(g.x, g.y, Entities.pac.r, Math.PI, 0);
                    ctx.fill();
                    ctx.strokeStyle = ctx.fillStyle;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(g.x - 5, g.y); ctx.lineTo(g.x - 5 + Math.sin(Date.now()/200)*3, g.y + 10);
                    ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + Math.sin(Date.now()/200 + 1)*3, g.y + 12);
                    ctx.moveTo(g.x + 5, g.y); ctx.lineTo(g.x + 5 + Math.sin(Date.now()/200 + 2)*3, g.y + 10);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(g.x, g.y, Entities.pac.r, Math.PI, 0);
                    ctx.lineTo(g.x + Entities.pac.r, g.y + Entities.pac.r);
                    ctx.lineTo(g.x + Entities.pac.r / 2, g.y + Entities.pac.r / 2);
                    ctx.lineTo(g.x, g.y + Entities.pac.r);
                    ctx.lineTo(g.x - Entities.pac.r / 2, g.y + Entities.pac.r / 2);
                    ctx.lineTo(g.x - Entities.pac.r, g.y + Entities.pac.r);
                    ctx.fill();
                }
                
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(g.x - 3, g.y - 2, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(g.x + 3, g.y - 2, 2, 0, Math.PI * 2);
                ctx.fill();
                if (g.state === 'blue') {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(g.x - 5, g.y + 4, 10, 2);
                }
            });

            if (this.engineState === 'dying') {
                const shrink = Math.max(0, 1 - deathFrame / 90);
                const oldR = Entities.pac.r;
                Entities.pac.r = oldR * shrink;
                Entities.pac.a += 0.2; // Spin effect
                Skins.drawCharacter(ctx, Entities.pac);
                Entities.pac.r = oldR;
            } else if (Entities.pac.invinc % 10 < 5) {
                Skins.drawCharacter(ctx, Entities.pac);
            }
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('SCORE: ' + MathEngine.score, 10, 20);
        },

        updateHeartsUI() {
            let s = "";
            for (let i = 0; i < window.PACMATH_CONFIG.maxHearts; i++) {
                s += (i < MathEngine.hearts) ? "❤️" : "🖤";
            }
            const hc = document.getElementById('heartContainer');
            if (hc) hc.innerText = s;
        },

        generateReportCard() {
            const l = document.getElementById('mistakesList');
            if (!l) return;
            l.innerHTML = "";
            if (MathEngine.mistakes.length === 0) {
                l.innerHTML = "<div style='color: #00FF00;'>Perfect! No mistakes!</div>";
            } else {
                MathEngine.mistakes.forEach(m => {
                    l.innerHTML += `<div class='mistake-item'><div>${m.q}</div><div>You said: <span class='wrong'>${m.wrong}</span></div><div>Correct: <span class='right'>${m.right}</span></div></div>`;
                });
            }
        }
    };

    function attachUI(id, h) {
        const el = document.getElementById(id);
        if (!el) return;
        let p = false;
        el.addEventListener('touchstart', (e) => {
            p = true;
            el.classList.add('active-touch');
        });
        el.addEventListener('touchend', (e) => {
            if (!p) return;
            p = false;
            el.classList.remove('active-touch');
            h(e);
        });
        el.addEventListener('click', (e) => {
            e.preventDefault();
            h(e);
        });
    }

    // Preview logic
    const pC = document.getElementById('previewCanvas');
    const prevCtx = pC ? pC.getContext('2d') : null;
    function drawPreview() {
        if (!prevCtx) return;
        prevCtx.clearRect(0, 0, 100, 100);
        let prevP = { x: 50, y: 50, r: 20, mO: 0.15 + Math.sin(Date.now() / 150) * 0.1, a: 0 };
        Skins.drawCharacter(prevCtx, prevP);
        if (document.getElementById('customizeMenu').classList.contains('hidden')) return;
        requestAnimationFrame(drawPreview);
    }

    // UI Bindings
    attachUI('btnUp', () => { if (window.PacGameInterface.engineState === 'running') { window.PacGameInterface.nextVx = 0; window.PacGameInterface.nextVy = -1; } });
    attachUI('btnDown', () => { if (window.PacGameInterface.engineState === 'running') { window.PacGameInterface.nextVx = 0; window.PacGameInterface.nextVy = 1; } });
    attachUI('btnLeft', () => { if (window.PacGameInterface.engineState === 'running') { window.PacGameInterface.nextVx = -1; window.PacGameInterface.nextVy = 0; } });
    attachUI('btnRight', () => { if (window.PacGameInterface.engineState === 'running') { window.PacGameInterface.nextVx = 1; window.PacGameInterface.nextVy = 0; } });

    window.addEventListener('keydown', (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
        if (window.PacGameInterface.engineState === 'running') {
            if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') { window.PacGameInterface.nextVx = 0; window.PacGameInterface.nextVy = -1; }
            if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') { window.PacGameInterface.nextVx = 0; window.PacGameInterface.nextVy = 1; }
            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') { window.PacGameInterface.nextVx = -1; window.PacGameInterface.nextVy = 0; }
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') { window.PacGameInterface.nextVx = 1; window.PacGameInterface.nextVy = 0; }
        }
    });

    attachUI('btnCustomize', () => { Audio.init(); document.getElementById('mainMenu').classList.add('hidden'); document.getElementById('customizeMenu').classList.remove('hidden'); drawPreview(); });
    attachUI('btnCloseCustomize', () => { document.getElementById('customizeMenu').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('hidden'); });
    attachUI('btnContinueGame', () => { document.getElementById('skinUnlockModal').classList.add('hidden'); window.PacGameInterface.resumeGame(true); });
    attachUI('btnPlay', () => { Audio.init(); document.getElementById('mainMenu').classList.add('hidden'); document.getElementById('levelMenu').classList.remove('hidden'); });
    attachUI('btnBackToMainFromLevel', () => { document.getElementById('levelMenu').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('hidden'); });

    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.classList.contains('locked')) {
                alert("This level is locked! Follow the requirements to unlock it.");
                return;
            }
            window.PacGameInterface.currentLevel = btn.getAttribute('data-level');
            document.getElementById('levelMenu').classList.add('hidden');
            document.getElementById('modeMenu').classList.remove('hidden');
        });
    });
    
    const showCloudLeaderboard = async () => {
        const list = document.getElementById('scoresList');
        list.innerHTML = "<div style='text-align:center'>Loading class scores...</div>";
        try {
            const snap = await dbPM.collection("highScores").orderBy("score", "desc").limit(5).get();
            const cS = snap.docs.map(d => d.data());
            list.innerHTML = cS.length ? "" : "<div style='text-align:center'>No scores yet!</div>";
            cS.forEach((s, i) => {
                list.innerHTML += `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #444;padding:5px 0;"><span>${i + 1}. ${s.name}</span><span style="color:yellow;">${s.score}</span></div>`;
            });
        } catch (e) { list.innerHTML = "<div style='text-align:center; color:red;'>Cloud Error.</div>"; }
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('endScreen').classList.add('hidden');
        document.getElementById('scoresMenu').classList.remove('hidden');
    };

    attachUI('btnScores', showCloudLeaderboard);
    attachUI('btnViewScoresFromEnd', showCloudLeaderboard);
    attachUI('btnCloseScores', () => { document.getElementById('scoresMenu').classList.add('hidden'); if (MathEngine.hearts <= 0) document.getElementById('endScreen').classList.remove('hidden'); else document.getElementById('mainMenu').classList.remove('hidden'); });
    attachUI('btnHowTo', () => { document.getElementById('mainMenu').classList.add('hidden'); document.getElementById('howToMenu').classList.remove('hidden'); });
    attachUI('btnCloseHowTo', () => { document.getElementById('howToMenu').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('hidden'); });
    attachUI('btnBackToMain', () => { document.getElementById('modeMenu').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('hidden'); });
    
    attachUI('btnArcadeReturn', () => { window.location.href = '../index.html'; });
    attachUI('btnArcadeReturnEnd', () => { window.location.href = '../index.html'; });

    document.querySelectorAll('#pacmath-root .color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let val = btn.getAttribute('data-color');
            let isL = btn.classList.contains('locked');
            const cB = document.getElementById('btnCloseCustomize');
            const mB = document.getElementById('unlockMsg');
            document.querySelectorAll('#pacmath-root .color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (['hard', 'expert', 'god', 'scuba'].includes(val)) {
                Skins.pacStyle.special = val;
                Skins.pacStyle.color = (val === 'hard' ? '#00CCFF' : val === 'expert' ? '#FF3333' : val === 'scuba' ? '#1e90ff' : 'gold');
            } else {
                Skins.pacStyle.color = val;
                Skins.pacStyle.special = 'none';
            }
            if (isL) {
                cB.disabled = true;
                if (val === 'scuba') {
                    mB.innerText = `LOCKED: Score 2000pts in Deep Sea to equip!`;
                } else {
                    mB.innerText = `LOCKED: Reach ${val.toUpperCase()} pts to equip!`;
                }
            } else {
                cB.disabled = false;
                mB.innerText = "";
            }
        });
    });

    document.querySelectorAll('#pacmath-root .acc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#pacmath-root .acc-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Skins.pacStyle.bow = (btn.getAttribute('data-acc') === 'bow');
        });
    });

    document.querySelectorAll('#pacmath-root .subject-btn').forEach(btn => {
        if (btn.classList.contains('level-btn')) return; // Ignore level buttons
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            MathEngine.subject = btn.getAttribute('data-subject');
            document.getElementById('modeMenu').classList.add('hidden');
            document.getElementById('speedMenu').classList.remove('hidden');
        });
    });

    document.querySelectorAll('#pacmath-root .speed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.PacGameInterface.selectedSpeed = parseInt(btn.getAttribute('data-speed'));
            MathEngine.reset(window.PACMATH_CONFIG.maxHearts);
            window.PacGameInterface.updateHeartsUI();
            document.getElementById('speedMenu').classList.add('hidden');
            window.PacGameInterface.startGame();
        });
    });

    document.querySelectorAll('#pacmath-root .btnMenuReturn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('endScreen').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
            document.getElementById('heartContainer').style.display = 'none';
            Audio.setMusicVolume('menu');
            window.PacGameInterface.stopLoop();
        });
    });

    Settings.load();

    // Ghost Mode Logic
    if (isGhostMode) {
        document.getElementById('ghost-tools-container').classList.remove('hidden');
        
        attachUI('ghost-toggle-btn', () => {
            const menu = document.getElementById('ghost-menu');
            menu.classList.toggle('hidden');
        });

        attachUI('ghost-btn-invinc', (e) => {
            godMode = !godMode;
            e.target.innerText = godMode ? "GOD MODE: ON" : "Toggle God Mode";
            e.target.classList.toggle('bg-purple-800', godMode);
            e.target.classList.toggle('bg-purple-600', !godMode);
        });

        attachUI('ghost-btn-score', () => {
            window.PacGameInterface.addScore(1000);
            Audio.playLevelUp();
        });

        attachUI('ghost-btn-unlock', () => {
            Settings.unlocks.hard = true;
            Settings.unlocks.expert = true;
            Settings.unlocks.god = true;
            Settings.save();
            Settings.load(); // Refresh UI
            Audio.playCameoFanfare();
            alert("🔓 All skins unlocked (local save only)!");
        });

        attachUI('ghost-btn-disable', () => {
            if (confirm("Disable Ghost Mode and reload?")) {
                localStorage.removeItem('isTeacherTesting');
                window.location.reload();
            }
        });
    }
})();