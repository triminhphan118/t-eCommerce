"use strict"

const { CREATED } = require("../../utils/status-code/httpStatusCode");
const AccessService = require("../../services/access.service");
const { SuccessResponse } = require("../../core/success.response");

class AccessController {

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