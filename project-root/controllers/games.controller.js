const gamesService = require('../services/games.service');
const gameState = require('../data/store');

exports.playTurn = (req, res) => {
    res.json(gamesService.processTurn(req.body.actionType));
};

exports.getState = (req, res) => {
    res.json(gameState);
};

exports.flee = (req, res) => {
    res.json(gamesService.fleeGame());
};

exports.reset = (req, res) => {
    res.json(gamesService.resetGame());
};