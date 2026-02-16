// services/games.service.js
const Player = require('../models/Player.model');
const Monster = require('../models/Monster.model');
const Game = require('../models/Game.model');
const { buildDungeon } = require('../utils/dungeon');


exports.createGame = async (playerId) => {
    
    const player = await Player.findById(playerId);
    if (!player) {
        return { error: "Joueur introuvable. Créez d'abord un joueur via POST /players" };
    }

    // Fetch all monsters from DB and build dungeon with deep clones
    const monsters = await Monster.find();
    const dungeon = buildDungeon(monsters);

    const newGame = new Game({
        playerId: player._id,
        playerName: player.name,
        dungeon: dungeon,
        currentRoomId: 1, 
        playerCurrentHP: player.hp,
        status: 'IN_PROGRESS',
        logs: ["La partie commence. Vous entrez dans le donjon."]
    });

    await newGame.save();
    return newGame;
};

exports.movePlayer = async (gameId) => {
    
    const game = await Game.findById(gameId);
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
        await game.save();
        return game;
    }

    game.currentRoomId = nextRoomId;
    game.logs.push(`Vous avancez vers : ${nextRoom.name}`);
    await game.save();
    
    return game;
};

exports.playTurn = async (gameId) => {
    // 1. Récupérer la partie
    const game = await Game.findById(gameId);
    if (!game) return { error: "Partie introuvable." };
    if (game.status !== 'IN_PROGRESS') return { error: "La partie est terminée." };

    // 2. Récupérer la salle et le monstre
    const room = game.dungeon.find(r => r.id === game.currentRoomId);
    const monster = room.monster;

    if (!monster || monster.hp <= 0) {
        return { error: "Il n'y a personne à attaquer ici !" };
    }

    // --- TOUR DU JOUEUR ---
    const playerDmg = Math.floor(Math.random() * 15) + 10;
    monster.hp -= playerDmg;
    game.logs.push(`Vous attaquez ${monster.name} et infligez ${playerDmg} dégâts !`);

    // Vérifier si le monstre meurt
    if (monster.hp <= 0) {
        monster.hp = 0;
        game.logs.push(`VICTOIRE ! ${monster.name} est vaincu.`);
        game.markModified('dungeon');
        await game.save();
        return game;
    }

    // --- TOUR DU MONSTRE ---
    const monsterDmg = Math.floor(Math.random() * 10) + 5;
    game.playerCurrentHP -= monsterDmg;
    game.logs.push(`${monster.name} riposte ! Vous perdez ${monsterDmg} PV.`);

    // Vérifier si le joueur meurt
    if (game.playerCurrentHP <= 0) {
        game.playerCurrentHP = 0;
        game.status = "GAME_OVER";
        game.logs.push("Vous êtes mort... Fin de la partie.");
    }

    game.markModified('dungeon');
    await game.save();
    return game;
};