"use strict";
import dotenv from "dotenv";

dotenv.config();

export function selectError(realError, replaceMessage) {
    const devMode = process.env.DEV_MODE;
    let message;
    if(devMode.toString() === "true") {
        message = realError;
    } else {
        message = replaceMessage;
    }
    return message;
}

export function selectInfo(realInfo, replaceMessage) {
    const devMode = process.env.DEV_MODE;
    let message;
    if(devMode.toString() === "true") {
        message = realInfo;
    } else {
        message = replaceMessage;
    }
    return message;
}

export default { selectError, selectInfo };