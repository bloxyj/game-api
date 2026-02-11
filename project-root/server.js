const express = require('express');
const app = express();
const port = 3000;
const hostname = 'localhost';
const monster_route = require('./routes/monster.route');

app.get('/', (req, res) => {
  res.json({ message: 'API Express opérationnelle' });
});
app.use(express.json());
app.use('/monster_info', monster_route);

app.listen(port,hostname, () => {
  console.log(`Serveur lancé sur http://${hostname}:${port}`);
});   