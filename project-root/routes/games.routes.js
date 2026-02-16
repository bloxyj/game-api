// routes/games.routes.js
const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');
const { authMiddleware } = require('../utils/jwt');

// All game routes require authentication
router.use(authMiddleware);

router.post('/', gamesController.createGame);
router.post('/:id/move', gamesController.move);
router.post('/:id/attack', gamesController.attack);

module.exports = router;