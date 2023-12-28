const {Schema, model} = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const Movie = new Schema({
    kinopoisk_app_id: {type: String, unique: true, required: true},
    const_content_id: {type: String, unique: true, required: true},
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

Movie.plugin(mongoosePaginate);

module.exports = model('Movie', Movie);