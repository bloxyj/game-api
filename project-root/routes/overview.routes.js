const express = require('express');
const router = express.Router();
const playerRepo = require('../repositories/player.repo');
const monsterRepo = require('../repositories/monster.repo');
const { authMiddleware } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
    const players = await playerRepo.findAll();
    const monsters = await monsterRepo.findAll();
    res.json({ players, monsters });
}));

module.exports = router;