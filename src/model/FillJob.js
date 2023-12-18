const { Schema, model } = require('mongoose');

const FillJob = new Schema({
    type: { type: String, unique: true, required: true },
    updateTime: { type: Date, unique: false, required: false },
    updatedPagesNum: { type: Number, unique: false, required: false },
    lastUpdatedPage: { type: Number, unique: false, required: true },
})

module.exports = model('FillJob', FillJob);