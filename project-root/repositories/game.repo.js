const Game = require('../models/Game.model');

module.exports = {
    findAll: async () => {
        return Game.find();
    },

    findById: async (id) => {
        return Game.findById(id);
    },

    create: async (gameData) => {
        const game = new Game(gameData);
        return game.save();
    },

    update: async (game) => {
        return game.save();
    },

    deleteById: async (id) => {
        return Game.findByIdAndDelete(id);
    }
};
