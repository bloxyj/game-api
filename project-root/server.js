const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'API Express opérationnelle' });
});

app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});