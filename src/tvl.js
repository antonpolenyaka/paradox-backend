import { selectError } from './lib/errorManager.js';
import GenericEntityModel from './models/GenericEntityModel.js';
import MongoDB from './models/MongoDB.js';
import { ethers } from "ethers";
import { parseUnits } from 'ethers';
import { HDNodeWallet } from 'ethers/wallet';
import logger from './logger.js';
import { fNow } from './lib/dateTimeUtils.js';

// Formate date
function mostrarFecha(verFecha) {

    let fecha, mes, anio;

    fecha = verFecha.getDate();
    mes = verFecha.getMonth() + 1;
    anio = verFecha.getFullYear();

    fecha = fecha.toString().padStart(2, '0');
    mes = mes.toString().padStart(2, '0');

    return `${fecha}-${mes}-${anio}`;
}

function getTVL() {
    const result = mostrarFecha(new Date());
    return result;
}

async function insertTVL(tvlData) {
    let result = undefined;
    let replaceError = "Error: unknown";
    try {
        const entityType = 'tvl';
        replaceError = `Error: now is not possible to add ${entityType}`;

        // Chec input data
        if (entityType === undefined || entityType === '' || entityType === null) {
            throw new Error(selectError("Entity type is not provided", replaceError));
        }

        let mcLocal = null;
        let dbLocal = null;

        logger.debug(fNow() + ' Connecting to BD');
        // Open mongodb conection
        // mc - MongoClient, db - Db
        let { mc, db } = await MongoDB.Connect();

        mcLocal = mc;
        dbLocal = db;

        // Make query
        let query = { tvlData };
        query.updateTimestamp = Date.now();
        query.type = entityType;

        logger.debug(fNow() + ' Start insert data in Database');
        // cr = commandResult
        let cr = await GenericEntityModel.InsertOne(dbLocal, query, entityType);

        if (cr.acknowledged !== true) {
            throw new Error(selectError("MongoDB command result acknowledged === false", replaceError));
        }

        // Check if item is realy inserted
        logger.debug(fNow() + ' Finding inserted data');
        let itemFinded = await GenericEntityModel.FindOneById(dbLocal, cr.insertedId, entityType);

        if (itemFinded === null) {
            throw new Error(selectError(`${entityType} not finded after insert`, replaceError));
        }

        logger.debug(fNow() + ' Inserted data finded');
        result = {
            ok: true,
            result: {
                added: true,
                description: `Added entity with type '${entityType}'`,
                entity: itemFinded,
            }
        };

        logger.debug(fNow() + ' Finished try insert data to Database');
        if (mcLocal) {
            MongoDB.Close(mcLocal);
            mcLocal = null;
        }
        dbLocal = null;
    } catch (err) {
        logger.error(`${fNow()}`, err);
        result = {
            ok: false,
            message: selectError(err.message, replaceError)
        };
    }
    logger.debug(fNow() + ' Ended the function for insert data to Database');
    return result;
}

export async function processTVL() {
    try {
        // Get TVL from Blockchain
        let resultBlockchain = getTVL();
        logger.info(fNow() + ' Result Blockchain: ' + resultBlockchain);
        // Save TVL in Database
        let resultDB = await insertTVL(resultBlockchain);
        if(typeof(resultDB) === 'object') {
            resultDB = JSON.stringify(resultDB);
        }
        logger.info(fNow() + ' Result Database: ' + resultDB);
    } catch (err) {
        logger.error(fNow() + " processTVL() " + err);
    }
}

export default { processTVL };