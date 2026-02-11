const monster_information = require('../repositories/monster.repo')
const express = require('express');
const router = express.Router();
const currentId = require('../utils/generateId')

router.get('/' , (req, res) => {
    res.json({ message: monster_information});
});

module.exports = router;
