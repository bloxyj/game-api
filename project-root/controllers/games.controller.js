const gamesService = require('../services/games.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createGame = asyncHandler(async (req, res) => {
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(400).json({ message: 'playerId is required' });
    }

    const game = await gamesService.createGame(playerId);

    if (game.error) {
        return res.status(404).json(game);
    }

    res.status(201).json(game);
});

exports.move = asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const result = await gamesService.movePlayer(gameId);

    if (result.error) {
        return res.status(400).json(result);
    }

    res.json(result);
});

exports.attack = asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const { action = 'fight', timingScore = 0.5, dodgeScore = 0.0 } = req.body || {};
    const result = await gamesService.playTurn(gameId, { action, timingScore, dodgeScore });

    if (result.error) {
        return res.status(400).json(result);
    }
    res.json(result);
});