const https = require('https');

const urls = [
    'https://freesound.org/people/gecop/sounds/521478/',
    'https://freesound.org/people/plasterbrain/sounds/266163/',
    'https://freesound.org/people/Nerdwizard78/sounds/644037/'
];

urls.forEach(url => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const match = data.match(/property="og:audio"\s+content="([^"]+)"/);
            if (match) {
                console.log(match[1]);
            } else {
                console.log("Not found for " + url);
            }
        });
    });
});
