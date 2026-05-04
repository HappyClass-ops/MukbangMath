// ==========================================
// THE STORE LOGIC (BUYING THINGS)
// ==========================================

window.KitchenStore = {
    // Function to buy a new food item
    buyFood: function(foodId) {
        // 1. Find the food in our foods.js menu
        const food = window.MATHBANG_FOODS.find(f => f.id === foodId);
        
        // 2. Check if they have enough money (likes)
        if (window.PlayerProfile.data.likes >= food.cost) {
            
            // 3. Take their money
            window.PlayerProfile.data.likes -= food.cost;
            // 4. Give them the food
            window.PlayerProfile.data.unlockedFoods.push(foodId);
            // 5. Save the game
            window.PlayerProfile.save();
            
            return true; // Purchase successful!
        }
        return false; // Not enough money!
    }
};