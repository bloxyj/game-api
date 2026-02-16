require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./data/db');
const seedMonsters = require('./data/seed');

const app = express();
const port = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth.routes');
const playerRoutes = require('./routes/players.routes');
const gamesRoutes = require('./routes/games.routes');
const monsterRoute = require('./routes/monster.route');
const overviewRoute = require('./routes/overview.routes');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    return res.sendStatus(204);
  }
  next();
});


// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/overview', overviewRoute);
app.use('/api/players', playerRoutes);
app.use('/api/games', gamesRoutes);

// Public routes
app.use('/api/monsters', monsterRoute);
app.use('/assets', express.static(path.join(__dirname, 'data', 'assets')));


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Unexpected error';
  res.status(status).json({ message });
});


const startServer = async () => {
  await connectDB();
  await seedMonsters();
  app.listen(port, () => {
    console.log('___.   .__                                                 \r\n\\_ |__ |__| ____     ______ ______________  __ ___________ \r\n | __ \\|  |\/ ___\\   \/  ___\/\/ __ \\_  __ \\  \\\/ \/\/ __ \\_  __ \\\r\n | \\_\\ \\  \/ \/_\/  >  \\___ \\\\  ___\/|  | \\\/\\   \/\\  ___\/|  | \\\/\r\n |___  \/__\\___  \/  \/____  >\\___  >__|    \\_\/  \\___  >__|   \r\n     \\\/  \/_____\/        \\\/     \\\/                 \\\/       ');
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();