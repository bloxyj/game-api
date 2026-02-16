const express = require('express');
const router = express.Router();
const playersController = require('../controllers/players.controller');
const { authMiddleware } = require('../utils/jwt');

router.use(authMiddleware);

router.get('/', playersController.getAllPlayers);
router.get('/me', playersController.getMyPlayers);
router.get('/:id', playersController.getPlayerById);
router.post('/', playersController.createPlayer);

module.exports = router;