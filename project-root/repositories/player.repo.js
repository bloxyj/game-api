const generateId = require('../utils/generateId')

module.exports = {
    create: (name) => {
        const player = {
            id:generateId(),
            name,
            hp: 100,
            attack: 25
        }

        return player
    }
}