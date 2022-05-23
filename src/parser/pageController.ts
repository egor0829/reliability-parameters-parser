import urls from 'src/parser/urls.json';
import {Adapter} from 'src/parser/adapters/types';
import logger from 'src/parser/winston';

type UrlsEntries = Record<string, string>;
type AdapterImport = {
    adapter: Adapter;
};
type Adapters = Record<string, AdapterImport>;

async function scrapeAll(browserInstance: Puppeteer.Browser) {
    let browser;
    try {
        browser = await browserInstance;
        const adapters: Adapters = {};

        for (const host in urls as UrlsEntries) {
            adapters[host] = await import(`src/parser/adapters/${host}/adapter`);
        }

        const [host, url] = Object.entries(urls)[0];

        adapters[host].adapter(browser, url);
    } catch (err) {
        logger.error('Could not resolve the browser instance', err);
    }
}

const pageController = {
    scrapeAll
};

export default pageController;
