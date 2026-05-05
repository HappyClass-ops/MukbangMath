// ==========================================
// PAC-MATH ASSETS (Audio & Images)
// ==========================================

window.PACMATH_ASSETS = {
    // Drop your downloaded MP3s into the pacmath/assets/ folder with these exact names!
    start: "assets/start.m4a",
    eat: "assets/eat.m4a",
    die: "assets/die.m4a",
    underwater: "assets/underwater.m4a",
    wee: "https://media.vocaroo.com/mp3/17cdaViuH4NS",
    bonus: "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav",
    teacher: "https://i.ibb.co/8gQyRn1K/20260426-131526.jpg"
};

// Audio state management
window.PacMathAudio = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    unlocked: false,
    startSnd: null,
    eatSnd: null,
    dieSnd: null,
    bgm: null,
    wee: null,
    bonus: null,
    useSynthBGM: true,

    init() {
        if (this.unlocked) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        this.startSnd = new Audio(window.PACMATH_ASSETS.start);
        this.eatSnd = new Audio(window.PACMATH_ASSETS.eat);
        this.dieSnd = new Audio(window.PACMATH_ASSETS.die);
        this.bgm = new Audio(window.PACMATH_ASSETS.underwater);
        this.wee = new Audio(window.PACMATH_ASSETS.wee);
        this.bonus = new Audio(window.PACMATH_ASSETS.bonus);

        this.startSnd.volume = 0.5;
        this.eatSnd.volume = 0.5;
        this.dieSnd.volume = 0.5;
        this.bgm.volume = 0.2;
        this.bgm.loop = true;

        const b = this.ctx.createBuffer(1, 1, 22050);
        const s = this.ctx.createBufferSource();
        s.buffer = b;
        s.connect(this.ctx.destination);
        s.start(0);

        this.unlocked = true;
    },

    setMusicVolume(state) {
        if (!this.unlocked || !this.bgm) return;
        if (state === 'playing') {
            this.bgm.volume = 0.05;
        } else if (state === 'paused' || state === 'review') {
            this.bgm.volume = 0.01;
        } else if (state === 'menu') {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    },

    playBGM(level) {
        if (!this.unlocked || !this.bgm) return;
        if (level === 'underwater') {
            this.bgm.currentTime = 0;
            this.bgm.play().catch(()=>{});
        } else {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    },

    playSynth(freq, type, dur, vol = 0.1) {
        if (this.ctx.state === 'suspended') return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    },

    playGameStart() {
        if (!this.unlocked) return;
        this.startSnd.currentTime = 0;
        this.startSnd.play().catch(()=>{});
    },

    playEatPellet(continuous = true) {
        if (!this.unlocked) return;
        if (continuous) {
            if (this.eatSnd.paused) {
                this.eatSnd.loop = true;
                this.eatSnd.play().catch(()=>{});
            }
        }
    },

    stopEatPellet() {
        if (!this.unlocked) return;
        if (!this.eatSnd.paused) {
            this.eatSnd.pause();
            this.eatSnd.currentTime = 0;
        }
    },

    playDeath() {
        if (!this.unlocked) return;
        this.dieSnd.currentTime = 0;
        this.dieSnd.play().catch(()=>{});
    },

    playChallengeAlert() { if (this.unlocked) { this.bonus.volume = 0.6; this.bonus.play(); } },
    playPowerUp() { this.playSynth(400, 'square', 0.1, 0.05); setTimeout(() => this.playSynth(600, 'square', 0.2, 0.05), 100); },
    playDamage() { this.playSynth(200, 'sawtooth', 0.3, 0.1); },
    playSuccess() { this.playSynth(600, 'sine', 0.1, 0.05); setTimeout(() => this.playSynth(800, 'sine', 0.2, 0.05), 100); },
    playLevelUp() { this.playSynth(300, 'square', 0.2, 0.1); setTimeout(() => this.playSynth(500, 'square', 0.2, 0.1), 200); setTimeout(() => this.playSynth(800, 'square', 0.4, 0.1), 400); },
    playCameoFanfare() { this.playSynth(523.25, 'triangle', 0.2, 0.1); setTimeout(() => this.playSynth(659.25, 'triangle', 0.2, 0.1), 200); setTimeout(() => this.playSynth(783.99, 'triangle', 0.4, 0.1), 400); },
    playEatGhost() { this.playSynth(800, 'square', 0.1, 0.05); setTimeout(() => this.playSynth(1000, 'square', 0.1, 0.05), 100); }
};
