import unique from 'unique-selector';

const RELIABILITY_PARAMETERS_KEYS = ['MTBF', 'MTTR', 'MTTF', 'MTTA'] as const;
type ReliabilityParameter = typeof RELIABILITY_PARAMETERS_KEYS[number];

const RELIABILITY_PARAMETERS: Record<ReliabilityParameter, string[]> = {
    MTBF: ['MTBF', 'Mean Time Between Failures', 'средняя наработка на отказ'],
    MTTR: ['MTTR', 'Mean Time To Repair', 'среднее время восстановления, исправления, реагирования или устранения'],
    MTTF: ['MTTF', 'Mean Time To Failure', 'средняя наработка до отказа'],
    MTTA: ['MTTA', 'Mean Time To Acknowledge', 'среднее время подтверждения']
};

const IGNORED_TAGS = ['script', 'style', 'head', 'link', 'meta', 'html'];

function findParentWithQuantitativeParameter(parentElement: Element): string | null | undefined {
    return Array.from(parentElement.childNodes).find((node) => node.textContent?.match(/\d/))?.textContent;
}

interface GoodDebugInfo {
    name?: string;
    url: string;
}

interface FoundReliabilityParameter extends GoodDebugInfo {
    reliabilityParameter: string;
}

interface NotFoundQuantitativeParameter extends FoundReliabilityParameter {
    parentElementSelector: string;
}

interface FoundQuantitativeParameter extends FoundReliabilityParameter {
    elementSelector: string;
    value: string;
}

async function getReliabilityParameters(
    page: Puppeteer.Page,
    goodName?: string
): Promise<{
    debugInfo: GoodDebugInfo;
    notFoundQuantitativeParameters: NotFoundQuantitativeParameter[];
    foundReliabilityParameters: FoundQuantitativeParameter[];
}> {
    const notFoundQuantitativeParameters: NotFoundQuantitativeParameter[] = [];
    const foundReliabilityParameters: FoundQuantitativeParameter[] = [];

    const allElements = await page.evaluate(
        (IGNORED_TAGS) =>
            Array.from(document.querySelectorAll('*')).filter(
                (element) => element.childElementCount === 0 && !IGNORED_TAGS.includes(element.tagName.toLowerCase())
            ),
        IGNORED_TAGS
    );

    const debugInfo: GoodDebugInfo = {
        name: goodName,
        url: page.url()
    };

    for (const element of allElements) {
        for (const reliabilityParameterKey in RELIABILITY_PARAMETERS) {
            for (const reliabilityParameter of RELIABILITY_PARAMETERS[reliabilityParameterKey]) {
                if (element.textContent?.match(new RegExp(reliabilityParameter, 'i')) && element.parentElement) {
                    const quantitativeParameter = findParentWithQuantitativeParameter(element.parentElement);
                    if (!quantitativeParameter) {
                        notFoundQuantitativeParameters.push({
                            ...debugInfo,
                            reliabilityParameter,
                            parentElementSelector: unique(element.parentElement)
                        });
                        continue;
                    }
                    foundReliabilityParameters.push({
                        ...debugInfo,
                        reliabilityParameter,
                        elementSelector: unique(element),
                        value: quantitativeParameter
                    });
                }
            }
        }
    }

    // console.log('debugInfo:', debugInfo);
    // console.log('notFoundQuantitativeParameters:', notFoundQuantitativeParameters);
    // console.log('foundReliabilityParametersNodes:', foundReliabilityParameters);
    // console.log();

    return {
        debugInfo,
        notFoundQuantitativeParameters,
        foundReliabilityParameters
    };
}

export {
    RELIABILITY_PARAMETERS,
    getReliabilityParameters,
    GoodDebugInfo,
    FoundQuantitativeParameter,
    NotFoundQuantitativeParameter,
    ReliabilityParameter
};
