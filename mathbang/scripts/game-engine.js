// ==========================================
// MATH-BANG GAME ENGINE (Vanilla JS)
// ==========================================

window.GameEngine = {
    // 1. Current Game State
    currentProblem: null,
    currentInput: "",
    currentFood: null,
    bitesTaken: 0,
    
    // 2. Start the Engine!
    init: function() {
        console.log("🚀 Math-Bang Engine Started!");
        
        // Setup Ghost Mode UI
        if (localStorage.getItem('isTeacherTesting') === 'true') {
            document.getElementById('ghost-banner').classList.remove('hidden');
        }

        // Setup Audio Links from assets.js
        document.getElementById('audio-crunch').src = window.MATHBANG_ASSETS.crunchSound || "";
        document.getElementById('audio-buzzer').src = window.MATHBANG_ASSETS.buzzerSound || "";

        // Update UI with player stats
        this.updateLikesUI();

        // Load the first food (defaults to Burger)
        this.loadFood("burger");
    },

    // 3. Load a specific food to eat
    loadFood: function(foodId) {
        this.currentFood = window.MATHBANG_FOODS.find(f => f.id === foodId);
        this.bitesTaken = 0;
        
        // Update the screen
        document.getElementById('food-emoji').innerText = this.currentFood.emoji;
        this.updateProgressBar();
        this.generateNewMath();
    },

    // 4. Ask a new Math Question
    generateNewMath: function() {
        this.currentInput = "";
        this.updateAnswerUI();
        
        // Pick a random operation (+, -, *, /)
        const ops = ["+", "-", "*"]; // Kept division out for now to keep it snappy
        const randomOp = ops[Math.floor(Math.random() * ops.length)];
        
        // Ask MathEngine (from Batch 2) to build it
        this.currentProblem = window.MathEngine.generateProblem(randomOp);
        
        // Show it on screen
        document.getElementById('math-question').innerText = this.currentProblem.text;
    },

    // 5. Numpad Controls
    pressKey: function(num) {
        if (this.currentInput.length < 4) { // Max 4 digits
            this.currentInput += num.toString();
            this.updateAnswerUI();
        }
    },
    clearAnswer: function() {
        this.currentInput = "";
        this.updateAnswerUI();
    },
    updateAnswerUI: function() {
        document.getElementById('math-answer').innerText = "= " + this.currentInput;
    },
    updateLikesUI: function() {
        document.getElementById('ui-likes').innerText = window.PlayerProfile.data.likes;
    },
    updateProgressBar: function() {
        const percent = (this.bitesTaken / this.currentFood.bitesRequired) * 100;
        document.getElementById('bite-progress').style.width = percent + "%";
    },

    // 6. Check the Answer!
    submitAnswer: function() {
        if (this.currentInput === "") return;

        const guess = parseInt(this.currentInput);

        if (guess === this.currentProblem.correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    },

    // 7. Correct Logic
    handleCorrectAnswer: function() {
        // Play Sound
        const crunch = document.getElementById('audio-crunch');
        if (crunch.src) { crunch.currentTime = 0; crunch.play().catch(e=>console.log("Audio silent")); }

        // Animate
        const foodEl = document.getElementById('food-container');
        foodEl.classList.add('animate-chomp');
        setTimeout(() => foodEl.classList.remove('animate-chomp'), 300);

        // Update Stats
        this.bitesTaken++;
        this.updateProgressBar();
        
        const reward = window.MATHBANG_SETTINGS.likesPerBite;
        window.PlayerProfile.addLikes(reward);
        this.updateLikesUI();

        // Did we finish the food?
        if (this.bitesTaken >= this.currentFood.bitesRequired) {
            setTimeout(() => this.finishFood(), 400); // Wait a second for animation
        } else {
            this.generateNewMath();
        }
    },

    // 8. Wrong Logic
    handleWrongAnswer: function() {
        // Play Sound
        const buzzer = document.getElementById('audio-buzzer');
        if (buzzer.src) { buzzer.currentTime = 0; buzzer.play().catch(e=>console.log("Audio silent")); }

        // Shake the math board
        const board = document.getElementById('game-body');
        board.classList.add('bg-flash-red', 'animate-shake');
        
        setTimeout(() => {
            board.classList.remove('bg-flash-red', 'animate-shake');
            this.clearAnswer();
        }, 400);
    },

    // 9. Finish the meal
    finishFood: function() {
        // Grant Bonus!
        window.PlayerProfile.addLikes(window.MATHBANG_SETTINGS.bonusOnFinish);
        this.updateLikesUI();
        
        alert(`Delicious! You finished the ${this.currentFood.name} and got a ${window.MATHBANG_SETTINGS.bonusOnFinish} Like Bonus!`);
        
        // Reload the same food for now (until we build the store UI)
        this.loadFood(this.currentFood.id);
    }
};

// Boot up the game the second the page loads!
window.onload = () => window.GameEngine.init();