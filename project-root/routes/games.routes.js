// routes/games.routes.js (Le fichier complet doit ressembler à ça)
const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

router.post('/', gamesController.createGame);
router.post('/:id/move', gamesController.move);
router.post('/:id/attack', gamesController.attack); // <-- Nouvelle ligne

module.exports = router;