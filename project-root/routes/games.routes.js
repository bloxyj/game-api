// routes/games.routes.js

const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

router.post('/', gamesController.createGame);
router.post('/:id/move', gamesController.move); // <-- Nouvelle route

module.exports = router;