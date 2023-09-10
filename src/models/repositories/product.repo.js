'use strict'

const { Types } = require("mongoose")
const { product } = require("../product.model")
const { getSelectData, unGetSelectData } = require("../../utils")

const findAllDraftForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const queryProduct = async ({ query, limit, skip }) => {
    return await product.find(query).populate('product_shop', 'name email -_id').sort({
        updatedAt: -1
    }).skip(skip).limit(limit).lean().exec()
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    })

    if (!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublished = true
    const { modifiedCount } = await foundShop.updateOne(foundShop)

    return modifiedCount
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    })

    if (!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublished = false
    const { modifiedCount } = await foundShop.updateOne(foundShop)

    return modifiedCount

}

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        isPublished: true,
        $text: { $search: regexSearch }
    }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).lean()

    return results
}

const getAllProduct = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean()
    return products
}

const findProduct = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect)).lean()
}

const updateProductById = async ({ product_id, model, payload, isNew = true }) => {
    return await model.findByIdAndUpdate(product_id, payload, {
        new: isNew
    })

}

module.exports = {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProductByUser,
    getAllProduct,
    findProduct,
    updateProductById
}