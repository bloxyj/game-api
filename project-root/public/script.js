// --- VARIABLES GLOBALES ---
let gameId = null;
let playerId = null;
let authToken = localStorage.getItem('authToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

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
const API_URL = '/game-api';

async function apiCall(url, method = 'POST', body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    // Add auth token if available
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    if (body) options.body = JSON.stringify(body);
    
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        
        // Handle 401 - token expired or invalid
        if (res.status === 401) {
            logout();
            alert('Session expired. Please login again.');
            return null;
        }
        
        return data;
    } catch (err) {
        console.error("Erreur API:", err);
        alert("Erreur de connexion au serveur");
        return null;
    }
}

// --- AUTH FUNCTIONS ---

function saveAuth(token, user) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Reset UI
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('player-section').style.display = 'none';
    document.getElementById('auth-login').style.display = 'block';
    document.getElementById('auth-register').style.display = 'none';
    
    // Make sure we're on login screen
    gameScreen.classList.remove('active-screen');
    loginScreen.classList.add('active-screen');
}

function showLoggedInUI() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('auth-user-display').innerText = currentUser.username;
}

// Check if already logged in on page load
if (authToken && currentUser) {
    showLoggedInUI();
}

// Toggle between login and register forms
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('auth-login').style.display = 'none';
    document.getElementById('auth-register').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('auth-register').style.display = 'none';
    document.getElementById('auth-login').style.display = 'block';
});

// Login
document.getElementById('btn-login').addEventListener('click', async () => {
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;
    
    if (!username || !password) return alert('Enter username and password!');
    
    const result = await apiCall(`${API_URL}/auth/login`, 'POST', { username, password });
    if (result && result.token) {
        saveAuth(result.token, result.user);
        showLoggedInUI();
    } else if (result && result.error) {
        alert(result.error);
    }
});

// Register
document.getElementById('btn-register').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    if (!username || !email || !password) return alert('Fill in all fields!');
    if (password.length < 6) return alert('Password must be at least 6 characters!');
    
    const result = await apiCall(`${API_URL}/auth/register`, 'POST', { username, email, password });
    if (result && result.token) {
        saveAuth(result.token, result.user);
        showLoggedInUI();
    } else if (result && result.error) {
        alert(result.error);
    }
});

// Logout
document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// --- LOGIQUE DU JEU ---

// 1. Démarrer le jeu
document.getElementById('btn-start-game').addEventListener('click', async () => {
    const name = document.getElementById('player-name-input').value;
    if (!name) return alert("Entrez un nom !");

    // Créer Joueur
    const player = await apiCall(`${API_URL}/players`, 'POST', { name });
    if (!player || player.error) return alert(player ? player.error : 'Failed to create player');
    playerId = player._id;
    document.getElementById('player-name-display').innerText = player.name.toUpperCase();

    // Créer Partie
    const game = await apiCall(`${API_URL}/games`, 'POST', { playerId });
    if (!game || game.error) return alert(game ? game.error : 'Failed to create game');
    gameId = game._id;

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