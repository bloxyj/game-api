const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const hostname = 'localhost';

// Import des routes
const playerRoutes = require('./routes/players.routes');
const gamesRoutes = require('./routes/games.routes'); // Ta nouvelle route
const monsterRoute = require('./routes/monster.route');
const overviewRoute = require('./routes/overview.routes'); // Attention à l'orthographe (overview vs overwiew)

app.use(express.json());

// 👇 DÉCOMMENTE CETTE LIGNE (Enlève les // au début) 👇
app.use(express.static('public')); 
// 👆 C'est ça qui permet de charger style.css et script.js

app.use('/game-api', overviewRoute);
app.use('/game-api/players', playerRoutes);
app.use('/game-api/games', gamesRoutes);
app.use('/game-api/monster_info', monsterRoute);

// Cette partie change légèrement pour renvoyer index.html par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://${hostname}:${port}`);
});