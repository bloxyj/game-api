const gamesService = require('../services/games.service');

exports.getGameState = (req, res) => {
    const state = gamesService.getGameState();
    res.json(state);
};

exports.playTurn = (req, res) => {
    const { actionType } = req.body;
    const result = gamesService.executeTurn(actionType);
    res.json(result);
};