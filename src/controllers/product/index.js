"use strict"

const { CREATED, SuccessResponse } = require("../../core/success.response");
const ProductFactory = require("../../services/product.service");

class ProductController {

    create = async (req, res, next) => {
        new CREATED({
            message: "Created product Ok!",
            metadata: await ProductFactory.createProduct({
                type: req.body.product_type, payload: {
                    ...req.body,
                    product_shop: req.user.userId
                }
            })
        }).send(res)
    }

    // QUERY
    getAllDraftForShop = async (req, res, next) => {
        return new SuccessResponse({
            message: "Get all product Ok!",
            metadata: await ProductFactory.findAllDraftForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
}

module.exports = new ProductController();