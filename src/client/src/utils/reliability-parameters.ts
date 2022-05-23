const RELIABILITY_PARAMETERS: Record<string, string[]> = {
    MTBF: ['MTBF', 'Mean Time Between Failures', 'средняя наработка на отказ'],
    MTTR: ['MTTR', 'Mean Time To Repair', 'среднее время восстановления, исправления, реагирования или устранения'],
    MTTF: ['MTTF', 'Mean Time To Failure', 'средняя наработка до отказа'],
    MTTA: ['MTTA', 'Mean Time To Acknowledge', 'среднее время подтверждения']
};

export {RELIABILITY_PARAMETERS};
