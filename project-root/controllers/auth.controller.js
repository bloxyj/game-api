const authService = require('../services/auth.service');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const result = await authService.register(username, email, password);
        res.status(201).json(result);
    } catch (error) {
        if (error.message === 'Username or email already taken') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        const result = await authService.login(username, password);
        res.json(result);
    } catch (error) {
        if (error.message === 'Invalid username or password') {
            return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
};
