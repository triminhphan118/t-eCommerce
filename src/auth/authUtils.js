'user strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADERS = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token
        const accessToken = await JWT.sign(payload, publicKey, {
            // algorithm: "RS256",
            expiresIn: '7 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            // algorithm: "RS256",
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (error, decode) => {
            if (error) {
                console.log(`Error verify::`, error);
            } else {
                console.log('Decode verify::', decode);
            }
        })

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        return error
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /**
     * 1. Check UserId
     * 2. Get access token
     * 3. Verify access token
     * 4. Check user in db
     * 5. Check keystore with userId
     * 6. Ok => return
     */

    const userId = req.headers[HEADERS.CLIENT_ID]?.toString()
    if (!userId) {
        throw new AuthFailureError("Invalid Request")
    }
    const keyStore = await findByUserId(userId)
    if (!keyStore) {
        throw new NotFoundError("Not Found KeyStore")
    }

    if (req.headers[HEADERS.REFRESH_TOKEN]) {
        try {
            const refreshToken = req.headers[HEADERS.REFRESH_TOKEN]

            const decodeUser = await JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError("Invalid User")
            }

            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()

        } catch (error) {
            throw error
        }

    }

    const accessToken = req.headers[HEADERS.AUTHORIZATION]?.toString()
    if (!accessToken) throw new AuthFailureError("Invalid Request")

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError("Invalid User")
        }
        req.keyStore = keyStore
        req.user = decodeUser

        return next()

    } catch (error) {
        throw error
    }


})

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}

