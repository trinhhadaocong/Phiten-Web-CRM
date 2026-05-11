const puppeteer = require('puppeteer');

(async () => {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      
      let errorfound = false;
      page.on('console', msg => {
          if (msg.type() === 'error') {
              console.log('BROWSER CONSOLE ERROR:', msg.text());
              errorfound = true;
          }
      });

      page.on('pageerror', error => {
          console.log('BROWSER PAGE ERROR:', error.message);
          errorfound = true;
      });

      // Navigate first so we share the origin for localStorage
      await page.goto('http://localhost:5180/');
      
      await page.evaluate(() => { 
          localStorage.setItem('isAuthenticated', 'true'); 
          localStorage.setItem('user', JSON.stringify({username: 'admin', role: 'ADMIN'})); 
      });

      // Now navigate to dashboard and wait 4 seconds
      await page.goto('http://localhost:5180/dashboard');
      await new Promise(r => setTimeout(r, 4000));
      
      if (!errorfound) {
         console.log("No error found! Taking screenshot...");
         await page.screenshot({ path: 'scratch/dash.png' });
      }

      await browser.close();
    } catch(e) {
      console.log('Puppeteer launch error:', e);
    }
})();
