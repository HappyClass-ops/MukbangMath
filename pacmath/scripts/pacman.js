// ==========================================
// PAC-MATH ENTITIES (Pac-Man & Ghosts)
// ==========================================

window.PacEntities = {
    pac: { 
        x: 190, y: 310, tX: 190, tY: 310, 
        vx: 0, vy: 0, spd: 2, r: 9, a: 0, 
        mO: 0.2, mD: 1, invinc: 0 
    },
    ghosts: [],

    reset(speed) {
        this.pac = { 
            x: 190, y: 310, tX: 190, tY: 310, 
            vx: 0, vy: 0, spd: speed, r: 9, a: 0, 
            mO: 0.2, mD: 1, invinc: 0 
        };
        let gSpd = (speed === 1) ? 1 : speed / 2;
        this.ghosts = [
            { x: 190, y: 150, tX: 190, tY: 150, vx: 1, vy: 0, spd: gSpd, baseSpd: gSpd, c: 'red', type: 'tracker', state: 'normal' },
            { x: 190, y: 230, tX: 190, tY: 230, vx: -1, vy: 0, spd: gSpd, baseSpd: gSpd, c: '#FFB8FF', type: 'wanderer', state: 'normal' }
        ];
    },

    isGridValid(gx, gy, pacMap) { 
        if(gx < 0) gx = pacMap[0].length - 1; 
        if(gx >= pacMap[0].length) gx = 0; 
        if(gy < 0 || gy >= pacMap.length) return false; 
        return pacMap[gy][gx] !== 1; 
    },

    moveEnt(ent, isPac, pacMap) {
        const GameInterface = window.PacGameInterface;
        const canvas = document.getElementById('gameCanvas');

        if(ent.state === 'eaten') return; 
        if(ent.x < ent.tX) ent.x += ent.spd; 
        if(ent.x > ent.tX) ent.x -= ent.spd; 
        if(ent.y < ent.tY) ent.y += ent.spd; 
        if(ent.y > ent.tY) ent.y -= ent.spd; 
        
        if(Math.abs(ent.x - ent.tX) < ent.spd) ent.x = ent.tX; 
        if(Math.abs(ent.y - ent.tY) < ent.spd) ent.y = ent.tY;

        if(ent.x === ent.tX && ent.y === ent.tY) {
            if(ent.x <= -10 && ent.vx < 0) { ent.x = canvas.width + 10; ent.tX = ent.x; return; } 
            if(ent.x >= canvas.width + 10 && ent.vx > 0) { ent.x = -10; ent.tX = ent.x; return; }
            
            let gX = Math.floor(ent.x / window.PACMATH_TILE_SIZE);
            let gY = Math.floor(ent.y / window.PACMATH_TILE_SIZE);
            
            if(isPac) { 
                if((GameInterface.nextVx !== 0 || GameInterface.nextVy !== 0) && this.isGridValid(gX + GameInterface.nextVx, gY + GameInterface.nextVy, pacMap)) {
                    ent.vx = GameInterface.nextVx;
                    ent.vy = GameInterface.nextVy;
                } 
                if(this.isGridValid(gX + ent.vx, gY + ent.vy, pacMap)) {
                    ent.tX = ent.x + (ent.vx * window.PACMATH_TILE_SIZE);
                    ent.tY = ent.y + (ent.vy * window.PACMATH_TILE_SIZE);
                } else {
                    ent.vx = 0;
                    ent.vy = 0;
                } 
                if(ent.vx > 0) ent.a = 0;
                if(ent.vx < 0) ent.a = Math.PI;
                if(ent.vy > 0) ent.a = Math.PI / 2;
                if(ent.vy < 0) ent.a = -Math.PI / 2; 
            } else { 
                let poss = []; 
                for(let d of [{vx:1,vy:0},{vx:-1,vy:0},{vx:0,vy:1},{vx:0,vy:-1}]) { 
                    if(this.isGridValid(gX + d.vx, gY + d.vy, pacMap) && (d.vx !== -ent.vx || d.vy !== -ent.vy)) { 
                        let tx = ent.x + (d.vx * window.PACMATH_TILE_SIZE);
                        let ty = ent.y + (d.vy * window.PACMATH_TILE_SIZE);
                        let targetX = ent.state === 'blue' ? canvas.width - this.pac.tX : this.pac.tX;
                        let targetY = ent.state === 'blue' ? canvas.height - this.pac.tY : this.pac.tY;
                        poss.push({dir: d, dist: Math.hypot(targetX - tx, targetY - ty)}); 
                    } 
                } 
                if(poss.length > 0) { 
                    if(ent.type === 'wanderer' && ent.state !== 'blue') {
                        let c = poss[Math.floor(Math.random() * poss.length)].dir;
                        ent.vx = c.vx;
                        ent.vy = c.vy;
                    } else {
                        poss.sort((a,b) => a.dist - b.dist);
                        let c = (Math.random() < 0.8 || ent.state === 'blue') ? poss[0].dir : poss[Math.floor(Math.random() * poss.length)].dir;
                        ent.vx = c.vx;
                        ent.vy = c.vy;
                    } 
                } else {
                    ent.vx = -ent.vx;
                    ent.vy = -ent.vy;
                } 
                ent.tX = ent.x + (ent.vx * window.PACMATH_TILE_SIZE);
                ent.tY = ent.y + (ent.vy * window.PACMATH_TILE_SIZE); 
            }
        }
    }
};
