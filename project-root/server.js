const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'API Express opérationnelle' });
});

app.listen(port,hostname, () => {
  console.log(`\n Serveur lancé sur http://${hostname}:${port}`);
});   
