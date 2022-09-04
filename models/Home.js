const mongoose = require('mongoose')

const HomeSchema = new mongoose.Schema({
    headerH1: { type: String, required: true },
    headerP: { type: String, required: true },
    headerBtnText: { type: String, required: true },
    headerBtnLink: { type: String, required: true },
    headerImage: { type: String, required: true },
    publicId: { type: String, required: true },
    index: { type: Number, required: true }
})

module.exports = mongoose.model('Home', HomeSchema);