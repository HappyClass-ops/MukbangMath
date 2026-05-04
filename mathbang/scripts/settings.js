// ==========================================
// MATH-BANG SETTINGS & RULES
// ==========================================
// Tweak these numbers to make the game harder or easier!

window.MATHBANG_SETTINGS = {
    // HOW FAST DO THINGS HAPPEN?
    chewSpeedMs: 500, // How many milliseconds it takes to take one bite (1000 = 1 second)
    
    // MATH DIFFICULTY (What is the highest number they will see?)
    additionMax: 20,       // Example: 15 + 18
    subtractionMax: 20,    // Example: 19 - 7
    multiplicationMax: 12, // Example: 12 x 11
    divisionMax: 100,      // Example: 100 / 10

    // REWARDS LOGIC
    likesPerBite: 10,      // How many 'likes' a streamer gets per successful math problem
    bonusOnFinish: 100     // Bonus chunk of likes for finishing a whole meal
};