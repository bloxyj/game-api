const express = require('express');
const router = express.Router();
const monsterRepo = require('../repositories/monster.repo');
const { authMiddleware } = require('../utils/jwt');

// All monster routes require authentication
router.use(authMiddleware);

// GET /game-api/monster_info - Get all monsters
router.get('/', async (req, res) => {
    try {
        const monsters = await monsterRepo.findAll();
        res.json({ monsters });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch monsters: ' + error.message });
    }
});

// GET /game-api/monster_info/:id - Get monster by ID
router.get('/:id', async (req, res) => {
    try {
        const monster = await monsterRepo.findById(req.params.id);
        if (!monster) return res.status(404).json({ error: 'Monster not found' });
        res.json(monster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch monster: ' + error.message });
    }
});

// POST /game-api/monster_info - Create a new monster
router.post('/', async (req, res) => {
    try {
        const { name, hp, atk, xp } = req.body;
        if (!name || hp == null || atk == null || xp == null) {
            return res.status(400).json({ error: 'name, hp, atk, and xp are required' });
        }
        const monster = await monsterRepo.create({ name, hp, atk, xp });
        res.status(201).json(monster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create monster: ' + error.message });
    }
});

// PUT /game-api/monster_info/:id - Update a monster
router.put('/:id', async (req, res) => {
    try {
        const monster = await monsterRepo.updateById(req.params.id, req.body);
        if (!monster) return res.status(404).json({ error: 'Monster not found' });
        res.json(monster);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update monster: ' + error.message });
    }
});

// DELETE /game-api/monster_info/:id - Delete a monster
router.delete('/:id', async (req, res) => {
    try {
        const monster = await monsterRepo.deleteById(req.params.id);
        if (!monster) return res.status(404).json({ error: 'Monster not found' });
        res.json({ message: 'Monster deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete monster: ' + error.message });
    }
});

module.exports = router;
