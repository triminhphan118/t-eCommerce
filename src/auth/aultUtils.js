'user strict'

const JWT = require('jsonwebtoken')
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

module.exports = {
    createTokenPair
}