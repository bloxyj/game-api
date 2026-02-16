const mongoose = require('mongoose');

const monsterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    hp: {
        type: Number,
        required: true
    },
    atk: {
        type: Number,
        required: true
    },
    xp: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Monster', monsterSchema);
