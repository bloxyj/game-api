const generateId = require('../utils/generateId')



const player = {
    id:generateId(),
    name: "Player1",
    hp: 100,
    attack: 25
}

module.exports = player
