const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    hp: {
        type: Number,
        default: 100
    },
    attack: {
        type: Number,
        default: 25
    },
    level: {
        type: Number,
        default: 1
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
