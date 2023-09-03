"use strict"
const mongoose = require("mongoose")
const { countConnect } = require("../helpers/check.connect")
const configs = require("../configs")
const connectString = `mongodb://${configs.db.host}:${configs.db.port}/${configs.db.name}`
class Database {
    constructor() {
        this.connect()
    }

    // connect 
    connect(type = "mongodb") {
        //dev
        if (1 === 1) {
            mongoose.set("debug", true)
            mongoose.set("debug", {
                color: true
            })
        }
        mongoose.connect(connectString).then(_ => {
            console.log("Connected Mongodb Success Single", countConnect())
        }).catch((err) => console.log("Error Connect:", err))
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }

}

const instanceMongoDb = Database.getInstance()

module.exports = instanceMongoDb;