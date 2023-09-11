'use strict'

const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

// Declare the Schema of the Mongo model
var inventorySchema = new mongoose.Schema({
    inven_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    inven_location: {
        type: String,
        default: 'unKnow'
    },
    inven_stock: {
        type: Number,
        required: true
    },
    inven_shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    inven_reservation: {
        type: Array,
        default: []
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    inventory: mongoose.model(DOCUMENT_NAME, inventorySchema)
}