'use strict'
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { discount } = require('../models/discount.model')
const { checkDiscountExists, findAllDiscountCodeUnSelect, findDiscount } = require("../models/repositories/discount.repo")
const { getAllProduct } = require('../models/repositories/product.repo')
const { convertToObjectIdMongo } = require("../utils")

class DiscountService {

    static async createDiscountCode(payload) {
        const { code, start_date, end_date, is_active, shopId, min_order_value, product_ids, applies_to, name,
            description, type, value, max_value, max_uses, uses_count, max_uses_per_user, user_used, discount_code }
            = payload

        // check
        if (new Date() < new Date(start_date) || new Date > new Date(end_date)) {
            throw new BadRequestError('Discount code has been expired')
        }

        if (new Date(start_date) > new Date(end_date)) {
            throw new BadRequestError("Start date must be before end date")
        }

        // create index for discount code
        const foundDiscount = await findDiscount({
            discount_code,
            discount_shopId: shopId
        })

        if (foundDiscount && foundDiscount.is_active) {
            throw new BadRequestError("Discount exist!")
        }

        const newDiscount = discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_max_value: max_value,
            discount_start_date: start_date,
            discount_end_date: end_date,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: user_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_oder_value: min_order_value,
            discount_shopId: shopId,

            discount_is_active: is_active,
            discount_applies: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
        })

        return newDiscount
    }

    static async updateDiscount(payload) {

    }

    static async getAllDiscountCodeWithProduct({
        code, shopId, userId, limit, page
    }) {
        // create index for discount
        const foundDiscount = await findDiscount({
            discount_code: code,
            discount_shopId: shopId
        })

        if (!foundDiscount || foundDiscount?.is_active) {
            throw new NotFoundError("Discount not exists!")
        }

        const { discount_applies, discount_product_ids } = foundDiscount
        let products
        if (discount_applies === 'all') {
            products = await getAllProduct({
                filter: {
                    product_shop: convertToObjectIdMongo(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies === 'specific') {
            products = await getAllProduct({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        return products
    }

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongo(shopId),
                discount_is_active: true
            },
            unSelect: ['_v', 'discount_shopId'],
            model: discount
        })

        return discounts
    }

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDisount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongo(shopId)
            }
        })

        if (!foundDisount) throw new NotFoundError(`Discount doesn't exist`)

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_oder_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_value
        } = foundDisount

        if (!discount_is_active) throw new NotFoundError(`Discount expired!`)

        if (!discount_max_uses) throw new NotFoundError(`Discount are out!`)

        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new NotFoundError(`Discount code has expired!`)
        }

        let totalOrder = 0
        if (discount_min_oder_value > 0) {
            totalOrder = products.reduce((acc, product) => acc + (product.price * product.quantity), 0)

            if (totalOrder < discount_min_oder_value) {
                throw new NotFoundError(`Discount requires a minium order value of ${discount_min_oder_value}`)
            }
        }

        if (discount_max_uses_per_user > 0) {
            const useUserDiscount = discount_users_used.find(user => user === userId)
            if (useUserDiscount) {
                throw new NotFoundError(`You have already used this discount`)
            }
        }

        const amount = discount_type === "fixed_amout" ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongo(shopId)
        })

        return deleted
    }

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                shopId: convertToObjectIdMongo(shopId)
            }
        })

        if (!foundDiscount) throw new NotFoundError(`Discount doesn't exist!`)

        const resutl = await discount.findByIdAndUpdate(foundDiscount, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return resutl
    }
}

module.exports = DiscountService


