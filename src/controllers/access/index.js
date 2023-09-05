"use strict"

const AccessService = require("../../services/access.service");
const { SuccessResponse, CREATED } = require("../../core/success.response");

class AccessController {

    handleRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Get Refresh Token Ok!",
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            })
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout Ok!",
            metadata: await AccessService.logOut({ keyStore: req.keyStore })
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            message: "Login Ok!",
            metadata: await AccessService.logIn(req.body)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        console.log(req.body);
        console.log(`[P]::signUp::`, req.body);
        new CREATED({
            message: "Registered Ok!",
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }
}

module.exports = new AccessController();