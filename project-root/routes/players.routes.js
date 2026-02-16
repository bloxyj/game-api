const express = require('express');
const router = express.Router();
const playersController = require('../controllers/players.controller');
const { authMiddleware } = require('../utils/jwt');

// All player routes require authentication
router.use(authMiddleware);

// GET /game-api/players - Get all players
router.get('/', playersController.getAllPlayers);

// GET /game-api/players/me - Get my players
router.get('/me', playersController.getMyPlayers);

// GET /game-api/players/:id - Get player by ID
router.get('/:id', playersController.getPlayerById);

// POST /game-api/players - Create a new player
router.post('/', playersController.createPlayer);

module.exports = router;