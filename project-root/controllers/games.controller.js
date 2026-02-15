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

// controllers/games.controller.js (Ajouter à la suite)

exports.move = (req, res) => {
    // L'ID de la partie est dans l'URL (ex: /games/4/move)
    const gameId = req.params.id;
    
    const result = gamesService.movePlayer(gameId);

    if (result.error) {
        return res.status(400).json(result);
    }

    res.json(result);
};

// controllers/games.controller.js (Ajouter à la fin)

exports.attack = (req, res) => {
    const gameId = req.params.id;
    const result = gamesService.playTurn(gameId);

    if (result.error) {
        return res.status(400).json(result);
    }
    res.json(result);
};