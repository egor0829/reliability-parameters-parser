import {exposeDepsJs} from 'src/parser/utils/page';
import logger from 'src/parser/winston';

interface AutoScrollOptions {
    onScrollTick?: () => Promise<void>;
    onScrollEnd?: () => Promise<boolean>;
}

const SCROLL_DISTANCE = 300;
const SCROLL_INTERVAL = 100;

async function autoScroll(page: Puppeteer.Page, options?: AutoScrollOptions): Promise<void> {
    console.log('autoScroll called');
    if (options) {
        const functionsToExpose: Record<string, (...args: any) => any> = Object.fromEntries(
            Object.entries(options).filter(([_, v]) => typeof v === 'function')
        );
        await page.evaluate(exposeDepsJs(functionsToExpose));
    }

    try {
        await page.evaluate(
            async ({SCROLL_DISTANCE, SCROLL_INTERVAL}) => {
                console.log('scroll started');

                await new Promise<void>((resolve) => {
                    if (!('SetIntervalAsync' in window && window.SetIntervalAsync)) {
                        throw new Error("setIntervalAsync script didn't load");
                    }

                    let totalHeight = 0;
                    const distance = SCROLL_DISTANCE;

                    const timer = window.SetIntervalAsync.dynamic.setIntervalAsync(async () => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        // @ts-ignore
                        if ('onScrollTick' in window && window.onScrollTick) {
                            // @ts-ignore
                            window.onScrollTick.call(this);
                        }

                        if (totalHeight >= scrollHeight - window.innerHeight) {
                            console.log('scroll ended');
                            let shouldClearInterval = true;
                            // @ts-ignore
                            if (window.onScrollEnd) {
                                // @ts-ignore
                                shouldClearInterval = await window.onScrollEnd();
                                console.log('onScrollEnd done');
                            }

                            if (shouldClearInterval) {
                                (async () => {
                                    await window.SetIntervalAsync.clearIntervalAsync(timer);
                                    console.log('Stopped!');
                                    resolve();
                                })();
                            }
                        }
                    }, SCROLL_INTERVAL);
                });
            },
            {SCROLL_DISTANCE, SCROLL_INTERVAL}
        );
    } catch (err) {
        logger.error('Error when scrolling the page', err);
    }
}

export {autoScroll};
