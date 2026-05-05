// ==========================================
// PAC-MATH ENGINE (Problem Generation)
// ==========================================

window.PacMathEngine = {
    subject: null, 
    score: 0, 
    hearts: 3, 
    streak: 0, 
    mistakes: [], 
    currentQ: null,
    recentQuestions: [], 
    recentTags: [], 
    levelMilestones: { med: false, hard: false, expert: false },
    names: ["Chloe", "John", "Mia", "Leo", "Sam", "Zoe"], 
    items: ["apples 🍎", "pencils ✏️", "stickers ⭐️", "candies 🍬", "toys 🧸", "pizzas 🍕"],

    reset(hearts = 3) {
        this.score = 0;
        this.hearts = hearts;
        this.streak = 0;
        this.mistakes = [];
        this.recentQuestions = [];
        this.recentTags = [];
        this.levelMilestones = { med: false, hard: false, expert: false };
    },

    addScore(points) { 
        this.score += points; 
        this.checkMilestones(); 
    },

    checkMilestones() {
        const GameInterface = window.PacGameInterface;
        const currentLevel = GameInterface.currentLevel || 'classic';

        if (currentLevel === 'classic' && this.score >= 1200 && !window.PacSettings.unlocks.deepSea) {
            window.PacSettings.unlocks.deepSea = true;
            const btn = document.getElementById('levelDeepSea');
            if (btn) {
                btn.classList.remove('locked');
                btn.innerText = '🌊 Deep Sea Level';
            }
            GameInterface.triggerSkinPopup("NEW LEVEL UNLOCKED!", "Deep Sea available in Level Select!");
            window.PacSettings.save();
        }

        if (currentLevel === 'underwater' && this.score >= 2000 && !window.PacSettings.unlocks.scuba) {
            window.PacSettings.unlocks.scuba = true;
            const btn = document.getElementById('skinScuba');
            if (btn) {
                btn.classList.remove('locked');
                btn.style.backgroundColor = '#1e90ff';
            }
            GameInterface.triggerSkinPopup("NEW SKIN UNLOCKED!", "Scuba Diver");
            window.PacSettings.save();
        }

        if (this.score >= 400 && !this.levelMilestones.med) { 
            this.levelMilestones.med = true; 
            GameInterface.spawnGhost('wanderer'); 
            if (!window.PacSettings.unlocks.hard) { 
                window.PacSettings.unlocks.hard = true; 
                const sH = document.getElementById('skinHard');
                if(sH) { sH.style.backgroundColor = '#00CCFF'; sH.classList.remove('locked'); }
                GameInterface.triggerSkinPopup("NEW SKIN UNLOCKED!", "Expert Mode"); 
                window.PacSettings.save(); 
            } else { 
                GameInterface.triggerSkinPopup("NEXT LEVEL REACHED!", "Questions are harder!"); 
            }
        } 
        else if (this.score >= 1000 && !this.levelMilestones.hard) { 
            this.levelMilestones.hard = true; 
            GameInterface.spawnGhost('wanderer'); 
            if (!window.PacSettings.unlocks.expert) { 
                window.PacSettings.unlocks.expert = true; 
                const sE = document.getElementById('skinExpert');
                if(sE) { sE.style.backgroundColor = '#FF3333'; sE.classList.remove('locked'); }
                GameInterface.triggerSkinPopup("NEW SKIN UNLOCKED!", "Hard Mode"); 
                window.PacSettings.save(); 
            } else { 
                GameInterface.triggerSkinPopup("NEXT LEVEL REACHED!", "Things are getting faster!"); 
            }
        } 
        else if (this.score >= 1500 && !this.levelMilestones.expert) { 
            this.levelMilestones.expert = true; 
            GameInterface.spawnGhost('tracker'); 
            if (!window.PacSettings.unlocks.god) { 
                window.PacSettings.unlocks.god = true; 
                const sG = document.getElementById('skinGod');
                if(sG) { sG.style.backgroundColor = 'gold'; sG.classList.remove('locked'); }
                GameInterface.triggerSkinPopup("NEW SKIN UNLOCKED!", "Math God Mode"); 
                window.PacSettings.save(); 
            } else { 
                GameInterface.triggerSkinPopup("MAX LEVEL!", "Red Tracker Ghost Deployed!"); 
            }
        }
    },

    generateFakes(correct, count, variance) { 
        let opts = new Set([correct.toString()]); 
        while(opts.size < count) { 
            let fake = correct + (Math.floor(Math.random() * variance * 2) - variance); 
            if (fake !== correct && fake >= 0) opts.add(fake.toString()); 
        } 
        return Array.from(opts).sort(() => Math.random() - 0.5); 
    },

    formatFraction(num, den) { 
        return `<span class="fraction"><span>${num}</span><span>${den}</span></span>`; 
    },

    getDifficulty() { 
        if (this.score >= 1000) return 3; 
        if (this.score >= 400) return 2; 
        return 1; 
    },

    getUniqueQuestion(gList) {
        if (!gList || gList.length === 0) return { text: "1 + 1 = ?", correct: "2", options: ["1","2","3","4"], ch: false };
        let qD, attempts = 0, fList = gList.filter(g => !this.recentTags.includes(g.tag));
        if(fList.length === 0) fList = gList; 
        do { 
            let gen = fList[Math.floor(Math.random() * fList.length)]; 
            qD = gen.call(); 
            qD.tag = gen.tag; 
            attempts++; 
        } while (this.recentQuestions.includes(qD.text) && attempts < 50);
        this.recentQuestions.push(qD.text); 
        this.recentTags.push(qD.tag);
        if(this.recentQuestions.length > 30) this.recentQuestions.shift(); 
        if(this.recentTags.length > 5) this.recentTags.shift(); 
        return qD;
    },

    additionMatrix: [
        { tag: 'add-bridge', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let n1, n2; 
            if(d===1){n1=Math.floor(Math.random()*9)+2;n2=Math.floor(Math.random()*9)+2;}
            else if(d===2){n1=Math.floor(Math.random()*40)+15;n2=Math.floor(Math.random()*8)+5;}
            else{n1=Math.floor(Math.random()*40)+15;n2=Math.floor(Math.random()*40)+15;} 
            let c=n1+n2; 
            return { text: `${n1} + ${n2} = ?`, correct: c.toString(), options: window.PacMathEngine.generateFakes(c, 4, 10), ch: false }; 
        }},
        { tag: 'add-miss', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let n1=(d===1)?Math.floor(Math.random()*9)+1:Math.floor(Math.random()*20)+10; 
            let n2=(d===1)?Math.floor(Math.random()*9)+1:(d===2?Math.floor(Math.random()*9)+1:Math.floor(Math.random()*20)+10); 
            let c=n1+n2; 
            return { text: `${n1} + ? = ${c}`, correct: n2.toString(), options: window.PacMathEngine.generateFakes(n2, 4, 10), ch: false }; 
        }}
    ],

    subtractionMatrix: [
        { tag: 'sub-bridge', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let tens=d===1?10:(d===2?30:60); 
            let n1=tens+Math.floor(Math.random()*5)+2; 
            let n2=Math.floor(Math.random()*5)+(d===1?2:6); 
            let c=n1-n2; 
            return { text: `${n1} - ${n2} = ?`, correct: c.toString(), options: window.PacMathEngine.generateFakes(c, 4, 10), ch: false }; 
        }},
        { tag: 'sub-word', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let name=window.PacMathEngine.names[Math.floor(Math.random()*6)]; 
            let item=window.PacMathEngine.items[Math.floor(Math.random()*5)]; 
            let s=(d===1)?Math.floor(Math.random()*10)+10:Math.floor(Math.random()*20)+20; 
            let sold=Math.floor(Math.random()*8)+2; 
            let c=s-sold; 
            return { text: `${name} had ${s} ${item}. They lost ${sold}. How many left?`, correct: c.toString(), options: window.PacMathEngine.generateFakes(c, 4, 5), ch: false }; 
        }}
    ],

    multiplicationMatrix: [
        { tag: 'mult-arith', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let bases=d===1?[0,1,2,5,10]:(d===2?[3,4]:[6,7,8]); 
            let b=bases[Math.floor(Math.random()*bases.length)]; 
            let m=Math.floor(Math.random()*8)+2; 
            let c=b*m; 
            return { text: `${b} x ${m} = ?`, correct: c.toString(), options: window.PacMathEngine.generateFakes(c, 4, b*2), ch: false }; 
        }}
    ],

    divisionMatrix: [
        { tag: 'div-arith', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let divisors=d===1?[2,10]:(d===2?[5,3]:[4,6]); 
            let div=divisors[Math.floor(Math.random()*divisors.length)]; 
            let ans=Math.floor(Math.random()*9)+2; 
            let divd=div*ans; 
            return { text: `${divd} ÷ ${div} = ?`, correct: ans.toString(), options: window.PacMathEngine.generateFakes(ans, 4, 5), ch: false }; 
        }}
    ],

    fractionsMatrix: [
        { tag: 'fract-arith', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            let den, num=1; 
            if(d===1) den=2; 
            else if(d===2) den=[3,4,5][Math.floor(Math.random()*3)]; 
            else { 
                den=[3,4,5,10][Math.floor(Math.random()*4)]; 
                num=Math.floor(Math.random()*(den-2))+2; 
                if(num>=den) num=den-1; 
            } 
            let mult=(d===3)?Math.floor(Math.random()*10)+5:Math.floor(Math.random()*8)+2; 
            let w=den*mult; 
            let cA=num*mult; 
            return { text: `What is ${window.PacMathEngine.formatFraction(num, den)} of ${w}?`, correct: cA.toString(), options: window.PacMathEngine.generateFakes(cA, 4, 15), ch: false }; 
        }},
        { tag: 'fract-reason', call: function() { 
            let d = window.PacMathEngine.getDifficulty(); 
            if(d<3){ 
                let isT=Math.random()>0.5; 
                let t=isT?`True/False: ${window.PacMathEngine.formatFraction(1,2)} is BIGGER than ${window.PacMathEngine.formatFraction(1,4)}?`:`True/False: ${window.PacMathEngine.formatFraction(1,4)} is BIGGER than ${window.PacMathEngine.formatFraction(1,2)}?`; 
                return { text: t, correct: isT?"True":"False", options: ["True", "False"], ch: false }; 
            } else { 
                const s = [
                    { t: `True/False: ${window.PacMathEngine.formatFraction(2,4)} is SAME as ${window.PacMathEngine.formatFraction(1,2)}?`, a: "True" }, 
                    { t: `True/False: ${window.PacMathEngine.formatFraction(1,3)} is BIGGER than ${window.PacMathEngine.formatFraction(1,2)}?`, a: "False" }, 
                    { t: `True/False: ${window.PacMathEngine.formatFraction(3,3)} is same as 1 whole?`, a: "True" }
                ]; 
                let sce=s[Math.floor(Math.random()*s.length)]; 
                return { text: sce.t, correct: sce.a, options: ["True", "False"], ch: false }; 
            }
        }}
    ],

    forcedChallengeMatrix: [
        { tag: 'ch-fract-cmp', call: function() { 
            let n1=window.PacMathEngine.names[Math.floor(Math.random()*3)]; 
            let n2=window.PacMathEngine.names[Math.floor(Math.random()*3)+3]; 
            let isT=Math.random()>0.5; 
            let c=isT?"True":"False"; 
            let t=isT?`${n1} eats ${window.PacMathEngine.formatFraction(1,2)} pizza. ${n2} eats ${window.PacMathEngine.formatFraction(1,4)}. ${n1} ate more. True/False?`:`${n1} eats ${window.PacMathEngine.formatFraction(1,4)} pizza. ${n2} eats ${window.PacMathEngine.formatFraction(1,2)}. ${n1} ate more. True/False?`; 
            return { text: t, correct: c, options: ["True", "False"], ch: true }; 
        }},
        { tag: 'ch-add-carry', call: function() { 
            let n1=Math.floor(Math.random()*30)+20; 
            let n2=Math.floor(Math.random()*30)+20; 
            let rC=n1+n2; 
            let isT=Math.random()>0.5; 
            let dC=isT?rC:rC+(Math.random()>0.5?10:-10); 
            let c=isT?"True":"False"; 
            return { text: `True or False: ${n1} + ${n2} exactly equals ${dC}?`, correct: c, options:["True", "False"], ch: true }; 
        }}
    ],

    triggerRollingDice(cb) { 
        const qT=document.getElementById('questionText'); 
        const oC=document.getElementById('optionsContainer'); 
        oC.innerHTML=''; 
        let r=0; 
        let int=setInterval(()=>{
            qT.innerText=`Calculating... ${Math.floor(Math.random()*99)}`; 
            r++; 
            if(r>15){
                clearInterval(int); 
                cb();
            }
        }, 100); 
    },

    processPowerUp(fC=false) { 
        const GameInterface = window.PacGameInterface;
        const Audio = window.PacMathAudio;
        Audio.stopEatPellet();
        GameInterface.engineState='paused'; 
        if(this.streak>=window.PACMATH_CONFIG.streakForCameo && !fC){ 
            this.streak=0; 
            Audio.setMusicVolume('paused'); 
            if(Audio.unlocked){
                Audio.wee.currentTime=0;
                Audio.wee.volume=0.8;
                Audio.wee.play().catch(e=>Audio.playCameoFanfare());
            } else Audio.playCameoFanfare(); 
            const c=document.getElementById('teacherCameo'); 
            c.classList.add('cameo-animate'); 
            setTimeout(()=>{
                Audio.wee.pause();
                c.classList.remove('cameo-animate');
                this.loadQuestionUI(fC);
            },3000); 
        } else this.loadQuestionUI(fC); 
    },

    loadQuestionUI(fC) { 
        const Audio = window.PacMathAudio;
        Audio.setMusicVolume('review'); 
        document.getElementById('mcqModal').classList.remove('hidden'); 
        this.triggerRollingDice(()=>{ 
            let gL=fC?this.forcedChallengeMatrix:this[this.subject+'Matrix']||this.additionMatrix; 
            let qD=this.getUniqueQuestion(gL); 
            this.currentQ=qD; 
            const h=document.getElementById('questionHeader'); 
            const m=document.getElementById('mcqModal'); 
            if(qD.ch){
                Audio.playChallengeAlert();
                h.innerText="🚨 CHALLENGE! 🚨";
                h.style.color="#FF00FF";
                m.style.border="4px solid #FF00FF";
                m.style.boxShadow="0 0 30px #FF00FF";
            } else {
                Audio.playPowerUp();
                h.innerText="POWER UP!";
                h.style.color="#00FF00";
                m.style.border="none";
                m.style.boxShadow="none";
            } 
            document.getElementById('questionText').innerHTML=qD.text; 
            const c=document.getElementById('optionsContainer'); 
            c.innerHTML=""; 
            qD.options.forEach(o=>{ 
                let b=document.createElement('button'); 
                b.className='option-btn'; 
                b.innerHTML=o; 
                let hp=(e)=>{
                    e.preventDefault();
                    this.checkAnswer(o);
                }; 
                b.addEventListener('touchstart',hp); 
                b.addEventListener('mousedown',hp); 
                c.appendChild(b); 
            }); 
        }); 
    },

    checkAnswer(sel) { 
        const Audio = window.PacMathAudio;
        const GameInterface = window.PacGameInterface;
        document.getElementById('mcqModal').classList.add('hidden'); 
        let isC=(sel===this.currentQ.correct); 
        let isCh=this.currentQ.ch; 
        if(isC){ 
            Audio.playSuccess(); 
            this.streak++; 
            if(isCh){
                GameInterface.triggerGhostHunterMode();
                GameInterface.addScore(100);
            } else {
                GameInterface.resumeGame(true);
                GameInterface.addScore(50);
            } 
        } else { 
            Audio.playDamage(); 
            this.streak=0; 
            this.mistakes.push({q:this.currentQ.text, right:this.currentQ.correct, wrong:sel}); 
            if(isCh) GameInterface.resumeGame(false); 
            else {
                this.hearts--; 
                window.PacGameInterface.updateHeartsUI(); 
                if(this.hearts<=0) GameInterface.triggerGameOver(); 
                else GameInterface.resumeGame(false,true);
            } 
        } 
    }
};
