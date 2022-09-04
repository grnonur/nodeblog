const mongoose = require("mongoose");

const ResetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:'users', required: true },
    intoken: {type: String, required: true},
    outtoken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }
});

module.exports = mongoose.model('Reset', ResetSchema);