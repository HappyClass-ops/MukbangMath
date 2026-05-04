// ==========================================
// 1. PRO DRAG-TO-SCROLL
// ==========================================
const slider = document.getElementById('game-carousel');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
});

slider.addEventListener('mouseleave', () => isDown = false);
slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.scrollBehavior = 'smooth';
});

slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; 
    slider.scrollLeft = scrollLeft - walk;
});

// ==========================================
// 2. PRO AUTO-POPUP (Intersection Observer)
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
        } else {
            entry.target.classList.remove('is-active');
            entry.target.classList.remove('is-revealed'); // Hide info when scrolled away
        }
    });
}, { root: slider, threshold: 0.8 });

// ==========================================
// 3. RENDERER
// ==========================================
function renderCarousel() {
    const container = document.getElementById('game-carousel');
    container.innerHTML = ""; 

    window.ARCADE_GAMES.forEach(game => {
        const card = document.createElement('div');
        card.className = `carousel-card`;
        card.style.setProperty('--theme-color', game.themeColor);
        card.style.border = `2px solid ${game.themeColor}`;
        
        card.onclick = () => {
            // If it's not the active card, scroll to it first
            if (!card.classList.contains('is-active')) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                return;
            }
            
            // If active but not revealed, reveal info
            if (!card.classList.contains('is-revealed')) {
                card.classList.add('is-revealed');
                if(window.ROOT_ASSETS.tapSound) new Audio(window.ROOT_ASSETS.tapSound).play().catch(e=>{});
            } else if (!game.disabled) {
                // If revealed, launch
                window.location.href = `${game.folder}/index.html`;
            }
        };

        card.innerHTML = `
            <div class="card-artwork">
                <img src="${game.coverArt}" class="game-cover-art" onerror="this.style.opacity='0.2'">
                <div class="relative z-20 flex flex-col items-center">
                    <div class="text-8xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">${game.emoji}</div>
                    <h3 class="text-3xl font-black font-mono uppercase" style="color: #fff; text-shadow: 0 0 10px ${game.themeColor}">${game.title}</h3>
                </div>
            </div>
            <div class="card-info">
                <h3 class="text-xl font-black mb-2" style="color: ${game.themeColor}">${game.title}</h3>
                <p class="text-slate-300 text-sm mb-6">${game.description}</p>
                <button class="w-full py-4 ${game.buttonColor} text-black font-black rounded-2xl uppercase tracking-widest shadow-lg">
                    ${game.disabled ? 'Coming Soon' : 'Play Now'}
                </button>
            </div>
        `;
        
        container.appendChild(card);
        observer.observe(card);
    });
}

renderCarousel();

// ... Insert the Teacher Cheat Mode and Idea Vault logic from previous Batch 1 here ...