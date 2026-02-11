const express = require('express');
const path = require('path');
const app = express();
const gameRoutes = require('./routes/game.routes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/game', gameRoutes);

app.listen(3000, () => {
    console.log("Undertale API OK : http://localhost:3000");
});