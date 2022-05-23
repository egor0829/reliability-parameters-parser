const scraperObject = {
    async scraper(browser: Puppeteer.Browser, url: string) {
        const page = await browser.newPage();
        console.log(`Navigating to ${url}...`);
        await page.goto(url);
    }
};

export default scraperObject;
