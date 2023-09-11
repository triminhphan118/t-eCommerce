const { inventory } = require("../inventory")


const insertInventory = async ({
    product_id,
    shop_id,
    location = 'unKnow',
    stock
}) => {
    return await inventory.create({
        inven_product: product_id,
        inven_shop: shop_id,
        inven_location: location,
        inven_stock: stock
    })
}

module.exports = {
    insertInventory
}