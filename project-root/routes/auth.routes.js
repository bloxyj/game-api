const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /game-api/auth/register
router.post('/register', authController.register);

// POST /game-api/auth/login
router.post('/login', authController.login);

module.exports = router;
