import puppeteer from 'puppeteer';
import {WindowMethods} from 'src/utils/window';

type SetIntervalAsyncDynamic = {
    setIntervalAsync: typeof SetIntervalAsync.dynamic.setIntervalAsync;
    clearIntervalAsync: typeof SetIntervalAsync.clearIntervalAsync;
    SetIntervalAsyncError: typeof SetIntervalAsync.SetIntervalAsyncError;
};

declare global {
    namespace Puppeteer {
        type Browser = puppeteer.Browser;
        type ElementHandle<ElementType extends Element = Element> = puppeteer.ElementHandle<ElementType>;
        type Page = puppeteer.Page;
        type Frame = puppeteer.Frame;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Window extends Partial<WindowMethods>, SetIntervalAsyncDynamic {}

    // declare module '*';

    type JSONArray = readonly Serializable[];
    interface JSONObject {
        [key: string]: Serializable;
    }
    type Serializable = number | string | boolean | null | BigInt | JSONArray | JSONObject;
    type SerializableObject = Record<string, Serializable>;

    type AnyObject = Partial<Record<string, unknown>>;
}
