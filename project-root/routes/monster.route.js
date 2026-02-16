const express = require('express');
const router = express.Router();
const monsterRepo = require('../repositories/monster.repo');
const asyncHandler = require('../utils/asyncHandler');


router.get('/', asyncHandler(async (req, res) => {
    const monsters = await monsterRepo.findAll();
    res.json({ count: monsters.length, monsters });
}));


router.get('/:id', asyncHandler(async (req, res) => {
    const monster = await monsterRepo.findById(req.params.id);
    if (!monster) {
        return res.status(404).json({ message: 'Monster not found' });
    }
    res.json(monster);
}));


module.exports = router;
