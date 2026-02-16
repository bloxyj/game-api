const express = require('express');
const router = express.Router();
const playerRepo = require('../repositories/player.repo');
const monsterRepo = require('../repositories/monster.repo');
const { authMiddleware } = require('../utils/jwt');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const players = await playerRepo.findAll();
        const monsters = await monsterRepo.findAll();
        res.json({ players, monsters });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch overview: ' + error.message });
    }
});

module.exports = router;