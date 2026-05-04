// ==========================================
// PLAYER PROFILE & SAVE DATA
// ==========================================

window.PlayerProfile = {
    // The starting stats for a brand new player
    data: {
        likes: 0,
        unlockedFoods: ["burger"], // Everyone starts with a burger
        unlockedSkins: ["default_bg"],
        activeBackground: "default_bg"
    },

    // Function to load their saved game from the iPad
    load: function() {
        // GHOST MODE CHECK: If you are testing, start fresh!
        if (localStorage.getItem('isTeacherTesting') === 'true') {
            console.log("👻 Ghost Mode Active: Using fresh temporary profile.");
            return; 
        }

        // Otherwise, grab their saved iPad data
        const saved = localStorage.getItem('mathbang_save');
        if (saved) {
            this.data = JSON.parse(saved); 
        }
    },

    // Function to save their progress
    save: function() {
        // GHOST MODE CHECK: Do not save over the kids' scores!
        if (localStorage.getItem('isTeacherTesting') === 'true') {
            console.log("👻 Ghost Mode Active: Save prevented.");
            return;
        }
        
        // Save to the iPad
        localStorage.setItem('mathbang_save', JSON.stringify(this.data));
    },

    // Function to add likes when they solve math
    addLikes: function(amount) {
        this.data.likes += amount;
        this.save(); // Auto-save after they get paid
    }
};

// Load the profile the second the script runs
window.PlayerProfile.load();