const unixTime = Math.floor(Date.now() / 1000);
const duration = (31 * 3600 * 24)
const expired =  unixTime + duration

export const expiring = new Date(expired * 1000)