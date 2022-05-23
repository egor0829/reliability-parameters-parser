import {Adapter, WrappedAdapter} from 'src/parser/adapters/types';
import {autoScroll} from 'src/parser/utils/auto-scroll';
import {openNewPage, evaluateWindowFunctions, domChangeObserver, waitAndClick} from 'src/parser/utils/page';
import {getReliabilityParameters} from 'src/parser/lib/reliability-parameters';
import {login} from 'src/parser/adapters/dir.indiamart.com/login';
import EquipmentService from 'src/db/services/equipment';
import {ICompanySchema} from 'src/db/models/company';
import logger from 'src/parser/winston';
import {logError, logInfo} from 'src/utils/log';
import {element2selector} from 'puppeteer-element2selector';
import adapterWrapper, {AnyObject} from 'src/parser/adapters/adapter-wrapper';

interface ScriptExit extends AnyObject {
    stopSubCategoryUrl?: string;
    stopGoodUrl?: string;
}

interface ErrorUrls extends AnyObject {
    subCategoryUrls?: string[];
    goodUrls?: string[];
}

let newStopData: ScriptExit = {};

let isGoodStopFound = false;
let isSubcategoryStopFound = false;

async function showMoreCategory(page: Puppeteer.Page, category: Puppeteer.ElementHandle<Element>): Promise<void> {
    try {
        // @ts-ignore
        const categorySelector = await element2selector(category);
        return waitAndClick(page, categorySelector + ' .show_m-new');
    } catch (err) {
        logError('Error when parsing good name', err, page);
    }
}

async function getSubCategoriesLinks(category: Puppeteer.ElementHandle): Promise<string[]> {
    return category.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a.slink'), (a) => a.href));
}

async function getGoodsLinks(page: Puppeteer.Page): Promise<string[]> {
    return page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a.ptitle'), (a) => a.href));
}

async function getInfo(page: Puppeteer.Page) {
    const goodNameElement = await page.$('h1.bo');
    const goodName: string | undefined = (await page.evaluate((el) => el?.textContent, goodNameElement)) || undefined;

    return getReliabilityParameters(page, goodName);
}

async function parseGoodPage(browser: Puppeteer.Browser, url: string) {
    newStopData.stopGoodUrl = url;
    const page = await openNewPage(browser, url, {
        reloadListeners: [(page) => domChangeObserver(page, {onDomChange})]
    });
    logInfo('Parse good page: ', null, page);

    let name;
    try {
        name = await page.$eval('.bo', (text) => text.textContent?.trim());
    } catch (err) {
        logError('Error when parsing good name', err, page);
        throw err;
    }

    console.log(name);

    if (!name) {
        return;
    }

    let categories: string[] | undefined;
    try {
        categories = await page.$$eval(
            // '.brd span[itemprop="itemListElement"]:not(:first-child) span[itemprop="name"]',
            '.fs12.pb10.mt10.vcrmb a span',
            (elements) => {
                const mapped = elements.map((el) => el.textContent?.trim()).filter(Boolean) as string[];
                const categories = mapped.length > 0 ? mapped : undefined;
                return categories;
            }
        );
    } catch (err) {
        logInfo('Error when parsing categories', err, page);
    }

    let details: Record<string, string> | undefined;
    try {
        details = await page.$eval('.dtlsec1>table>tbody', (table) => {
            const acc: Record<string, string> = {};

            for (let i = 0; i < table.children.length; i++) {
                const tr = table.children.item(i);
                const param = tr?.children.item(0)?.textContent?.trim().toLocaleLowerCase();
                const value = tr?.children.item(1)?.textContent?.trim();
                if (param && value) {
                    acc[param] = value;
                }
            }

            return acc;
        });
    } catch (err) {
        logError('Error when parsing details', err, page);
    }

    let goodImageUrls: string[] | undefined;
    try {
        const rawGoodImageUrls = await page.$$eval('img[id^="large_img"]', (images) => {
            console.log(images);
            return images.map((image) => image.attributes.getNamedItem('data-original')?.value?.trim());
        });
        const filtered = rawGoodImageUrls.filter(Boolean) as string[];
        goodImageUrls = filtered.length > 0 ? filtered : undefined;
    } catch (err) {
        logInfo('Error when parsing good image urls', err, page);
    }

    let description: string | undefined;
    try {
        description = await page.$eval('.fs16.lh28.pdpCtsr', (el) => el.textContent?.trim());
    } catch (err) {
        logInfo('Error when parsing good description', err, page);
    }

    let imageUrl: string | undefined;
    try {
        imageUrl = await page.$eval('#img_id', (el) => el.attributes.getNamedItem('src')?.value?.trim());
    } catch (err) {
        logInfo('Error when parsing good image url', err, page);
    }

    let company: ICompanySchema | undefined;
    try {
        const companyName = await page.$eval('#compNm', (el) => el.textContent?.trim());
        if (!companyName) {
            throw new Error('Not found company name');
        }
        company = await page.$eval('.f16.color6', (container) => {
            const acc: Record<string, string> = {};

            for (let i = 0; i < container.children.length; i++) {
                const block = container.children.item(i);
                const param = block?.children.item(0)?.textContent?.trim().toLocaleLowerCase();
                const value = block?.children.item(1)?.textContent?.trim();
                if (param && value) {
                    acc[param] = value;
                }
            }

            return acc as ICompanySchema;
        });

        company.name = companyName;
    } catch (err) {
        logInfo('Error when parsing good company info', err, page);
    }

    // console.log('details:', details);
    // console.log('description:', description);
    // console.log('imageUrl', imageUrl);
    // console.log('goodImages', goodImageUrls);
    // console.log('company', company);

    EquipmentService.saveOrUpdate(
        {
            name,
            url,
            imageUrl,
            description,
            goodImageUrls,
            details,
            categories
        },
        company
    );

    await getInfo(page);
    // console.log();
    // console.log();

    await page.close();
}

async function onScrollEnd(): Promise<boolean> {
    try {
        const showMoreButton = document.querySelector('li[id^="scroll"]');
        if (showMoreButton) {
            (showMoreButton as HTMLElement).click();

            if ('delay' in window && window.delay) {
                await window.delay(2000);
            }

            return false;
        }
    } catch (err) {
        console.error(err);
    }
    return true;
}

async function skipPromoPopup(page: Puppeteer.Page) {
    try {
        await page.waitForSelector('#idfpclose');
        return waitAndClick(page, '#idfpclose');
    } catch (err) {
        logError('Error when skipping promo popup', err, page);
    }
}

async function onDomChange() {
    if ('removeElements' in window && window.removeElements) {
        window.removeElements('iframe');
        window.removeElements('#t0901_mcont');
        window.removeElements('#t0901_bewrapper');
        window.removeElements('.n-only.n-only_n.lst_cl');
    }
}

let isAuthorized = false;

async function parseSubCategoryPage(
    browser: Puppeteer.Browser,
    url: string,
    stopData: ScriptExit,
    errorUrls: ErrorUrls
) {
    newStopData = {
        stopSubCategoryUrl: url,
        stopGoodUrl: undefined
    };

    logger.info('Parse sub category page: ', {url});
    const page = await openNewPage(browser, url, {
        reloadListeners: [
            (page) => domChangeObserver(page, {onDomChange}),
            (page) => page.addStyleTag({content: '.lst.lst_cl.mft2{display: none}'})
        ]
    });

    if (!isAuthorized) {
        await skipPromoPopup(page);
        await autoScroll(page, {onScrollEnd: () => Promise.resolve(true)});
        await page.evaluate(onScrollEnd);
        await login(page);
        isAuthorized = true;
        await evaluateWindowFunctions(page);
        await page.waitForSelector('li[id^="scroll"]');
    }

    await autoScroll(page, {onScrollEnd});

    const goodLinks: string[] = await getGoodsLinks(page);

    console.log('goodLinks.length: ', goodLinks.length);
    // console.log('goodLinks:', JSON.stringify(goodLinks));

    for (const goodLink of goodLinks) {
        // for (const goodLink of goodLinks.slice(0, 1)) {
        if (stopData.stopGoodUrl) {
            if (!isGoodStopFound && goodLink !== stopData.stopGoodUrl) {
                continue;
            }
            if (goodLink === stopData.stopGoodUrl) {
                logInfo('Found good stop url', null);
                isGoodStopFound = true;
            }
        }

        if (errorUrls.goodUrls && !errorUrls.goodUrls.includes(url)) {
            continue;
        }

        try {
            await parseGoodPage(browser, goodLink);
        } catch (err) {
            logger.error('Error when parsing good page', {err, url: goodLink});
        }
    }

    await page.close();
}

async function parseCategory(
    browser: Puppeteer.Browser,
    page: Puppeteer.Page,
    category: Puppeteer.ElementHandle<Element>,
    categoryName: string | undefined,
    stopData: ScriptExit,
    errorUrls: ErrorUrls
) {
    logger.info('Parse category page: ', {categoryName});
    await showMoreCategory(page, category);
    const subCategoriesLinks = await getSubCategoriesLinks(category);

    // for (const url of subCategoriesLinks.slice(0, 1)) {
    for (const url of subCategoriesLinks) {
        if (stopData.stopSubCategoryUrl) {
            if (!isSubcategoryStopFound && url !== stopData.stopSubCategoryUrl) {
                continue;
            }
            if (url === stopData.stopSubCategoryUrl) {
                isSubcategoryStopFound = true;
                logInfo('Found sub category stop url', null);
            }
        }

        if (errorUrls.subCategoryUrls && !errorUrls.subCategoryUrls.includes(url)) {
            continue;
        }

        try {
            await parseSubCategoryPage(browser, url, stopData, errorUrls);
        } catch (err) {
            logError('Error when parsing subcategory page', err, page, {categoryUrl: url});
        }
    }
}

const CATEGORIES_TO_SKIP = ['Signal Cables', 'AV Cable', 'LAN Cable', 'Network Communication Connector'];

async function rawAdapter(
    ...[browser, url, stopData, errorUrls]: Parameters<WrappedAdapter<ScriptExit, ErrorUrls>>
): ReturnType<Adapter<ScriptExit, ErrorUrls>> {
    logger.info('Parse site: ', {url});
    const page = await openNewPage(browser, url);

    const categories = await page.$$('.box-new');

    for (const category of categories) {
        // for (const category of categories.slice(0, 1)) {
        let categoryName;
        try {
            categoryName = await category.$eval('.box-new .s-tile', (text) => text.textContent?.trim());
        } catch (err) {
            logInfo('Error when parsing category name', err, page);
        }

        if (categoryName && CATEGORIES_TO_SKIP.includes(categoryName)) {
            continue;
        }

        try {
            await parseCategory(browser, page, category, categoryName, stopData, errorUrls);
        } catch (err) {
            logError('Error when parsing category', err, page, {categoryName});
        }
    }

    await page.close();
}

const adapter = adapterWrapper<ScriptExit, ErrorUrls>(rawAdapter, newStopData, __dirname);

export {adapter};
