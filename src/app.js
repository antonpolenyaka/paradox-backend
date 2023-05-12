
const cron = require("node-cron"); // Instancio el paquete 'node-cron' 
const express = require("express"); // Instancio el paquete 'express' 
const { processTVL } = require('./tvl');

// Creo una variable llamada 'app' y en ella coloco el método express(); del paquete 'express' 
const app = express();

// En el campo segundo coloc '*/5' para ejecutar una tarea en consola cada 5 segundos 
cron.schedule("*/5 * * * * *", processTVL);

// Ejecutamos la aplicación en el puerto 3000
app.listen(3000);
