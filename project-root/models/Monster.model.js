const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('../utils/serializer');
const generateId = require('../utils/generateId');

const monsterSchema = new mongoose.Schema({
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
        required: true
    },
    atk: {
        type: Number,
        required: true
    },
    xp: {
        type: Number,
        required: true
    },
    zone: {
        type: String,
        trim: true,
        default: 'Unknown'
    },
    image: {
        type: String,
        default: null
    }
}, { _id: false, timestamps: true });

applyBaseSchemaOptions(monsterSchema);

module.exports = mongoose.model('Monster', monsterSchema);
