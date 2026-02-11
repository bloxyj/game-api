const gameState = require('../data/store');

class GamesService {
    executeTurn(actionType) {
        let logPlayer = "";
        let logEnemy = "";

        if (actionType === 'attack') {
            let dmg = Math.floor(Math.random() * 15) + 10;
            gameState.enemyHP -= dmg;
            logPlayer = `⚔️ Vous attaquez ! -${dmg} PV`;
        } else {
            logPlayer = `🛡️ Vous vous préparez à parer.`;
        }

        let enemyDmg = 0;
        if (gameState.enemyHP > 0) {
            enemyDmg = Math.floor(Math.random() * 12) + 5;
            if (actionType === 'defend') enemyDmg = Math.floor(enemyDmg * 0.5);
            gameState.playerHP -= enemyDmg;
            logEnemy = `👹 Le monstre riposte ! -${enemyDmg} PV`;
        }

        return {
            state: gameState,
            logPlayer,
            logEnemy,
            isGameOver: gameState.enemyHP <= 0 || gameState.playerHP <= 0
        };
    }

    getGameState() {
        return gameState;
    }
}

module.exports = new GamesService();