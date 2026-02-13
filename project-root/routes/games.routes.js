// routes/games.routes.js
const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

router.post('/', gamesController.createGame);

module.exports = router;