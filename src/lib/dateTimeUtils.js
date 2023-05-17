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

export function unixTimestampInMilliseconds() {
    return Date.now();
}

// In seconds
export function unixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

export function getStartOfDayTimestamp(timestamp) {
    const date = new Date(timestamp * 1000); // Multiplicar por 1000 para convertir a milisegundos
    date.setUTCHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00 UTC

    const startOfDayTimestamp = Math.floor(date.getTime() / 1000); // Dividir por 1000 para convertir a segundos

    return startOfDayTimestamp;
}

// In seconds
export function dateToTimestamp(date) {
    const timestampInSeconds = Math.floor(date.getTime() / 1000);
    return timestampInSeconds;
}

// In seconds Day
export function dateToTimestampD000(date) {
    date.setUTCHours(0, 0, 0, 0); // Establecer la hora
    return dateToTimestamp(date);
}

// In seconds Month
export function dateToTimestampM000(date) {
    date.setUTCHours(0, 0, 0, 0); // Establecer la hora
    date.setDate(1); // Establecer el día como el primer día del mes
    return dateToTimestamp(date);
}

// In seconds Year
export function dateToTimestampY000(date) {
    date.setUTCHours(0, 0, 0, 0); // Establecer la hora
    date.setUTCMonth(0, 1); // Establecer el mes como enero y el día como el primer día del año
    return dateToTimestamp(date);
}

// End of Day
export function dateToTimestampD999(date) {
    date.setUTCHours(23, 59, 59, 999); // Establecer la hora
    return dateToTimestamp(date);
}

// End of Month
export function dateToTimestampM999(date) {
    date.setUTCHours(23, 59, 59, 999); // Establecer la hora
    date.setUTCMonth(date.getUTCMonth() + 1, 0); // Establecer el mes siguiente y el día anterior al primer día del mes siguiente
    return dateToTimestamp(date);
}

// End of Year
export function dateToTimestampY999(date) {
    date.setUTCHours(23, 59, 59, 999); // Establecer la hora
    date.setUTCMonth(11, 31); // Establecer el mes y el día
    return dateToTimestamp(date);
}

export function timestampToHumanDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

export function timestampToHumanDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

export function timestampToHumanMonth(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);

    const formattedDate = `${month}/${year}`;
    return formattedDate;
}

export function timestampToHumanYear(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();

    const formattedDate = `${year}`;
    return formattedDate;
}

export function incrementToNextMonth(date) {
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(1);
    newDate.setUTCMonth(newDate.getUTCMonth() + 1);
    return newDate;
}

export function incrementToNextYear(date) {
    const newDate = new Date(date.getTime());
    newDate.setUTCFullYear(newDate.getUTCFullYear() + 1);
    newDate.setUTCMonth(0);
    newDate.setUTCDate(1);
    return newDate;
}

export default { fNow };