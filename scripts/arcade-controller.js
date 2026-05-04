// ==========================================
// 1. DRAG-TO-SCROLL (WITH CLICK PROTECTION)
// ==========================================
const slider = document.getElementById('game-carousel');
let isDown = false;
let startX;
let scrollLeft;
let hasMoved = false; // To distinguish between a drag and a click

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    hasMoved = false;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.style.scrollBehavior = 'auto';
});

slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; 
    if (Math.abs(walk) > 5) hasMoved = true; // If moved more than 5px, it's a drag
    slider.scrollLeft = scrollLeft - walk;
});

slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.scrollBehavior = 'smooth';
});

// ==========================================
// 2. CARD INTERACTION ENGINE
// ==========================================
function renderCarousel() {
    const container = document.getElementById('game-carousel');
    container.innerHTML = ""; 

    window.ARCADE_GAMES.forEach(game => {
        const card = document.createElement('div');
        card.className = `carousel-card`;
        card.style.setProperty('--theme-color', game.themeColor);
        card.style.border = `2px solid ${game.themeColor}`;
        
        card.addEventListener('click', (e) => {
            if (hasMoved) return; // Don't flip if we were just dragging

            // 1. If it's not the active card, scroll to it
            if (!card.classList.contains('is-active')) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                return;
            }

            // 2. Toggle the Reveal class (Back and Forth)
            const isRevealed = card.classList.contains('is-revealed');
            
            // Close all other cards first
            document.querySelectorAll('.carousel-card').forEach(c => c.classList.remove('is-revealed'));
            
            if (!isRevealed) {
                card.classList.add('is-revealed');
                if(window.ROOT_ASSETS.tapSound) new Audio(window.ROOT_ASSETS.tapSound).play().catch(e=>{});
            } else {
                // If already revealed, it flips back to Artwork (unless button is hit)
                card.classList.remove('is-revealed');
            }
        });

        card.innerHTML = `
            <div class="card-artwork">
                <img src="${game.coverArt}" class="game-cover-art">
                <div class="relative z-20 flex flex-col items-center">
                    <div class="text-6xl mb-2">${game.emoji}</div>
                    <h3 class="text-xl font-black font-mono uppercase text-white">${game.title}</h3>
                </div>
            </div>
            <div class="card-info">
                <h3 class="text-lg font-black mb-2" style="color: ${game.themeColor}">${game.title}</h3>
                <p class="text-slate-300 text-xs mb-4">${game.description}</p>
                <!-- NAVIGATION IS ONLY HERE -->
                <button onclick="event.stopPropagation(); window.location.href='${game.folder}/index.html'" 
                        class="w-full py-3 ${game.buttonColor} text-black font-black rounded-xl uppercase text-sm ${game.disabled ? 'opacity-50' : ''}"
                        ${game.disabled ? 'disabled' : ''}>
                    ${game.disabled ? 'Coming Soon' : 'Play Now'}
                </button>
            </div>
        `;
        
        container.appendChild(card);
        observer.observe(card);
    });
}

// ... Keep existing Intersection Observer, Cheat Mode, and Admin logic ...
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
        } else {
            entry.target.classList.remove('is-active');
            entry.target.classList.remove('is-revealed'); 
        }
    });
}, { root: slider, threshold: 0.7 });

renderCarousel();