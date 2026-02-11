const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

router.get('/state', gamesController.getGameState);
router.post('/turn', gamesController.playTurn);

module.exports = router;