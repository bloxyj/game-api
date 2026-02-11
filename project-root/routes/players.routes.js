const express = require('express')
const router = express.Router()
const playerRepo = require('../repositories/player.repo')

router.post('/', (req, res) => {
	const { name } = req.body
	if (!name) {
		return res.status(400).json({ error: 'name is required' })
	}

	const player = playerRepo.create(name)
	return res.status(201).json(player)
})

router.get('/', (req, res) => {
    const { name } = req.query
    if (!name){
        return res.status(400).json({ error: 'name is required' })
    }
    const player = playerRepo.create(name)
    return res.status(201).json(player)
})

module.exports = router