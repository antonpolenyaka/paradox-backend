import MongoDB from './models/MongoDB.js';
import logger from './logger.js';
import {
    fNow,
    unixTimestamp,
    dateToTimestamp000,
    dateToTimestamp999,
    timestampToHumanDay,
    timestampToHumanMonth,
    timestampToHumanYear
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
        const todayTimestamp = dateToTimestamp000(new Date());

        while (currentDate <= lastDate) {
            logger.info("Process " + currentDate);
            const startOfDay = dateToTimestamp000(currentDate);

            // Verificar si ya existe un resumen para la fecha actual o si es la fecha actual
            const existingSummary = await summaryCollection.findOne({ dayTimestamp: startOfDay });
            const isToday = startOfDay === todayTimestamp;

            if (!existingSummary || isToday) {
                // Obtener los datos del día actual desde la colección 'datos'
                const endOfDay = dateToTimestamp999(currentDate);
                //const query = { blockTimestamp: { $gte: startOfDay, $lte: endOfDay } };
                const query = { blockTimestamp: { $gte: startOfDay, $lte: endOfDay } };
                const items = await dataCollection.find(query).toArray();

                let total = 0;
                let count = 0;

                items.forEach(item => {
                    total += parseFloat(item.balanceHuman);
                    count++;
                });

                const average = (count === 0) ? 0 : total / count;

                // Guardar el resumen en la colección 'summary'
                const summary = {
                    dayTimestamp: startOfDay,
                    day: timestampToHumanDay(startOfDay),
                    value: average,
                    updateTimestamp: unixTimestamp()
                };

                await summaryCollection.insertOne(summary);

                const sign = existingSummary ? "u" : "+";
                logger.info(`[ ${sign} ] Result saved for date ${startOfDay} (${(summary.day)}): Average = ${average}`);
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

export async function processSummaryTVL() {
    try {
        // Process daily TVL
        const startDate = '2023-04-01'; // Fecha de inicio en formato 'yyyy-mm-dd'
        const endDate = '2023-05-31'; // Fecha de fin en formato 'yyyy-mm-dd'

        let result = processDailyData(startDate, endDate);
        logger.info(fNow() + ' processDailyData is finished: ' + result);
    } catch (err) {
        logger.error(fNow() + " processSummaryTVL() " + err);
    }
}

export default { processSummaryTVL };