const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: Date, default: Date.now},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    post_image: {type: String, required: true},
    public_id : { type: String, required: true}
})

module.exports = mongoose.model('Post', PostSchema);