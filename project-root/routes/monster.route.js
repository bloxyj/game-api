const monster_information = require('../repositories/monster.repo')

const express = require('express');
const router = express.Router();
const currentId = require('../utils/generateId')

router.get('/monster_info/id' , (req, res) => {
    res.json({ message: monster_information});
});

module.exports = router;
console.log(monster_information);