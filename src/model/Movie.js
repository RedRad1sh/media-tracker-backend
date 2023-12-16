const {Schema, model} = require('mongoose');

const Movie = new Schema({
    title: {type: String, unique: false, required: true},
    description: {type: String, unique: false, required: true},
    img_url: {type: String, unique: false, required: false},
    kp_rating: {type: Number, unique: false, required: false},
    imb_rating: {type: Number, unique: false, required: false},
    creation_year: {type: Number, unique: false, required: false},
    genres: {type: String, unique: false, required: true},
    movie_length: {type: Number, unique: false, required: false},
    countries: {type: String, unique: false, required: false},
    directors: {type: String, unique: false, required: false},
    actors: {type: String, unique: false, required: false},
    video: {type: String, unique: false, required: false},
    user_rating: {type: Number, unique: false, required: false}
})

module.exports = model('Movie', Movie);