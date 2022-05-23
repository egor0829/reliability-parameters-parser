import {format} from 'date-fns';

function getCurrDateStr(): string {
    return format(new Date(), 'yyyy.MM.dd-HH.mm.ss');
}

export {getCurrDateStr};
