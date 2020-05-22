const mongoose = require('mongoose')
const Schema = mongoose.Schema;


// Create Schema
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = Product = mongoose.model('product', ProductSchema)