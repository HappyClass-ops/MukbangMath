/**
 * PAC-MATH GAME ENGINE
 * Main game loop, canvas rendering, and game state management
 */

const gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    level: 1,
    lives: 3,
    currentSubject: null,
    currentSpeed: 2,
    pacman: null,
    ghosts: [],
    dots: [],
    powerUps: [],
    challengeDots: [],
    canvas: null,
    ctx: null,
    gameLoopId: null,
    ghostSpawnTimer: 0,
    currentQuestion: null
};

const PacMathGame = {
    init: function() {
        gameState.canvas = document.getElementById('gameCanvas');
        gameState.ctx = gameState.canvas.getContext('2d');
        this.setupEventListeners();
        this.showMainMenu();
    },

    setupEventListeners: function() {
        document.getElementById('btnPlay').addEventListener('click', () => this.showModeMenu());
        document.getElementById('btnCustomize').addEventListener('click', () => this.showCustomizeMenu());
        document.getElementById('btnHowTo').addEventListener('click', () => this.showHowToMenu());
        document.getElementById('btnScores').addEventListener('click', () => this.showHighScores());
        document.getElementById('btnArcadeReturn').addEventListener('click', () => window.location.href = '../index.html');
        document.getElementById('btnCloseCustomize').addEventListener('click', () => this.showMainMenu());
        document.getElementById('btnCloseHowTo').addEventListener('click', () => this.showMainMenu());
        document.getElementById('btnBackToMain').addEventListener('click', () => this.showMainMenu());
        document.getElementById('btnBackToMode').addEventListener('click', () => this.showModeMenu());
        document.getElementById('btnContinueGame').addEventListener('click', () => this.resumeGame());
        document.getElementById('btnRetry').addEventListener('click', () => this.startGame());
        document.getElementById('btnMainMenu').addEventListener('click', () => this.showMainMenu());

        // Subject selection
        document.querySelectorAll('.subject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                gameState.currentSubject = e.target.dataset.subject;
                this.showSpeedMenu();
            });
        });

        // Speed selection
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                gameState.currentSpeed = parseInt(e.target.dataset.speed);
                this.startGame();
            });
        });

        // Skin selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectSkin(btn.dataset.color));
        });

        // Accessory selection
        document.querySelectorAll('.acc-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectAccessory(btn.dataset.acc));
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },

    showMainMenu: function() {
        this.hideAllMenus();
        document.getElementById('mainMenu').classList.remove('hidden');
        gameState.isRunning = false;
    },

    showModeMenu: function() {
        this.hideAllMenus();
        document.getElementById('modeMenu').classList.remove('hidden');
    },

    showSpeedMenu: function() {
        this.hideAllMenus();
        document.getElementById('speedMenu').classList.remove('hidden');
    },

    showCustomizeMenu: function() {
        this.hideAllMenus();
        document.getElementById('customizeMenu').classList.remove('hidden');
        this.drawPreview();
    },

    showHowToMenu: function() {
        this.hideAllMenus();
        document.getElementById('howToMenu').classList.remove('hidden');
    },

    showHighScores: function() {
        const scores = JSON.parse(localStorage.getItem('pacmath_scores') || '[]');
        alert(`🏆 HIGH SCORES 🏆\n\n${scores.map((s, i) => `${i+1}. Level ${s.level} - ${s.score} pts`).join('\n') || 'No scores yet! Start playing!'}`);
    },

    hideAllMenus: function() {
        document.querySelectorAll('.overlay').forEach(menu => menu.classList.add('hidden'));
    },

    startGame: function() {
        this.hideAllMenus();
        gameState.isRunning = true;
        gameState.isPaused = false;
        gameState.score = 0;
        gameState.level = 1;
        gameState.lives = 3;
        gameState.pacman = new PacMan(gameState.canvas.width / 2, gameState.canvas.height / 2);
        gameState.ghosts = this.spawnGhosts();
        this.generateLevel();
        this.updateHearts();
        this.gameLoop();
    },

    resumeGame: function() {
        gameState.isPaused = false;
        document.getElementById('skinUnlockModal').classList.add('hidden');
        this.gameLoop();
    },

    generateLevel: function() {
        gameState.dots = [];
        gameState.powerUps = [];
        gameState.challengeDots = [];

        const gridSize = 20;
        for (let x = 0; x < gameState.canvas.width; x += gridSize) {
            for (let y = 0; y < gameState.canvas.height; y += gridSize) {
                const rand = Math.random();
                if (rand < 0.7) {
                    gameState.dots.push({ x: x + gridSize / 2, y: y + gridSize / 2, radius: 3, eaten: false });
                } else if (rand < 0.9) {
                    gameState.powerUps.push({ x: x + gridSize / 2, y: y + gridSize / 2, radius: 6, eaten: false });
                } else {
                    gameState.challengeDots.push({ 
                        x: x + gridSize / 2, 
                        y: y + gridSize / 2, 
                        radius: 8, 
                        eaten: false,
                        question: generateMathProblem(gameState.currentSubject, gameState.level)
                    });
                }
            }
        }
    },

    spawnGhosts: function() {
        const ghosts = [];
        const GHOST_CONFIG = PACMATH_CONSTANTS.GHOSTS;
        for (let i = 0; i < Math.min(2 + gameState.level, 5); i++) {
            ghosts.push(new Ghost(
                GHOST_CONFIG[i % GHOST_CONFIG.length].x,
                GHOST_CONFIG[i % GHOST_CONFIG.length].y,
                GHOST_CONFIG[i % GHOST_CONFIG.CONFIG.length].color
            ));
        }
        return ghosts;
    },

    gameLoop: function() {
        if (!gameState.isRunning) return;
        if (gameState.isPaused) {
            gameState.gameLoopId = requestAnimationFrame(() => this.gameLoop());
            return;
        }

        // Clear canvas
        gameState.ctx.fillStyle = '#000';
        gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

        // Update and render
        this.updateGame();
        this.renderGame();
        this.checkCollisions();

        gameState.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    },

    updateGame: function() {
        gameState.pacman.update();
        gameState.ghosts.forEach(ghost => ghost.update(gameState.pacman, gameState.currentSpeed));
        gameState.ghostSpawnTimer++;
    },

    renderGame: function() {
        // Render dots
        gameState.ctx.fillStyle = '#FFD700';
        gameState.dots.forEach(dot => {
            if (!dot.eaten) {
                gameState.ctx.beginPath();
                gameState.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                gameState.ctx.fill();
            }
        });

        // Render power-ups
        gameState.ctx.fillStyle = '#00FF00';
        gameState.powerUps.forEach(pu => {
            if (!pu.eaten) {
                gameState.ctx.beginPath();
                gameState.ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
                gameState.ctx.fill();
            }
        });

        // Render challenge dots
        gameState.ctx.fillStyle = '#FF3333';
        gameState.challengeDots.forEach(cd => {
            if (!cd.eaten) {
                gameState.ctx.beginPath();
                gameState.ctx.arc(cd.x, cd.y, cd.radius, 0, Math.PI * 2);
                gameState.ctx.fill();
            }
        });

        // Render PacMan
        gameState.pacman.render(gameState.ctx);

        // Render ghosts
        gameState.ghosts.forEach(ghost => ghost.render(gameState.ctx));
    },

    checkCollisions: function() {
        const COLLISION_DIST = 20;

        // Check dot collisions
        gameState.dots.forEach(dot => {
            if (!dot.eaten && this.distance(gameState.pacman, dot) < COLLISION_DIST) {
                dot.eaten = true;
                gameState.score += 10;
            }
        });

        // Check power-up collisions
        gameState.powerUps.forEach(pu => {
            if (!pu.eaten && this.distance(gameState.pacman, pu) < COLLISION_DIST) {
                pu.eaten = true;
                gameState.score += 50;
                gameState.pacman.invincible = true;
                setTimeout(() => gameState.pacman.invincible = false, 5000);
            }
        });

        // Check challenge dot collisions
        gameState.challengeDots.forEach(cd => {
            if (!cd.eaten && this.distance(gameState.pacman, cd) < COLLISION_DIST) {
                cd.eaten = true;
                gameState.currentQuestion = cd.question;
                this.showChallenge(cd.question);
                gameState.isPaused = true;
            }
        });

        // Check ghost collisions
        gameState.ghosts.forEach(ghost => {
            if (this.distance(gameState.pacman, ghost) < COLLISION_DIST) {
                if (gameState.pacman.invincible) {
                    ghost.reset();
                    gameState.score += 200;
                } else {
                    gameState.lives--;
                    this.updateHearts();
                    if (gameState.lives <= 0) {
                        this.endGame();
                    } else {
                        gameState.pacman.reset();
                    }
                }
            }
        });
    },

    showChallenge: function(question) {
        const answer = prompt(`Math Challenge!\n\n${question.question}\n\nChoose answer: ${question.options.join(' / ')}`);
        if (answer === question.answer) {
            gameState.score += 100;
            alert('🎉 Correct! +100 points!');
        } else {
            alert(`❌ Wrong! The answer was ${question.answer}`);
            gameState.lives--;
            this.updateHearts();
            if (gameState.lives <= 0) {
                this.endGame();
                return;
            }
        }
        gameState.isPaused = false;
        this.gameLoop();
    },

    updateHearts: function() {
        document.getElementById('heartContainer').textContent = '❤️'.repeat(gameState.lives);
    },

    endGame: function() {
        gameState.isRunning = false;
        const scores = JSON.parse(localStorage.getItem('pacmath_scores') || '[]');
        scores.push({ level: gameState.level, score: gameState.score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('pacmath_scores', JSON.stringify(scores.slice(0, 10)));

        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('finalLevel').textContent = gameState.level;
        setTimeout(() => {
            this.hideAllMenus();
            document.getElementById('gameOverScreen').classList.remove('hidden');
        }, 500);
    },

    handleKeyDown: function(e) {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        switch(e.key) {
            case 'ArrowUp': gameState.pacman.setDirection(0, -gameState.currentSpeed); break;
            case 'ArrowDown': gameState.pacman.setDirection(0, gameState.currentSpeed); break;
            case 'ArrowLeft': gameState.pacman.setDirection(-gameState.currentSpeed, 0); break;
            case 'ArrowRight': gameState.pacman.setDirection(gameState.currentSpeed, 0); break;
        }
    },

    selectSkin: function(color) {
        if (color === 'hard' && gameState.level < 5) {
            document.getElementById('unlockMsg').textContent = '🔒 Unlock at Level 5';
            return;
        }
        if (color === 'expert' && gameState.level < 10) {
            document.getElementById('unlockMsg').textContent = '🔒 Unlock at Level 10';
            return;
        }
        if (color === 'god' && gameState.level < 20) {
            document.getElementById('unlockMsg').textContent = '🔒 Unlock at Level 20';
            return;
        }

        localStorage.setItem('pacmath_skin', color);
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.drawPreview();
    },

    selectAccessory: function(acc) {
        localStorage.setItem('pacmath_accessory', acc);
        document.querySelectorAll('.acc-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.drawPreview();
    },

    drawPreview: function() {
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pacman = new PacMan(canvas.width / 2, canvas.height / 2);
        pacman.render(ctx);
    },

    distance: function(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    PacMathGame.init();
});