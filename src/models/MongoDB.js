"use strict";

import mongo from 'mongodb';
import dotenv from "dotenv";

dotenv.config();
let MongoClient = mongo.MongoClient;

class MongoDB {
    static Connect() {
        const mc = new MongoClient(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true });
        return mc.connect()
            .then(() => {
                let db = mc.db(process.env.DB_DATABASE);
                return { mc, db };
            });
    }

    static Close(mc) {
        mc.close();
    }
}

export default MongoDB;