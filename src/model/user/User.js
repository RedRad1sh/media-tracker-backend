const { Schema, model } = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const UserList = require("../../model/user/UserList");

const User = new Schema({
    login: { type: String, unique: true, required: true },
    password: { type: String, unique: false, required: true },
    email: { type: String, unique: true, required: true },
    registration_date: { type: Date, unique: false, required: true },
    img_url: { type: String, unique: false, required: false },
    userLists: [{
        type: Schema.Types.ObjectId,
        ref: 'UserList'
    }],
    userRatings: [{
        type: Schema.Types.ObjectId,
        ref: 'UserRating'
    }],
    userReviews: [{
        type: Schema.Types.ObjectId,
        ref: 'UserReview'
    }]
})
User.plugin(mongoosePaginate);

module.exports = model('User', User);