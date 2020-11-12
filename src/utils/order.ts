import * as moment from 'moment';

export const expiring = (day) => {
    const unixTime = Math.floor(Date.now() / 1000);
    const duration = (day * 3600 * 24)
    const expired =  unixTime + duration
    return new Date(expired * 1000)
}

export const toInvoice = (day) => {
    /** 280619SKU02213736 */
    const dmy = moment(day).format('DMYY')
    const tracking = Math.floor((Math.random() * 10000000) + 1);
    const invoice = `${dmy}SKU${tracking}`
    
    return {tracking, invoice}
}