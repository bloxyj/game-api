const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

router.get('/state', gamesController.getState);
router.post('/turn', gamesController.playTurn);
router.post('/flee', gamesController.flee);
router.post('/reset', gamesController.reset);

module.exports = router;