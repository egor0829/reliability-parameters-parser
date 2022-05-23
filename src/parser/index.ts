import browserObject from 'src/parser/browser';
import scraperController from 'src/parser/pageController';
import mongooseConnect from 'src/mongoose';
// import {Cluster} from 'puppeteer-cluster';

async function main() {
    await mongooseConnect();

    //Start the browser and create a browser instance
    const browserInstance = await browserObject.startBrowser();

    if (!browserInstance) {
        throw new Error();
    }

    // Pass the browser instance to the scraper controller
    scraperController.scrapeAll(browserInstance);
}

// (async () => {
//     const cluster = await Cluster.launch({
//         concurrency: Cluster.CONCURRENCY_PAGE,
//         maxConcurrency: 1
//     });

//     await cluster.task(async ({page, data: url}) => {
//         await page.goto(url);
//         // Store screenshot, do something else
//     });

//     cluster.queue('http://www.google.com/');
//     cluster.queue('http://www.wikipedia.org/');
//     // many more pages

//     await cluster.idle();
//     await cluster.close();
// })();

main();
