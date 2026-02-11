const express = require('express')
const router = express.Router()
const player = require('../repositories/player.repo')

router.post('/', (req, res) => {
	const { name } = req.body
	if (!name) {
		return res.status(400).json({ error: 'name is required' })
	}

	const newPlayer = player.create(name)
	return res.status(201).json(newPlayer)
})

router.get('/', (req, res) => {
    res.json({message: player})
});

module.exports = router