import winston from 'winston';
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LEVEL_LOGGER,
  format: winston.format.combine(
    winston.format.colorize(), // Utilizando el formato colorize
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export default logger;