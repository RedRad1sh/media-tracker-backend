const {Schema, model} = require('mongoose');

const Book = new Schema({
    title: {type: String, unique: false, required: true},
    description: {type: String, unique: false, required: true},
    img_url: {type: String, unique: false, required: false},
    authors: {type: String, unique: false, required: false},
    publisher: {type: String, unique: false, required: false},
    published_date: {type: Date, unique: false, required: false},
    page_count: {type: Number, unique: false, required: false},
    categories: {type: String, unique: false, required: true},
    categories_ru: {type: String, unique: false, required: false},
    user_rating: {type: Number, unique: false, required: false}
})

module.exports = model('Book', Book);