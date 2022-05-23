import fs from 'fs';
import path from 'path';
import {Adapter, WrappedAdapter} from 'src/adapters/types';
import {addExitCallback, removeExitCallback} from 'catch-exit';
import {getCurrDateStr} from 'src/utils/date';
import {getLastFile} from 'src/utils/files';
import {logError, logInfo} from 'src/utils/log';

function adapterWrapper<StopData extends AnyObject, ErrorUrls extends AnyObject>(
    adapter: WrappedAdapter,
    newStopData: StopData,
    dir: fs.PathLike | string
): Adapter<StopData, ErrorUrls> {
    let stopData = {} as StopData;
    if (process.env.START_FROM_STOP_POINT) {
        logInfo('Parsing will started from stop point');
        try {
            const fullDirPath = path.resolve(dir.toString(), 'stopData');
            const lastFile = getLastFile(fullDirPath);
            const stopDataFile = fs.readFileSync(path.resolve(fullDirPath, lastFile));
            stopData = JSON.parse(stopDataFile.toString()) || {};
            console.log('stopData', stopData);
        } catch (err) {
            logError('Error when reading last stopped data file', err);
        }
    }

    let errorUrls = {} as ErrorUrls;
    if (process.env.RETRY_ERROR_URLS) {
        logInfo('Parsing will include only error urls');
        try {
            const fullDirPath = path.resolve(dir.toString(), 'errorUrls');
            const lastFile = getLastFile(fullDirPath);
            const errorUrlsFile = fs.readFileSync(path.resolve(fullDirPath, lastFile));
            errorUrls = JSON.parse(errorUrlsFile.toString()) || {};
            console.log('stopData', stopData);
        } catch (err) {
            logError('Error when reading last error urls file', err);
        }
    }

    return async function (...args: Omit<Parameters<Adapter>, 'stopData'>): ReturnType<Adapter> {
        // logInfo('Adding exit callback');
        // const exitCallback = addExitCallback(() => {
        //     logInfo('Exit callback is called');
        //     fs.writeFileSync(__dirname + `/stopData/stopData.${getCurrDateStr()}.json`, JSON.stringify(newStopData));
        // });

        // @ts-ignore
        const result = await adapter(...args, stopData, errorUrls);

        // logInfo('Removing exit callback');
        // removeExitCallback(exitCallback);

        return result;
    };
}

export default adapterWrapper;
export {AnyObject};
