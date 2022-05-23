import windowMethods from 'src/parser/utils/window';
import logger from 'src/parser/winston';

async function evaluateFunctions(page: Puppeteer.Page, functionsObj: Record<string, (...args: any) => any>) {
    const functionsToExpose = Object.fromEntries(
        Object.entries(functionsObj).filter(([_, v]) => typeof v === 'function')
    );
    await page.evaluate(exposeDepsJs(functionsToExpose));
}

async function evaluateWindowFunctions(page: Puppeteer.Page) {
    return evaluateFunctions(page, windowMethods);
}

async function addReloadListener(page: Puppeteer.Page, onLoad: (...args: any) => any) {
    await onLoad();

    return page.on('load', onLoad);
}

interface OpenPageOptions {
    onOpen?: (page: Puppeteer.Page) => Promise<void>;
    reloadListeners?: ((page: Puppeteer.Page) => Promise<any>)[];
}

async function openPage(page: Puppeteer.Page, link: string, options?: OpenPageOptions) {
    await page.goto(link, {waitUntil: 'networkidle0'});

    await addReloadListener(page, () => evaluateWindowFunctions(page));

    await addReloadListener(page, () =>
        page.addScriptTag({
            url: 'https://unpkg.com/set-interval-async',
            id: 'set-interval-async'
        })
    );

    options?.reloadListeners?.map(async (reloadListener) => await addReloadListener(page, () => reloadListener(page)));

    await options?.onOpen?.(page);

    return page;
}

async function openNewPage(browser: Puppeteer.Browser, link: string, options?: OpenPageOptions) {
    const page = await browser.newPage();
    await page.setBypassCSP(true);

    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (req.resourceType() === 'image') {
            req.abort();
        } else {
            req.continue();
        }
    });

    await openPage(page, link, options);

    return page;
}

// https://github.com/puppeteer/puppeteer/issues/724#issuecomment-896755822
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const exposeDepsJs = (deps: Record<string, (...args: any) => any>): string => {
    return Object.keys(deps)
        .map((key) => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return `window["${key}"] = ${deps[key]};`;
        })
        .join('\n');
};

async function removeElements(page: Puppeteer.Page, selector: string) {
    return page.evaluate((sel) => {
        windowMethods.removeElements(sel);
    }, selector);
}

interface DomChangeObserverOptions extends Record<string, (...args: any) => any> {
    onDomChange: () => void;
}

// https://stackoverflow.com/a/62365560
async function domChangeObserver(page: Puppeteer.Page, options: DomChangeObserverOptions) {
    if (options) {
        await evaluateFunctions(page, options);
    }

    return page.evaluate(() => {
        const target = document.querySelector('body');
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    // console.log('mutation:', mutation);
                    // @ts-ignore
                    onDomChange();
                }
            }
        });
        observer.observe(target as HTMLBodyElement, {childList: true});
    });
}

// https://github.com/puppeteer/puppeteer/issues/2977#issuecomment-680091028
async function waitAndClick(page: Puppeteer.Page, selector: string) {
    try {
        return page.evaluate((selector) => document.querySelector(selector).click(), selector);
    } catch (err) {
        const url = page.url();
        logger.error('Error when click element', {err: err instanceof Error ? err.message : err, url, selector});
    }
}

export {openPage, openNewPage, exposeDepsJs, removeElements, domChangeObserver, evaluateWindowFunctions, waitAndClick};
