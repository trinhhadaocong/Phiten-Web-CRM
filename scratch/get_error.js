const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('BROWSER PAGE ERROR:', error.message);
    });

    await page.goto('http://localhost:5180/dashboard', { waitUntil: 'networkidle0' });
    
    await browser.close();
})();
