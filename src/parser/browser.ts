import puppeteer from 'puppeteer';
import logger from 'src/parser/winston';

async function startBrowser() {
    let browser;
    try {
        console.log('Opening the browser......');
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--disable-setuid-sandbox',
                `--window-size=1600,800`,
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                // https://stackoverflow.com/questions/49008008/chrome-headless-puppeteer-too-much-cpu
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote'
                // '--single-process', // <- this one doesn't works in Windows // Error: Navigation failed because browser has disconnected!
                // '--disable-gpu'
            ],
            defaultViewport: {
                width: 1280,
                height: 800
            },
            ignoreHTTPSErrors: true,
            slowMo: 100 // slow down by 250ms
            // devtools: true
        });
    } catch (err) {
        logger.error('Could not create a browser instance => : ', err);
    }
    return browser;
}

const browser = {
    startBrowser
};

export default browser;
