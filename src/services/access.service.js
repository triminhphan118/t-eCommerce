"use strict"

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyStoreService = require("./keyToken.service")
const { getInfoData } = require("../utils")
const { ConflictRequestError, BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static handleRefreshToken = async (refreshToken) => {
        const foundToken = await KeyStoreService.findByRefreshTokenUsed(refreshToken)
        if (foundToken) {
            // decode to get user
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({ userId, email });
            // delete user
            await KeyStoreService.deleteKeyStoreByUser(userId)
            throw new ForbiddenError('Something wrong happen !!. Pls relogin!')
        }

        const holderToken = await KeyStoreService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new BadRequestError("Shop not registered!")

        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log('[2]--', { userId, email });

        const foundShop = findByEmail({ email })
        if (!foundShop) throw new BadRequestError("Shop not registered!")

        // create token
        const tokens = await createTokenPair({ userId: foundShop._id, email }, holderToken.publicKey, holderToken.privateKey)

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refreshToken
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logIn = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email })
        if (!foundShop) {
            throw new BadRequestError("Shop not registered")
        }

        const match = bcrypt.compare(password, foundShop.password)
        if (!match) {
            throw new AuthFailureError("Authentication Error!")
        }

        const publicKey = await crypto.randomBytes(64).toString("hex")
        const privateKey = await crypto.randomBytes(64).toString("hex")

        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)
        await await KeyStoreService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken
        })

        return {
            shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop }),
            tokens
        }
    }

    static signUp = async ({ name, password, email }) => {
        const holderShop = await shopModel.findOne({ email }).lean()
        console.log("holderShop::", holderShop);
        if (holderShop) {
            throw new ConflictRequestError("Error: Shop Already registered!")
        }

        const hasPassword = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, password: hasPassword, email, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // create private key and public key
            // const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem',
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem',
            //     },
            // })

            const publicKey = await crypto.randomBytes(64).toString("hex")
            const privateKey = await crypto.randomBytes(64).toString("hex")


            // const publicKeyString = await KeyStoreService.createKeyToken({
            //     userId: newShop._id,
            //     publicKey,
            // })

            const keyStore = await KeyStoreService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })
            console.log("🚀 ~ file: access.service.js:62 ~ AccessService ~ signUp= ~ keyStore:", keyStore)
            // const publicKeyObject = crypto.createPublicKey(publicKeyString)
            if (!keyStore) {
                return {
                    code: 'xxx',
                    message: "Shop Already registered!"
                }
            }
            const tokens = await createTokenPair({ userId: newShop._id, email }, keyStore.publicKey, keyStore.privateKey)
            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }

    }

    static logOut = async ({ keyStore }) => {
        const delKey = await KeyStoreService.removeKeyStoreById(keyStore._id)
        console.log("delKey::", delKey);
        return delKey
    }
}

module.exports = AccessService