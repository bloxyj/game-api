const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('../utils/serializer');
const generateId = require('../utils/generateId');

const roomSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    monster: {
        name: String,
        hp: Number,
        atk: Number,
        xp: Number,
        image: String
    },
    isExit: { type: Boolean, default: false }
}, { _id: false });

const gameSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => generateId()
    },
    playerId: {
        type: String,
        ref: 'Player',
        required: true
    },
    playerName: {
        type: String,
        required: true
    },
    dungeon: [roomSchema],
    currentRoomId: {
        type: String
    },
    playerCurrentHP: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['IN_PROGRESS', 'VICTORY', 'GAME_OVER'],
        default: 'IN_PROGRESS'
    },
    logs: {
        type: [String],
        default: []
    }
}, { _id: false, timestamps: true });

applyBaseSchemaOptions(gameSchema);

module.exports = mongoose.model('Game', gameSchema);
