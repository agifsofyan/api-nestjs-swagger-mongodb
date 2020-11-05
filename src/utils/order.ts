export const expiring = (day) => {
    const unixTime = Math.floor(Date.now() / 1000);
    const duration = (day * 3600 * 24)
    const expired =  unixTime + duration
    return new Date(expired * 1000)
}