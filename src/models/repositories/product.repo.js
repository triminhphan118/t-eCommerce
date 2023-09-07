'use strict'

const { product } = require("../product.model")

const findAllDraftForShop = async ({ query, limit, skip }) => {
    return await product.find()
    return await product.find({ query }).populate('product_shop', 'name email -_id').sort({
        updatedAt: -1
    }).skip(skip).limit(limit).lean().exec()
}

module.exports = {
    findAllDraftForShop
}