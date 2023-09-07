'use strict'

const { BadRequestError } = require('../core/error.response')
const { product, electronic, clothing } = require('../models/product.model')
const { findAllDraftForShop } = require('../models/repositories/product.repo')

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


    // QUERY
    static findAllDraftForShop = async ({ product_shop, limit = 50, skip = 0 }) => {
        const query = { product_shop, isDraft: true }
        return await findAllDraftForShop({
            query, limit, skip
        })
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
        return await product.create({
            ...this,
            _id: id
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