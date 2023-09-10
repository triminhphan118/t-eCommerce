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

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Updated product Ok!",
            metadata: await ProductFactory.updateProduct(
                req.body.product_type, req.params.product_id, {
                ...req.body,
                product_shop: req.user.userId
            }
            )
        }).send(res)
    }

    publishedProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Published product Ok!",
            metadata: await ProductFactory.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPublishedProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "unPublish product Ok!",
            metadata: await ProductFactory.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
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

    getAllPublishedForShop = async (req, res, next) => {
        return new SuccessResponse({
            message: "Get all product Ok!",
            metadata: await ProductFactory.findAllPublishedForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        return new SuccessResponse({
            message: "List Search product Ok!",
            metadata: await ProductFactory.getListSearchProduct(req.params)

        }).send(res)
    }

    getAllProducts = async (req, res, next) => {
        return new SuccessResponse({
            message: "Get all product Ok!",
            metadata: await ProductFactory.getAllProduct(
                req.query
            )
        }).send(res)
    }

    findProduct = async (req, res, next) => {
        console.log(req.params);
        return new SuccessResponse({
            message: "find product Ok!",
            metadata: await ProductFactory.findProduct(
                {
                    product_id: req.params.product_id,
                }
            )
        }).send(res)
    }
}

module.exports = new ProductController();