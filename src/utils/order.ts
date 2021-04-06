import * as moment from 'moment';
import { randomIn } from './helper';

export const expiring = (day) => {
    const unixTime = Math.floor(Date.now() / 1000);
    const duration = (day * 3600 * 24)
    const expired =  unixTime + duration
    return new Date(expired * 1000)
}

export const toInvoice = (day) => {
    /** 280619SKU02213736 */
    const dmy = moment(day).format('DDMMYY')
    const tracking = randomIn(7);
    const invoice = `${dmy}SKU${tracking}`
    
    return {tracking, invoice}
}

export const randThree = () => Math.floor(Math.random()*(100)+100) // Math.floor((Math.random() * 1000) + 1); 