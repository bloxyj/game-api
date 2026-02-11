const log = document.getElementById('log');
const btnAttack = document.getElementById('btn-attack');
const btnDefend = document.getElementById('btn-defend');

let isWaiting = false;

// 1. Fonction pour demander une action au serveur
async function executeTurn(action) {
    if (isWaiting) return;
    isWaiting = true;

    try {
        // Envoi de l'action au Controller via la Route Express
        const response = await fetch('/api/game/turn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionType: action })
        });

        const data = await response.json();

        // Affichage du résultat du tour (calculé par le Service Node.js)
        log.innerText = `* ${data.logPlayer}`;
        updateUI(data.state);

        if (!data.isGameOver) {
            // Petit délai pour la riposte du monstre (feeling Undertale)
            setTimeout(() => {
                log.innerText = `* ${data.logEnemy}`;
                updateUI(data.state);
                isWaiting = false;
            }, 1000);
        } else {
            // Gestion de la fin de combat dictée par le serveur
            log.innerText = data.state.enemyHP <= 0 ? "* VICTOIRE !" : "* Game Over...";
        }
    } catch (error) {
        console.error("Erreur de connexion à l'API:", error);
        log.innerText = "* Erreur : Le serveur Node.js ne répond pas.";
        isWaiting = false;
    }
}

// 2. Fonction de mise à jour visuelle (Interface)
function updateUI(state) {
    // On met à jour les barres de vie en fonction de l'état renvoyé par le serveur
    const enemyBar = document.getElementById('enemy-hp');
    const playerBar = document.getElementById('player-hp');
    const hpText = document.querySelector('.hp-values');

    if (enemyBar) enemyBar.style.width = Math.max(0, state.enemyHP) + "%";
    if (playerBar) playerBar.style.width = Math.max(0, state.playerHP) + "%";
    
    if (hpText) {
        hpText.innerText = `${Math.max(0, state.playerHP)} / 100`;
    }
}

// 3. Synchronisation initiale au chargement
// On demande l'état actuel au store.js via l'API pour être raccord dès le début
window.onload = async () => {
    try {
        const res = await fetch('/api/game/state');
        const state = await res.json();
        updateUI(state);
    } catch (e) {
        log.innerText = "* Connexion serveur échouée.";
    }
};

btnAttack.addEventListener('click', () => executeTurn('attack'));
btnDefend.addEventListener('click', () => executeTurn('defend'));