// ==========================================
// PAC-MATH SKINS & CHARACTER DRAWING
// ==========================================

window.PacSkins = {
    pacStyle: { 
        color: 'yellow', 
        bow: false, 
        faceImg: null, 
        special: 'none' 
    },

    drawCharacter(ctx, p) {
        const style = this.pacStyle;
        ctx.save(); 
        ctx.translate(p.x, p.y); 
        ctx.rotate(p.a); 
        ctx.beginPath(); 
        ctx.arc(0,0,p.r,p.mO*Math.PI,(2-p.mO)*Math.PI); 
        ctx.lineTo(0,0); 
        
        if(style.faceImg){
            ctx.save();
            ctx.clip();
            ctx.rotate(-p.a);
            ctx.drawImage(style.faceImg,-p.r,-p.r,p.r*2,p.r*2);
            ctx.restore();
            ctx.lineWidth=1;
            ctx.strokeStyle=style.color;
            ctx.stroke();
        } else {
            ctx.fillStyle=style.color;
            ctx.fill();
        }
        
        if(style.special==='hard'){
            ctx.strokeStyle='white';
            ctx.lineWidth=2;
            ctx.stroke();
            ctx.strokeStyle='#00FFFF';
            ctx.lineWidth=2;
            ctx.beginPath();
            ctx.moveTo(-p.r*0.6,-p.r*0.5);
            ctx.lineTo(0,-p.r*0.1);
            ctx.lineTo(-p.r*0.2,p.r*0.1);
            ctx.lineTo(p.r*0.5,p.r*0.6);
            ctx.stroke();
        }
        
        if(style.special==='expert'){
            ctx.shadowBlur=15;
            ctx.shadowColor='red';
        } 
        
        if(style.special==='god'){
            ctx.shadowBlur=20;
            ctx.shadowColor='gold';
            ctx.fillStyle='gold';
            ctx.beginPath();
            ctx.moveTo(-p.r,-p.r*0.25);
            ctx.lineTo(-p.r-15,-p.r-5);
            ctx.lineTo(-p.r-5,0);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-p.r,p.r*0.25);
            ctx.lineTo(-p.r-15,p.r+5);
            ctx.lineTo(-p.r-5,0);
            ctx.fill();
            if(Date.now()%200<100){
                ctx.fillStyle='orange';
                ctx.beginPath();
                ctx.moveTo(-p.r*0.25,p.r);
                ctx.lineTo(0,p.r+10);
                ctx.lineTo(p.r*0.25,p.r);
                ctx.fill();
            }
        }
        
        if(style.special==='scuba'){
            ctx.strokeStyle='white';
            ctx.lineWidth=2;
            ctx.stroke();
            
            // Scuba Mask
            ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(-p.r*0.3, -p.r*0.4, p.r*0.6, p.r*0.4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();

            // Mask Strap
            ctx.beginPath();
            ctx.moveTo(-p.r*0.9, -p.r*0.4);
            ctx.lineTo(-p.r, -p.r*0.4);
            ctx.stroke();

            // Shark Teeth
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(p.r*0.3, p.r*0.1);
            ctx.lineTo(p.r*0.5, p.r*0.4);
            ctx.lineTo(p.r*0.7, p.r*0.1);
            ctx.lineTo(p.r*0.9, p.r*0.5);
            ctx.lineTo(p.r, 0);
            ctx.fill();
            ctx.stroke();
        }

        if(style.bow){
            ctx.fillStyle='red';
            ctx.beginPath();
            ctx.moveTo(0,-p.r);
            ctx.lineTo(-6,-p.r-5);
            ctx.lineTo(-6,-p.r+3);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0,-p.r);
            ctx.lineTo(6,-p.r-5);
            ctx.lineTo(6,-p.r+3);
            ctx.fill();
            ctx.fillStyle='white';
            ctx.beginPath();
            ctx.arc(0,-p.r-1,2,0,Math.PI*2);
            ctx.fill();
        } 
        ctx.restore();
    }
};
