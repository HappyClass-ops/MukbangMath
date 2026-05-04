// ==========================================
// THE MATH-BANG MENU (Config-Driven)
// ==========================================

window.MATHBANG_FOODS = [
    { id: 'cracker', name: 'Rice Cracker', emoji: '🍘', cost: 0, power: 5, type: 'standard', bites: 1, consumable: false },
    { id: 'noodles', name: 'Spicy Noodles', emoji: '🍜', cost: 100, power: 15, type: 'standard', bites: 1, consumable: false },
    { id: 'sushi', name: 'Sushi Tray', emoji: '🍣', cost: 300, power: 30, type: 'standard', bites: 2, consumable: false },
    { id: 'burger', name: 'Mega Burger', emoji: '🍔', cost: 800, power: 60, type: 'standard', bites: 3, consumable: false },
    { id: 'seafood', name: 'Seafood Boil', emoji: '🦞', cost: 2000, power: 150, type: 'standard', bites: 5, consumable: false },
    { id: 'pizza', name: 'Giant Pizza', emoji: '🍕', cost: 5000, power: 300, type: 'standard', bites: 4, consumable: false },
    { id: 'crab', name: 'King Crab', emoji: '🦀', cost: 10000, power: 600, type: 'standard', bites: 5, consumable: false },
    
    // Secret Foods
    { id: 'steak', name: 'Wagyu Steak', emoji: '🥩', cost: 25000, power: 1800, type: 'standard', bites: 4, consumable: false, isSecret: true },
    { id: 'caviar', name: 'Gold Caviar', emoji: '🥄', cost: 50000, power: 5000, type: 'standard', bites: 2, consumable: false, isSecret: true },
    { id: 'feast', name: 'Ultimate Feast', emoji: '🍱', cost: 100000, power: 15000, type: 'standard', bites: 6, consumable: false, isSecret: true },
    
    // =========================================================
    // KITCHEN ITEMS (With Custom Rendering Logic!)
    // =========================================================
    { 
        id: 'custom_kakigori', name: 'Shaved Ice', emoji: '🍧', cost: 0, power: 20, type: 'custom', bites: 2, consumable: true,
        renderFood: (bitesLeft, customData) => (
            <div className="relative flex flex-col items-center">
                <div className="absolute bottom-0 w-20 h-10 bg-blue-100/60 rounded-b-full border-4 border-blue-200 z-20"></div>
                <div className="w-16 h-20 rounded-t-full relative overflow-hidden bg-white shadow-inner mb-4 z-10">
                    <div className="absolute bottom-0 w-full h-full opacity-90 mix-blend-multiply" style={{ backgroundColor: customData.color }}></div>
                </div>
            </div>
        )
    },
    { 
        id: 'custom_tanghulu', name: 'Tanghulu', emoji: '🍡', cost: 0, power: 40, type: 'custom', bites: 3, consumable: true,
        renderFood: (bitesLeft, customData) => (
            <div className="relative flex flex-col items-center">
                <div className="w-2 h-20 bg-amber-300 rounded-full absolute bottom-[-10px] z-0"></div>
                <div className="flex flex-col gap-1 z-10 pb-4">
                    {customData.fruits.slice(0, bitesLeft).map((f, i) => (
                        <div key={i} className="relative text-3xl drop-shadow-md">{f}
                            <div className="absolute inset-0 bg-white/40 rounded-full blur-[1px] mix-blend-overlay"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    { 
        id: 'custom_ramen', name: 'Custom Ramen', emoji: '🍜', cost: 0, power: 60, type: 'custom', bites: 4, consumable: true,
        renderFood: () => (
            <div className="relative text-6xl">
                <div className="absolute bottom-0 w-full h-1/2 bg-orange-500/30 blur-[6px] rounded-full z-0"></div>
                <span className="relative z-10 drop-shadow-lg">🍜</span>
            </div>
        )
    }
];