"use strict"

const express = require("express")
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const discountController = require('../../controllers/discount')

router.post("/amount", asyncHandler(discountController.getDiscountAmount))
router.get("/list_product_code", asyncHandler(discountController.getAllDiscountCodesWithProducts))

router.use(authentication)

router.post('', asyncHandler(discountController.createDiscountCode))
router.get('', asyncHandler(discountController.getAllDiscountCode))


module.exports = router