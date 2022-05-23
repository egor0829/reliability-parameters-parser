// eslint-disable-next-line @typescript-eslint/ban-types
type Adapter<StopData extends AnyObject = {}, ErrorUrls extends AnyObject = {}> = (
    browser: Puppeteer.Browser,
    url: string
) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/ban-types
type WrappedAdapter<StopData extends AnyObject = {}, ErrorUrls extends AnyObject = {}> = (
    browser: Puppeteer.Browser,
    url: string,
    stopData: StopData,
    errorUrls: ErrorUrls
) => Promise<void>;

export {Adapter, WrappedAdapter};
