'use strict'

const { BadRequestError } = require('../core/error.response')
const { product, electronic, clothing } = require('../models/product.model')
const { insertInventory } = require('../models/repositories/inventory')
const { findAllDraftForShop, publishProductByShop, findAllPublishedForShop, unPublishProductByShop, searchProductByUser, getAllProduct, findProduct, updateProductById } = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')

class ProductFactory {
    /**
    * type: 'Clothing
    * payload
    */
    static productRegistry = {}
    static registerProductType = (type, className) => {
        ProductFactory.productRegistry[type] = className
    }

    static async createProduct({ type, payload }) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid Product Type::${type}`);
        return new productClass(payload).createProduct()
        // switch (type) {
        //     case 'Electronic':
        //         return new Electronic(payload).createProduct()
        //     case 'Clothing':
        //         return new Clothing(payload).createProduct()
        //     default:
        //         throw new BadRequestError(`Invalid Product Type::${type}`);
        // }
    }

    static async updateProduct(type, product_id, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid Product Type::${type}`);
        return new productClass(payload).updateProduct(product_id)
    }

    static publishProductByShop = async ({ product_shop, product_id }) => {
        return await publishProductByShop({
            product_id,
            product_shop
        })
    }

    static unPublishProductByShop = async ({ product_shop, product_id }) => {
        return await unPublishProductByShop({
            product_id,
            product_shop
        })
    }

    // QUERY
    static findAllDraftForShop = async ({ product_shop, limit = 50, skip = 0 }) => {
        const query = { product_shop, isDraft: true }
        return await findAllDraftForShop({
            query, limit, skip
        })
    }

    static findAllPublishedForShop = async ({ product_shop, limit = 50, skip = 0 }) => {
        const query = { product_shop, isPublished: true }
        return await findAllPublishedForShop({
            query, limit, skip
        })
    }

    static getListSearchProduct = async ({ keySearch }) => {
        return await searchProductByUser({ keySearch })
    }

    static getAllProduct = async ({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true },
        select = ['product_name', 'product_description', 'product_thumb'] }) => {
        return await getAllProduct({
            limit, sort, page, filter, select
        })
    }

    static findProduct = async ({ product_id, unSelect = ['__v'] }) => {
        return await findProduct({ product_id, unSelect })
    }
}

class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_quantity = product_quantity
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_name = product_name
        this.product_attributes = product_attributes
    }

    async createProduct(id) {
        const newProduct = await product.create({
            ...this,
            _id: id
        })

        if (newProduct) {
            await insertInventory({
                product_id: newProduct._id,
                shop_id: this.product_shop,
                stock: this.product_quantity,
            })
        }

        return product
    }

    // update product 
    async updateProduct({ product_id, payload }) {
        return await updateProductById({
            model: product,
            payload,
            product_id
        })
    }
}

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BadRequestError("Create new clothing error")
        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError("Create new product error")

        return newProduct
    }

    async updateProduct(product_id) {
        const objParams = removeUndefinedObject(this)


        if (objParams.product_attributes) {
            // update attribute
            await updateProductById({
                model: clothing,
                payload: updateNestedObjectParser(objParams.product_attributes),
                product_id
            })
        }

        const updateProduct = await super.updateProduct({ product_id, payload: objParams })
        return updateProduct

    }
}


class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError("Create new electronic error")
        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError("Create new product error")

        return newProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError("Create new furniture error")
        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError("Create new product error")

        return newProduct
    }
}

// Register product types
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)


module.exports = ProductFactory