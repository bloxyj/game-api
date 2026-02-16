const playerRepo = require('../repositories/player.repo');

exports.getAllPlayers = async (req, res) => {
    try {
        const players = await playerRepo.findAll();
        res.json({ players });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players: ' + error.message });
    }
};

exports.getMyPlayers = async (req, res) => {
    try {
        const players = await playerRepo.findByUserId(req.user.userId);
        res.json({ players });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players: ' + error.message });
    }
};

exports.createPlayer = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'name is required' });
        }

        const newPlayer = await playerRepo.create(name, req.user.userId);
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create player: ' + error.message });
    }
};

exports.getPlayerById = async (req, res) => {
    try {
        const player = await playerRepo.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player: ' + error.message });
    }
};
