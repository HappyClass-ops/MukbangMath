// ==========================================
// THE MATH PROBLEM GENERATOR
// ==========================================

window.MathEngine = {
    // Helper function to pick a random number
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Generates a brand new math problem
    generateProblem: function(operation) {
        let num1, num2, answer, questionString;
        
        // Grab the max numbers you set in your settings.js file
        const s = window.MATHBANG_SETTINGS; 

        // ADDITION (+)
        if (operation === "+") {
            num1 = this.getRandomInt(1, s.additionMax);
            num2 = this.getRandomInt(1, s.additionMax);
            answer = num1 + num2;
            questionString = `${num1} + ${num2}`;
        }
        // SUBTRACTION (-)
        // We force num2 to be smaller so kids don't get negative answers!
        else if (operation === "-") {
            num1 = this.getRandomInt(1, s.subtractionMax);
            num2 = this.getRandomInt(1, num1); 
            answer = num1 - num2;
            questionString = `${num1} - ${num2}`;
        }
        // MULTIPLICATION (x)
        else if (operation === "*") {
            num1 = this.getRandomInt(1, s.multiplicationMax);
            num2 = this.getRandomInt(1, s.multiplicationMax);
            answer = num1 * num2;
            questionString = `${num1} × ${num2}`;
        }
        // DIVISION (÷)
        // We do backward math here to ensure the division is always a clean whole number
        else if (operation === "/") {
            num2 = this.getRandomInt(1, 12); // The divisor
            answer = this.getRandomInt(1, Math.floor(s.divisionMax / num2)); 
            num1 = num2 * answer; // Creates the big starting number
            questionString = `${num1} ÷ ${num2}`;
        }

        // Return the question text and the secret answer back to the game
        return {
            text: questionString,
            correctAnswer: answer
        };
    }
};