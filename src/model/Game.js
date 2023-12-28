const {Schema, model} = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const Game = new Schema({
    steam_app_id: {type: String, unique: true, required: true},
    const_content_id: {type: String, unique: true, required: true},
    title: {type: String, unique: false, required: true},
    description: {type: String, unique: false, required: true},
    img_url: {type: String, unique: false, required: false},
    metcrt_rating: {type: Number, unique: false, required: false},
    developers: {type: String, unique: false, required: false},
    release_date: {type: Date, unique: false, required: false},
    genres: {type: String, unique: false, required: true},
    screenshot_url: {type: String, unique: false, required: false},
    pc_req_min: {type: String, unique: false, required: false},
    pc_req_rec: {type: String, unique: false, required: false},
    video: {type: String, unique: false, required: false},
    user_rating: {type: Number, unique: false, required: false}
})

Game.plugin(mongoosePaginate);

module.exports = model('Game', Game);