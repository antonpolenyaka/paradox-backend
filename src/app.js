"use strict";

import dotenv from "dotenv";
import cron from "node-cron"; // Instancio el paquete 'node-cron' 
import express from "express"; // Instancio el paquete 'express' 
import { processTVL } from './tvl.js';
import { processSummaryTVL } from './summaryTVL.js';
import portfinder from 'portfinder';
import logger from './logger.js';
import { fNow } from './lib/dateTimeUtils.js';

dotenv.config();
logger.info(`${fNow()} Starting service!`);

// Creo una variable llamada 'app' y en ella coloco el método express(); del paquete 'express' 
const app = express();

// En el campo segundo coloc '*/5' para ejecutar una tarea en consola cada 5 segundos 
cron.schedule(process.env.TVL_CRON, processTVL);
cron.schedule(process.env.SUMMARY_CRON, processSummaryTVL);

// Ejecutamos la aplicación en el puerto 3000
const desiredPort = process.env.START_PORT;
const portRange = process.env.LIMIT_FREE_PORT_RANGE;

portfinder.getPort({
    port: desiredPort,
    stopPort: desiredPort + portRange, // Límite superior para la búsqueda de puerto
}, (err, port) => {
    if (err) {
        logger.error(fNow() + ' Error finding an available port: ' + err);
        return;
    }

    // Establece el puerto en la aplicación
    app.set('port', port);

    // Inicia el servidor
    app.listen(port, () => {
        logger.info(fNow() + ' Application listening on port ' + port);
    });
});
