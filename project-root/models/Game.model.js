const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    monster: {
        name: String,
        hp: Number,
        atk: Number,
        xp: Number
    },
    isExit: { type: Boolean, default: false }
}, { _id: false });

const gameSchema = new mongoose.Schema({
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    playerName: {
        type: String,
        required: true
    },
    dungeon: [roomSchema],
    currentRoomId: {
        type: Number,
        default: 1
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
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
