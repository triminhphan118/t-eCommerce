'use strict'

const keyTokenModel = require("../models/keytoken.model")
const { Types } = require('mongoose')
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

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean()
    }

    static removeKeyStoreById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: id })
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokenUsed: refreshToken })
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken })
    }

    static deleteKeyStoreByUser = async (userId) => {
        return await keyTokenModel.deleteOne({ user: userId })
    }

}

module.exports = KeyStoreService