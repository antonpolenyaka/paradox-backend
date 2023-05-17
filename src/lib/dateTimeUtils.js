export function fNow() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const currentDateAndTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return currentDateAndTime;
}

export function unixTimestamp() {
    return Date.now();
}

export function unixTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
}

export default { fNow };