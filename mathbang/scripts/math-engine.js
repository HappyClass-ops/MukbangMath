window.MathEngine = {
    generate: function(subject, correctCount, forceLevel = null) {
        const level = forceLevel || Math.min(3, Math.floor(correctCount / 10) + 1);
        let q = "", a = "", fakes = [];
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        if (subject === 'addition') {
            let n1 = level === 1 ? rand(1, 9) : (level === 2 ? rand(10, 99) : rand(50, 999));
            let n2 = level === 1 ? rand(1, 9) : (level === 2 ? rand(1, 9) : rand(10, 99));
            q = `${n1} + ${n2}`; a = (n1 + n2).toString(); fakes = [(n1+n2+rand(1,5)).toString(), (n1+n2-rand(1,5)).toString()];
        } else if (subject === 'subtraction') {
            let n1 = level === 1 ? rand(5, 15) : (level === 2 ? rand(20, 99) : rand(100, 999));
            let n2 = level === 1 ? rand(1, n1-1) : (level === 2 ? rand(1, 19) : rand(10, 99));
            q = `${n1} - ${n2}`; a = (n1 - n2).toString(); fakes = [(n1-n2+rand(1,5)).toString(), (n1-n2-rand(1,4)).toString()];
        } else if (subject === 'multiplication') {
            let n1 = level === 1 ? rand(1, 5) : (level === 2 ? rand(3, 9) : rand(6, 12));
            let n2 = level === 1 ? rand(1, 5) : (level === 2 ? rand(2, 5) : rand(4, 9));
            q = `${n1} × ${n2}`; a = (n1 * n2).toString(); fakes = [(n1*n2+n1).toString(), (n1*n2-n2).toString()];
        } else if (subject === 'division') {
            let n2 = level === 1 ? rand(2, 5) : (level === 2 ? rand(3, 7) : rand(6, 10));
            let ans = level === 1 ? rand(1, 5) : (level === 2 ? rand(3, 9) : rand(5, 12));
            let n1 = n2 * ans;
            q = `${n1} ÷ ${n2}`; a = ans.toString(); fakes = [(ans+1).toString(), (ans-1).toString()];
        } else if (subject === 'fractions') {
            const isUnit = level < 3; let den = rand(2, isUnit ? 5 : 8); let num = isUnit ? 1 : rand(2, den - 1);
            let mult = rand(2, 6); let whole = den * mult; let ans = num * mult;
            q = `What is ${num}/${den} of ${whole}?`; a = ans.toString(); fakes = [(ans+1).toString(), (ans-1).toString(), (ans+2).toString()];
        }
        
        let finalOpts = Array.from(new Set([a, ...fakes.map(x => parseInt(x) < 0 ? '0' : x)]));
        while(finalOpts.length < 3) finalOpts.push( (parseInt(a||0) + rand(1,10)).toString() );
        return { question: q, answer: a, options: finalOpts.slice(0,3).sort(() => Math.random() - 0.5) };
    }
};