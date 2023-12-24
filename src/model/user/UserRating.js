const {Schema, model} = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const UserRatings = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content_type: {type: String, unique: false, required: true},
    content_id: {type: String, unique: false, required: true},
    action: {type: Date, unique: false, required: true}
})
UserLists.index({ user_id: 1, content_id: 1}, { unique: true });
UserRatings.plugin(mongoosePaginate);

module.exports = model('UserRatings', UserRatings);