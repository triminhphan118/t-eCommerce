"use strict"

const express = require("express")
const router = express.Router();

const accessController = require("../../controllers/access")
const asyncHandler = require("../../utils/asyncHandler");
const { authentication } = require("../../auth/authUtils");

router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.login))

// authentication
router.use(authentication)
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/handleRefreshToken', asyncHandler(accessController.handleRefreshToken))

module.exports = router