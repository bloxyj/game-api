// services/games.service.js
const Player = require('../models/Player.model');
const Monster = require('../models/Monster.model');
const Game = require('../models/Game.model');
const { buildDungeon } = require('../utils/dungeon');


exports.createGame = async (playerId) => {
    const player = await Player.findById(playerId);
    if (!player) {
        return { error: true, message: 'Player not found. Create a player first.' };
    }

    const monsters = await Monster.find();
    const dungeon = buildDungeon(monsters);

    const newGame = new Game({
        playerId: player._id,
        playerName: player.name,
        dungeon: dungeon,
        currentRoomId: dungeon[0].id, 
        playerCurrentHP: player.hp,
        status: 'IN_PROGRESS',
        logs: ['The game begins. You enter the dungeon.']
    });

    await newGame.save();
    return newGame;
};

exports.movePlayer = async (gameId) => {
    const game = await Game.findById(gameId);
    if (!game) return { error: true, message: 'Game not found.' };
    if (game.status !== 'IN_PROGRESS') return { error: true, message: 'This game has ended.' };

    // 2. Vérifier la salle actuelle
    const currentIndex = game.dungeon.findIndex(r => r.id === game.currentRoomId);
    const currentRoom = game.dungeon[currentIndex];
    
    if (currentRoom.monster && currentRoom.monster.hp > 0) {
        return { error: true, message: 'A monster blocks the way. Defeat it to advance.' };
    }

    // 3. Calculer la prochaine salle
    const nextRoom = game.dungeon[currentIndex + 1];

    if (!nextRoom) {
        game.status = 'VICTORY';
        game.logs.push('You exit the dungeon. Victory!');
        await game.save();
        return game;
    }

    game.currentRoomId = nextRoom.id;
    game.logs.push(`You move to: ${nextRoom.name}`);
    await game.save();
    
    return game;
};

exports.playTurn = async (gameId, { action = 'fight', timingScore = 0.5, dodgeScore = 0.0 } = {}) => {
    // 1. Récupérer la partie
    const game = await Game.findById(gameId);
    if (!game) return { error: true, message: 'Game not found.' };
    if (game.status !== 'IN_PROGRESS') return { error: true, message: 'This game has ended.' };

    // 2. Récupérer la salle et le monstre
    const room = game.dungeon.find(r => r.id === game.currentRoomId);
    const monster = room.monster;

    if (!monster || monster.hp <= 0) {
        return { error: true, message: 'There is nobody to attack here.' };
    }

    timingScore = Math.max(0, Math.min(1, timingScore));
    dodgeScore = Math.max(0, Math.min(1, dodgeScore));


    if (action === 'mercy') {
        monster.hp = 0;
        game.logs.push(`You spared ${monster.name}.`);
        game.markModified('dungeon');
        await game.save();
        return game;
    }


    const baseDmg = 25 * (0.5 + Math.random() * 0.5);
    const playerDmg = Math.max(1, Math.floor(baseDmg * timingScore));
    monster.hp -= playerDmg;
    game.logs.push(`You attack ${monster.name} and deal ${playerDmg} damage.`);

    // Vérifier si le monstre meurt
    if (monster.hp <= 0) {
        monster.hp = 0;
        game.playerCurrentHP = 100;
        game.logs.push(`Victory! ${monster.name} is defeated.`);
        game.logs.push('You feel rejuvenated. HP fully restored to 100.');
        game.markModified('dungeon');
        await game.save();
        return game;
    }

    // --- TOUR DU MONSTRE ---
    const monsterBaseDmg = monster.atk * (0.5 + Math.random() * 0.5);
    const monsterDmg = Math.max(1, Math.floor(monsterBaseDmg * (1 - dodgeScore * 0.8)));
    game.playerCurrentHP -= monsterDmg;
    game.logs.push(`${monster.name} strikes back. You lose ${monsterDmg} HP.`);

    // Vérifier si le joueur meurt
    if (game.playerCurrentHP <= 0) {
        game.playerCurrentHP = 0;
        game.status = 'GAME_OVER';
        game.logs.push('You died. Game over.');
    }

    game.markModified('dungeon');
    await game.save();
    return game;
};