"use strict";

import mongo from 'mongodb';
import dotenv from "dotenv";

dotenv.config();
let MongoClient = mongo.MongoClient;

class MongoDB {

    static Connect() {
        return MongoClient.connect(process.env.DB_CONNECTION_STRING)
            .then(mc => { // mongoClient
                let db = mc.db(process.env.DB_DATABASE);
                return { mc, db };
            });
    }

    static Close(mc) {
        mc.close();
    }
}

export default MongoDB;