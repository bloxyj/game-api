require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./data/db');
const seedMonsters = require('./data/seed');

const app = express();
const port = process.env.PORT || 3000;

// Import des routes
const authRoutes = require('./routes/auth.routes');
const playerRoutes = require('./routes/players.routes');
const gamesRoutes = require('./routes/games.routes');
const monsterRoute = require('./routes/monster.route');
const overviewRoute = require('./routes/overview.routes');

app.use(express.json());
app.use(express.static('public'));

// Auth routes (no JWT required)
app.use('/game-api/auth', authRoutes);

// Protected routes (JWT required via middleware in each route file)
app.use('/game-api', overviewRoute);
app.use('/game-api/players', playerRoutes);
app.use('/game-api/games', gamesRoutes);
app.use('/game-api/monster_info', monsterRoute);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB, seed data, then start server
const startServer = async () => {
  await connectDB();
  await seedMonsters();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();