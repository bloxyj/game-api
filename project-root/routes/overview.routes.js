const express = require('express')
const router = express.Router()
const player = require('../repositories/player.repo')
const monster_information = require('../repositories/monster.repo')



router.get('/', (req, res) => {
    res.json({players: player, monsters: monster_information});
});

module.exports = router