'use strict'

const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        require: true
    },
    product_thumb: {
        type: String,
        require: true
    },
    product_description: String,
    product_price: {
        type: Number,
        require: true
    },
    product_quantity: {
        type: Number,
        require: true
    },
    product_type: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes: {
        type: mongoose.Schema.Types.Mixed,
        require: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

const clothingSChema = new mongoose.Schema({
    brand: {
        type: String,
        require: true
    },
    size: String,
    material: String
}, {
    timestamps: true,
    collection: 'Clothes'
})

const electronicSchema = new mongoose.Schema({
    manuFacturer: {
        type: String,
        require: true
    },
    model: String,
    color: String
}, {
    collation: 'Electronics',
    timestamps: true
})

//Export the model
module.exports = {
    product: mongoose.model(DOCUMENT_NAME, productSchema),
    electronic: mongoose.model('Electronic', electronicSchema),
    clothing: mongoose.model('Clothing', clothingSChema)
};