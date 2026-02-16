// controllers/games.controller.js
const gamesService = require('../services/games.service');

exports.createGame = async (req, res) => {
    try {
        const { playerId } = req.body;

        if (!playerId) {
            return res.status(400).json({ error: "playerId est requis" });
        }

        const game = await gamesService.createGame(playerId);

        if (game.error) {
            return res.status(404).json(game);
        }

        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create game: ' + error.message });
    }
};

exports.move = async (req, res) => {
    try {
        const gameId = req.params.id;
        const result = await gamesService.movePlayer(gameId);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to move: ' + error.message });
    }
};

exports.attack = async (req, res) => {
    try {
        const gameId = req.params.id;
        const result = await gamesService.playTurn(gameId);

        if (result.error) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to attack: ' + error.message });
    }
};