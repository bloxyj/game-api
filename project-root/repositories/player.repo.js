const Player = require('../models/Player.model');

module.exports = {
    findAll: async () => {
        return Player.find();
    },

    findById: async (id) => {
        return Player.findById(id);
    },

    findByUserId: async (userId) => {
        return Player.find({ userId });
    },

    create: async (name, userId) => {
        const newPlayer = new Player({ name, userId });
        return newPlayer.save();
    },

    deleteById: async (id) => {
        return Player.findByIdAndDelete(id);
    }
};