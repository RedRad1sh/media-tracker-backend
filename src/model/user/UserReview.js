const {Schema, model} = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const UserReview = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content_type: {type: String, unique: false, required: true},
    content_id: {type: String, unique: false, required: true},
    rating: {type: Number, unique: false, required: false},
    review_message: {type: String, unique: false, required: false}
})
UserReview.index({ user_id: 1, content_id: 1}, { unique: true });
UserReview.plugin(mongoosePaginate);

module.exports = model('UserReview', UserReview);