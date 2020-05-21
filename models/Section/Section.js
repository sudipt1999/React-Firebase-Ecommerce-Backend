const mongoose = require('mongoose')
const Schema = mongoose.Schema;


// Create Schema
const SectionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    linkUrl: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = Section = mongoose.model('section', SectionSchema)