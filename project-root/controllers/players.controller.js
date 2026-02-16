const playerRepo = require('../repositories/player.repo');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllPlayers = asyncHandler(async (req, res) => {
    const players = await playerRepo.findAll();
    res.json({ players });
});

exports.getMyPlayers = asyncHandler(async (req, res) => {
    const players = await playerRepo.findByUserId(req.user.userId);
    res.json({ players });
});

exports.createPlayer = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'name is required' });
    }

    const newPlayer = await playerRepo.create(name, req.user.userId);
    res.status(201).json(newPlayer);
});

exports.getPlayerById = asyncHandler(async (req, res) => {
    const player = await playerRepo.findById(req.params.id);
    if (!player) {
        return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
});
