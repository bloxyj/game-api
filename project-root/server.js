const express = require('express');
const path = require('path');
const app = express();
const gameRoutes = require('./routes/game.routes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/game', gameRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Node.js OK http://localhost:${PORT}`);
});