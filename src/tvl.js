import { selectError } from './lib/errorManager.js';
import GenericEntityModel from './models/GenericEntityModel.js';
import MongoDB from './models/MongoDB.js';
import { ethers, Contract, formatUnits } from "ethers";
import logger from './logger.js';
import { fNow, unixTimestampInMilliseconds, unixTimestamp } from './lib/dateTimeUtils.js';
import dotenv from "dotenv";

dotenv.config();

async function getLatestBlockTimestamp(provider) {
    // Obtener el número del último bloque minado
    const latestBlockNumber = await provider.getBlockNumber();

    // Obtener información del último bloque
    const latestBlock = await provider.getBlock(latestBlockNumber);

    // Obtener el timestamp del último bloque
    const timestamp = latestBlock?.timestamp;

    return timestamp;
}

async function getTVL() {
    const provider = new ethers.JsonRpcProvider(process.env.HTTP_WEB_SOCKET_JSON_RPC_SERVER);
    const blockNumber = await provider.getBlockNumber();
    const abi = [
        "function decimals() public view returns (uint8)",
        "function symbol() public view returns (string memory)",
        "function balanceOf(address account) public view returns (uint256)"
    ];

    // Create a contract
    const contract = new Contract(process.env.PARADOX_TOKEN_ADDRESS, abi, provider);

    // The symbol name for the token
    const sym = await contract.symbol();

    // The number of decimals the token uses
    const decimals = await contract.decimals();

    // Read the token balance for an account
    const balance = await contract.balanceOf(process.env.STAKE_POOL_CONTRACT);

    // Format the balance for humans, such as in a UI
    const balanceHuman = formatUnits(balance, decimals);

    const blockTimestamp = await getLatestBlockTimestamp(provider);

    const result = {
        blockNumber,
        sym, 
        decimals: decimals.toString(),
        balance: balance.toString(),
        balanceHuman,
        unixTimestamp: unixTimestampInMilliseconds(),
        unixTimestamp: unixTimestamp(),
        blockTimestamp: blockTimestamp ?? 0
    };
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
        let query = tvlData;
        query.updateTimestamp = unixTimestamp();
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
        let resultBlockchain = await getTVL();
        logger.info(fNow() + ' Result Blockchain: ' + JSON.stringify(resultBlockchain));
        // Save TVL in Database
        let resultDB = await insertTVL(resultBlockchain);
        resultDB = JSON.stringify(resultDB);
        logger.info(fNow() + ' Result Database: ' + resultDB);
    } catch (err) {
        logger.error(fNow() + " processTVL() " + err);
    }
}

export default { processTVL };