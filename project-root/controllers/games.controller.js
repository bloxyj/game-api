// controllers/games.controller.js
const gamesService = require('../services/games.service');

exports.createGame = (req, res) => {
    
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(400).json({ error: "playerId est requis" });
    }

    const game = gamesService.createGame(playerId);

    if (game.error) {
        return res.status(404).json(game);
    }

    
    res.status(201).json(game);
};

