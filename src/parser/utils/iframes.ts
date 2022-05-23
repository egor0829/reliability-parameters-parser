async function preventFromLoadingIFrames(page: Puppeteer.Page) {
    const selectorToRemove = 'iframe';
    return page.evaluate((selector) => {
        async function removeIFrames() {
            const elements = document.querySelectorAll(selector);
            console.log('iframes count:', elements.length);
            for (let i = 0; i < elements.length; i++) {
                console.log(elements[i].parentNode);
                elements[i].parentNode.removeChild(elements[i]);
                console.log(elements[i].parentNode);
            }
        }

        return new Promise<void>((res, rej) => {
            addEventListener('readystatechange', async (event) => {
                console.log(event);
                // console.log('DOM fully loaded and parsed');
                // await removeIFrames();
                // res();
            });
        });
    }, selectorToRemove);
}

async function waitForAllIFramesLoaded(page: Puppeteer.Page) {
    const expectedNumberOfFrames = (await page.$$('iframe')).length;
    console.log(`expected ${expectedNumberOfFrames} iframes`);
    return new Promise<void>((resolve) => {
        // wait until all frames are navigated
        let numberOfLoadedFrames = 0;
        page.on('framenavigated', () => {
            console.log(`${numberOfLoadedFrames} iframes loaded`);
            numberOfLoadedFrames += 1;
            if (numberOfLoadedFrames === expectedNumberOfFrames + 1) {
                resolve();
            }
        });
    });
}

export {preventFromLoadingIFrames, waitForAllIFramesLoaded};
