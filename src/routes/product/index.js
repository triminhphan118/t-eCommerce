"use strict"

const express = require("express")
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const productController = require('../../controllers/product')

router.use(authentication)
router.post('', asyncHandler(productController.create))

// QUERY
router.post('/draft/all', asyncHandler(productController.getAllDraftForShop))

module.exports = router