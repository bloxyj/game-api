// --- VARIABLES GLOBALES ---
let gameId = null;
let playerId = null;

// --- ÉLÉMENTS DOM ---
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const roomName = document.getElementById('room-name');
const roomLog = document.getElementById('room-log');
const combatUI = document.getElementById('combat-ui');
const explorationUI = document.getElementById('exploration-controls');
const logBox = document.getElementById('log');
const enemySprite = document.getElementById('enemy-sprite');

// --- FONCTIONS API ---
const API_URL = 'http://localhost:3000/game-api';

async function apiCall(url, method = 'POST', body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch (err) {
        console.error("Erreur API:", err);
        alert("Erreur de connexion au serveur");
    }
}

// --- LOGIQUE DU JEU ---

// 1. Démarrer le jeu
document.getElementById('btn-start-game').addEventListener('click', async () => {
    const name = document.getElementById('player-name-input').value;
    if (!name) return alert("Entrez un nom !");

    // Créer Joueur
    const player = await apiCall(`${API_URL}/players`, 'POST', { name });
    playerId = player.id;
    document.getElementById('player-name-display').innerText = player.name.toUpperCase();

    // Créer Partie
    const game = await apiCall(`${API_URL}/games`, 'POST', { playerId });
    gameId = game.id;

    // Changer d'écran
    loginScreen.classList.remove('active-screen');
    gameScreen.classList.add('active-screen');

    updateInterface(game);
});

// 2. Attaquer
document.getElementById('btn-attack').addEventListener('click', async () => {
    if (!gameId) return;
    
    // Animation visuelle
    enemySprite.classList.add('shake');
    setTimeout(() => enemySprite.classList.remove('shake'), 500);

    const gameState = await apiCall(`${API_URL}/games/${gameId}/attack`, 'POST');
    updateInterface(gameState);
});

// 3. Avancer
document.getElementById('btn-move').addEventListener('click', async () => {
    if (!gameId) return;
    const gameState = await apiCall(`${API_URL}/games/${gameId}/move`, 'POST');
    
    if (gameState.error) {
        alert(gameState.error);
    } else {
        updateInterface(gameState);
    }
});

// --- MISE À JOUR DE L'INTERFACE (LE COEUR DU SYSTÈME) ---
function updateInterface(game) {
    // 1. Infos de base
    const currentRoom = game.dungeon.find(r => r.id === game.currentRoomId);
    roomName.innerText = `SALLE ${game.currentRoomId} : ${currentRoom.name}`;
    
    // Afficher le dernier log important
    if (game.logs.length > 0) {
        const lastLog = game.logs[game.logs.length - 1];
        roomLog.innerText = lastLog;
        logBox.innerText = "* " + lastLog;
    }

    // 2. Gestion HP Joueur
    const hpPercent = Math.max(0, game.playerCurrentHP); // Sur 100
    document.getElementById('player-hp').style.width = hpPercent + "%";
    document.getElementById('hp-text').innerText = `${hpPercent} / 100`;

    // 3. Y a-t-il un monstre vivant ?
    const monster = currentRoom.monster;
    const isMonsterAlive = monster && monster.hp > 0;

    if (isMonsterAlive) {
        // MODE COMBAT
        combatUI.style.display = 'block';
        explorationUI.style.display = 'none';
        
        // Infos Monstre
        document.getElementById('enemy-name-display').innerText = monster.name.toUpperCase();
        
        // Calcul HP Monstre (basique car on ne connait pas le HP Max dans le store simplifié, on suppose 100 ou 150)
        // Astuce : On laisse la barre verte pleine tant qu'il est vivant, ou on fait une estimation
        let maxMonsterHP = (monster.name.includes("Boss")) ? 150 : 50; 
        let monsterHpPercent = (monster.hp / maxMonsterHP) * 100;
        document.getElementById('enemy-hp').style.width = Math.max(0, monsterHpPercent) + "%";

    } else {
        // MODE EXPLORATION (Monstre mort ou salle vide)
        combatUI.style.display = 'none';
        explorationUI.style.display = 'block';
        
        if (game.status === 'VICTORY') {
            roomName.innerText = "🏆 VICTOIRE !";
            document.getElementById('btn-move').style.display = 'none'; // Plus de mouvement
        }
    }

    // Gestion Game Over
    if (game.status === 'GAME_OVER') {
        alert("GAME OVER ! Rafraichissez la page pour recommencer.");
        location.reload();
    }
}