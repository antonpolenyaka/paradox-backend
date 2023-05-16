"use strict";

import mongo from 'mongodb';

class GenericEntityModel {

    static InsertOne(db, query, entityType) {
        return db.collection(entityType).insertOne(query);
    }

    static FindOneById(db, id, entityType) {
        return db.collection(entityType).findOne({ _id: new mongo.ObjectId(id) });
    }

    static FindAllByWallet(db, wallet, entityType) {
        const filterQuery = {
            $or: [
                { 'userWallet': wallet },
                { 'userWallet': wallet.toUpperCase() },
                { 'userWallet': wallet.toLowerCase() }
            ]
        };
        return db.collection(entityType).find(filterQuery).toArray();
    }

    static FindAllByEmail(db, email, entityType) {
        const filterQuery = {
            $or: [
                { 'userEmail': email },
                { 'userEmail': email.toUpperCase() },
                { 'userEmail': email.toLowerCase() }
            ]
        };
        return db.collection(entityType).find(filterQuery).toArray();
    }

    static UpdateOneById(db, id, query, entityType) {
        return db.collection(entityType).updateOne({ _id: new mongo.ObjectId(id) }, query, { upsert: false });
    }

    static InsertOrUpdateOneById(db, id, query, entityType) {
        return db.collection(entityType).updateOne({ _id: new mongo.ObjectId(id) }, query, { upsert: true });
    }

    static FindAll(db, entityType) {
        return db.collection(entityType).find().toArray();
    }

    static DeleteOneById(db, id, entityType) {
        return db.collection(entityType).deleteOne({ _id: new mongo.ObjectId(id) });
    }

    static ListCollections(db) {
        return db.listCollections().toArray();
    }
}

export default GenericEntityModel;