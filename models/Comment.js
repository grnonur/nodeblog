const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref:'users'},
    cContent: {type: String, required: true},
    post: {type: mongoose.Schema.Types.ObjectId, ref:'posts'},
    active: { type: Boolean, default: true },
    edit: { type: Boolean, default: false },
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Comment', CommentSchema);