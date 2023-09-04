"use strict"

const { CREATED } = require("../../core/success.response");
const ProductFactory = require("../../services/product.service");

class ProductController {

    create = async (req, res, next) => {
        new CREATED({
            message: "Created product Ok!",
            metadata: await ProductFactory.createProduct({ type: req.body.product_type, payload: req.body })
        }).send(res)
    }
}

module.exports = new ProductController();