'use strict'

const { findById } = require("../services/apikey.service")

const HEADERS = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}
const apiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers[HEADERS.API_KEY]?.toString()
        if (!apiKey) {
            return res.status(403).json({
                message: "Forbidden"
            })
        }
        const objKey = await findById(apiKey)
        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden"
            })
        }

        req.objKey = objKey
        return next()

    } catch (error) {
        console.log(error);
    }
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req?.objKey?.permissions) {
            return res.status(403).json({
                message: "Permission denied"
            })
        }
        console.log("🚀 ~ file: checkAuth.js:35 ~ return ~ req?.objKey?.permissions:", req?.objKey?.permissions)
        const validPermission = req.objKey.permissions.includes(permission)
        if (!validPermission) {
            return res.status(403).json({
                message: "Permission denied"
            })
        }

        return next()
    }
}

const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}
module.exports = {
    apiKey,
    permission,
    asyncHandler
}