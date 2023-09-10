"use strict"

const express = require("express")
const router = express.Router();

const asyncHandler = require("../../utils/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const productController = require('../../controllers/product')

router.post('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
router.get('', asyncHandler(productController.getAllProducts))
router.get('/:product_id', asyncHandler(productController.findProduct))

router.use(authentication)
router.post('', asyncHandler(productController.create))
router.patch('/:product_id', asyncHandler(productController.updateProduct))
router.post('/publish/:id', asyncHandler(productController.publishedProductByShop))
router.post('/unpublish/:id', asyncHandler(productController.unPublishedProductByShop))

// QUERY
router.post('/draft/all', asyncHandler(productController.getAllDraftForShop))
router.post('/published/all', asyncHandler(productController.getAllPublishedForShop))

module.exports = router