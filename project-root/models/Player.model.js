const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('../utils/serializer');
const generateId = require('../utils/generateId');

const playerSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => generateId()
    },
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
        type: String,
        ref: 'User',
        required: true
    }
}, { _id: false, timestamps: true });

applyBaseSchemaOptions(playerSchema);

module.exports = mongoose.model('Player', playerSchema);
