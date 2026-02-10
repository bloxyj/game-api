const express = require('express');
const app = express();
const port = 3000;
const hostname = 'localhost'
app.get('/', (req, res) => {
  res.json({ message: 'API Express opérationnelle' });
});

app.listen(port,hostname, () => {
  console.log(`Serveur lancé sur http://${hostname}:${port}`);
});