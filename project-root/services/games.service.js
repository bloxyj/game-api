const gameState = require('../data/store');

exports.processTurn = (actionType) => {
    let logPlayer = "";
    let logEnemy = "";

    if (actionType === 'attack') {
        const dmg = Math.floor(Math.random() * 15) + 10;
        gameState.enemyHP -= dmg;
        logPlayer = `Vous attaquez Sans ! -${dmg} PV`;
    } else {
        logPlayer = `Vous observez Sans prudemment.`;
    }

    if (gameState.enemyHP > 0) {
        const enemyDmg = Math.floor(Math.random() * 12) + 5;
        gameState.playerHP -= enemyDmg;
        logEnemy = `Sans utilise une attaque d'os ! -${enemyDmg} PV`;
    }

    return {
        state: gameState,
        logPlayer,
        logEnemy,
        isGameOver: gameState.enemyHP <= 0 || gameState.playerHP <= 0
    };
};

exports.fleeGame = () => {
    return { message: "Vous avez pris la fuite..." };
};

exports.resetGame = () => {
    gameState.playerHP = 100;
    gameState.enemyHP = 100;
    return gameState;
};