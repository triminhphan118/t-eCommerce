'use strict'

const keyTokenModel = require("../models/keytoken.model")

class KeyStoreService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // // const publicKeyString = publicKey.toString()
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     // publicKey: publicKeyString
            //     publicKey,
            //     privateKey,
            // })

            const filter = { user: userId }, update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken }, options = { upsert: true, new: true }
            const tokens = keyTokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens : null
        } catch (error) {
            return error
        }
    }

}

module.exports = KeyStoreService