import MongoDB from './models/MongoDB.js';
import logger from './logger.js';
import {
    fNow,
    unixTimestamp,
    dateToTimestampD000,
    dateToTimestampM000,
    dateToTimestampY000,
    dateToTimestampD999,
    dateToTimestampM999,
    dateToTimestampY999,
    timestampToHumanDay,
    timestampToHumanMonth,
    timestampToHumanYear,
    incrementToNextMonth,
    incrementToNextYear
} from './lib/dateTimeUtils.js';
import dotenv from "dotenv";

dotenv.config();

async function processDailyData(startDate, endDate) {
    logger.info("Exec processDailyData startDate " + startDate + " endDate " + endDate);
    let client;
    let result;
    try {
        const { mc, db } = await MongoDB.Connect();
        client = mc;

        const dataCollection = db.collection('tvl');
        const summaryCollection = db.collection('daily-tvl');

        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const todayTimestamp = dateToTimestampD000(new Date());

        while (currentDate <= lastDate) {
            const startOfDay = dateToTimestampD000(currentDate);
            const day = timestampToHumanDay(startOfDay);
            logger.info("Process " + day);

            // Verificar si ya existe un resumen para la fecha actual o si es la fecha actual
            const existingSummary = await summaryCollection.findOne({ timestamp: startOfDay });
            const isToday = startOfDay === todayTimestamp;

            if (!existingSummary || isToday || process.env.FORCE_REPLACE_SUMMARY === 'true') {
                // Obtener los datos del día actual desde la colección 'datos'
                const endOfDay = dateToTimestampD999(currentDate);
                const query = { blockTimestamp: { $gte: startOfDay, $lte: endOfDay } };
                const items = await dataCollection.find(query).toArray();

                let total = 0;
                let count = 0;

                items.forEach(item => {
                    const parsedValue = parseFloat(item.balanceHuman);
                    if (!isNaN(parsedValue) && parsedValue > 0) {
                        total += parsedValue;
                        count++;
                    }
                });

                const average = (count === 0) ? 0 : total / count;

                // Guardar el resumen en la colección 'summary'                
                let sign;

                if (existingSummary) {
                    sign = "U";

                    const queryUpdate = {
                        $set: {
                            value: average,
                            updateTimestamp: unixTimestamp(),
                            validValues: count
                        }
                    };

                    await summaryCollection.updateOne({ _id: existingSummary._id }, queryUpdate, { upsert: false });
                } else {
                    sign = "A";

                    const summary = {
                        timestamp: startOfDay,
                        day: day,
                        value: average,
                        updateTimestamp: unixTimestamp(),
                        validValues: count
                    };

                    await summaryCollection.insertOne(summary);
                }

                logger.info(`[ ${sign} ] Result saved for date ${startOfDay} (${(day)}): Average = ${average}`);
            }

            // Avanzar al siguiente día
            currentDate.setDate(currentDate.getDate() + 1);
        }
        result = true;
    } catch (error) {
        logger.error('ERROR (processDailyData): ' + error.message);
        result = false;
    } finally {
        client.close();
    }
    logger.info("End processDailyData");
    return result;
}

async function processMonthlyData(startDate, endDate) {
    logger.info("Exec processMonthlyData startDate " + startDate + " endDate " + endDate);
    let client;
    let result;
    try {
        const { mc, db } = await MongoDB.Connect();
        client = mc;

        const dataCollection = db.collection('daily-tvl');
        const summaryCollection = db.collection('monthly-tvl');

        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const currentMonthTimestamp = dateToTimestampM000(new Date());

        while (currentDate <= lastDate) {
            const startOfMonth = dateToTimestampM000(currentDate);
            const month = timestampToHumanMonth(startOfMonth);
            logger.info("Process " + month);

            // Verificar si ya existe un resumen para la fecha actual o si es la fecha actual
            const existingSummary = await summaryCollection.findOne({ timestamp: startOfMonth });
            const isCurrentMonth = startOfMonth === currentMonthTimestamp;

            if (!existingSummary || isCurrentMonth || process.env.FORCE_REPLACE_SUMMARY === 'true') {
                // Obtener los datos del día actual desde la colección 'datos'
                const endOfMonth = dateToTimestampM999(currentDate);
                const query = { timestamp: { $gte: startOfMonth, $lte: endOfMonth } };
                const items = await dataCollection.find(query).toArray();

                let total = 0;
                let count = 0;
                let originValues = [];

                items.forEach(item => {
                    if (item.value > 0) {
                        total += item.value;
                        count++;
                    }
                    originValues.push(item.value);
                });

                const average = (count === 0) ? 0 : total / count;

                // Guardar el resumen en la colección 'summary'                
                let sign;

                if (existingSummary) {
                    sign = "U";

                    const queryUpdate = {
                        $set: {
                            value: average,
                            updateTimestamp: unixTimestamp(),
                            originValues: originValues,
                            validValues: count
                        }
                    };

                    await summaryCollection.updateOne({ _id: existingSummary._id }, queryUpdate, { upsert: false });
                } else {
                    sign = "A";

                    const summary = {
                        timestamp: startOfMonth,
                        month: month,
                        value: average,
                        updateTimestamp: unixTimestamp(),
                        originValues: originValues,
                        validValues: count
                    };

                    await summaryCollection.insertOne(summary);
                }

                logger.info(`[ ${sign} ] Result saved for date ${startOfMonth} (${(month)}): Average = ${average}`);
            }

            // Avanzar al siguiente día
            currentDate = incrementToNextMonth(currentDate);
        }
        result = true;
    } catch (error) {
        logger.error('ERROR (processMonthlyData): ' + error.message);
        result = false;
    } finally {
        client.close();
    }
    logger.info("End processMonthlyData");
    return result;
}

async function processAnnualData(startDate, endDate) {
    logger.info("Exec processAnnualData startDate " + startDate + " endDate " + endDate);
    let client;
    let result;
    try {
        const { mc, db } = await MongoDB.Connect();
        client = mc;

        const dataCollection = db.collection('monthly-tvl');
        const summaryCollection = db.collection('annual-tvl');

        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const currentYearTimestamp = dateToTimestampY000(new Date());

        while (currentDate <= lastDate) {
            const startOfYear = dateToTimestampY000(currentDate);
            const year = timestampToHumanYear(startOfYear);
            logger.info("Process " + year);

            // Verificar si ya existe un resumen para la fecha actual o si es la fecha actual
            const existingSummary = await summaryCollection.findOne({ timestamp: startOfYear });
            const isCurrentYear = startOfYear === currentYearTimestamp;

            if (!existingSummary || isCurrentYear || process.env.FORCE_REPLACE_SUMMARY === 'true') {
                // Obtener los datos del día actual desde la colección 'datos'
                const endOfYear = dateToTimestampY999(currentDate);
                const query = { timestamp: { $gte: startOfYear, $lte: endOfYear } };
                const items = await dataCollection.find(query).toArray();

                let total = 0;
                let count = 0;
                let originValues = [];

                items.forEach(item => {
                    if (item.value > 0) {
                        total += item.value;
                        count++;
                    }
                    originValues.push(item.value);
                });

                const average = (count === 0) ? 0 : total / count;

                // Guardar el resumen en la colección 'summary'                
                let sign;

                if (existingSummary) {
                    sign = "U";

                    const queryUpdate = {
                        $set: {
                            value: average,
                            updateTimestamp: unixTimestamp(),
                            originValues: originValues,
                            validValues: count
                        }
                    };

                    await summaryCollection.updateOne({ _id: existingSummary._id }, queryUpdate, { upsert: false });
                } else {
                    sign = "A";

                    const summary = {
                        timestamp: startOfYear,
                        year: year,
                        value: average,
                        updateTimestamp: unixTimestamp(),
                        originValues: originValues,
                        validValues: count
                    };

                    await summaryCollection.insertOne(summary);
                }

                logger.info(`[ ${sign} ] Result saved for date ${startOfYear} (${(year)}): Average = ${average}`);
            }

            currentDate = incrementToNextYear(currentDate);
        }
        result = true;
    } catch (error) {
        logger.error('ERROR (processAnnualData): ' + error.message);
        result = false;
    } finally {
        client.close();
    }
    logger.info("End processAnnualData");
    return result;
}

export async function processSummaryTVL() {
    try {
        // Process daily TVL
        const startDate = '2023-04-01'; // Fecha de inicio en formato 'yyyy-mm-dd'
        const endDate = '2023-05-31'; // Fecha de fin en formato 'yyyy-mm-dd'

        // Daily
        let result = await processDailyData(startDate, endDate);
        logger.info(fNow() + ' processDailyData is finished: ' + result);

        // Monthly
        result = await processMonthlyData(startDate, endDate);
        logger.info(fNow() + ' processMonthlyData is finished: ' + result);

        // Annual
        result = await processAnnualData(startDate, endDate);
        logger.info(fNow() + ' processAnnualData is finished: ' + result);
    } catch (err) {
        logger.error(fNow() + " processSummaryTVL() " + err);
    }
}

export default { processSummaryTVL };