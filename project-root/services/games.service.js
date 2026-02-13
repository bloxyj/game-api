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

exports.movePlayer = (gameId) => {
    
    const game = store.games.find(g => g.id === gameId);
    if (!game) return { error: "Partie introuvable." };
    if (game.status !== 'IN_PROGRESS') return { error: "La partie est terminée." };

    // 2. Vérifier la salle actuelle
    const currentRoom = game.dungeon.find(r => r.id === game.currentRoomId);
    
    
    if (currentRoom.monster && currentRoom.monster.hp > 0) {
        return { error: "Un monstre vous bloque le passage ! Tuez-le pour avancer." };
    }

    // 3. Calculer la prochaine salle
    const nextRoomId = game.currentRoomId + 1;
    const nextRoom = game.dungeon.find(r => r.id === nextRoomId);

    if (!nextRoom) {
        
        game.status = "VICTORY";
        game.logs.push("Vous sortez du donjon. Victoire !");
        return game;
    }

    game.currentRoomId = nextRoomId;
    game.logs.push(`Vous avancez vers : ${nextRoom.name}`);
    
    return game;
};