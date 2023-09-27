'use strict'
import { BadRequestError, NotFoundError } from '../core/error.response'
import { discount } from '../models/discount.model'
import { findAllDiscountCodeUnSelect, findDiscount } from '../models/repositories/discount.repo'
import { getAllProduct } from '../models/repositories/product.repo'
import { convertToObjectIdMongo } from '../utils'

class DiscountService {

    static async createDiscountCode(payload) {
        const { code, start_date, end_date, is_active, shopId, min_order_value, product_ids, applies_to, name,
            description, type, value, max_value, max_uses, uses_count, max_uses_per_user, user_used }
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
            shopId
        }).lean()

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
            discount_code,
            shopId
        }).lean()

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
}


