// services/games.service.js
const store = require('../data/store');
const generateId = require('../utils/generateId');


exports.createGame = (playerId) => {
    
    const player = store.players.find(p => p.id === playerId);
    if (!player) {
        return { error: "Joueur introuvable. Créez d'abord un joueur via POST /players" };
    }

    
    const dungeon = [
        { id: 1, name: "Entrée sombre", monster: null },
        { id: 2, name: "Couloir humide", monster: store.monsters[0] }, // Wind Feary
        { id: 3, name: "Armurerie vide", monster: null },
        { id: 4, name: "Antre du Boss", monster: store.monsters[1] },  // Sans
        { id: 5, name: "Salle du trésor", monster: null, isExit: true }
    ];

    const newGame = {
        id: generateId(),
        playerId: player.id,
        playerName: player.name,
        dungeon: dungeon,
        currentRoomId: 1, 
        playerCurrentHP: player.hp,
        status: 'IN_PROGRESS', // 
        logs: ["La partie commence. Vous entrez dans le donjon."]
    };

   
    store.games.push(newGame);
    return newGame;
};
