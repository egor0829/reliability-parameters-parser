import logger from 'src/parser/winston';

function logError(message: string, err: any, page?: Puppeteer.Page, meta?: Record<string, any>) {
    const url = page?.url();
    const isError = err instanceof Error;
    logger.error(message, {
        err: isError ? err.message : err,
        trace: isError ? err.stack : undefined,
        url,
        ...meta
    });
}

function logInfo(message: string, err?: any, page?: Puppeteer.Page, meta?: Record<string, any>) {
    const url = page?.url();
    const isError = err instanceof Error;
    logger.info(message, {
        err: isError ? err.message : err,
        trace: isError ? err.stack : undefined,
        url,
        ...meta
    });
}

export {logError, logInfo};
