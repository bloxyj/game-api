const log = document.getElementById('log');
const btnAttack = document.getElementById('btn-attack');
const btnDefend = document.getElementById('btn-defend');

let isWaiting = false;

async function executeTurn(action) {
    if (isWaiting) return;
    isWaiting = true;

    try {
        // Appelle la route définie dans ton game.routes.js
        const response = await fetch('/api/game/turn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionType: action })
        });

        const data = await response.json();

        // Affichage du tour du joueur
        log.innerText = `* ${data.logPlayer}`;
        updateUI(data.state);

        if (!data.isGameOver) {
            setTimeout(() => {
                log.innerText = `* ${data.logEnemy}`;
                updateUI(data.state);
                isWaiting = false;
            }, 1000);
        } else {
            log.innerText = data.state.enemyHP <= 0 ? "* VICTOIRE ! Sans est K.O." : "* Tu es mort... Déterminé ?";
        }
    } catch (error) {
        log.innerText = "* Erreur : Le serveur Node.js ne répond pas.";
        isWaiting = false;
    }
}

function updateUI(state) {
    // Mise à jour HP Joueur
    const playerBar = document.getElementById('player-hp');
    const hpText = document.querySelector('.hp-values');
    if (playerBar) playerBar.style.width = Math.max(0, state.playerHP) + "%";
    if (hpText) hpText.innerText = `${Math.max(0, state.playerHP)} / 100`;

    // Mise à jour HP Sans (Barre interactive)
    const enemyBar = document.getElementById('enemy-hp');
    if (enemyBar) {
        // On ramène le pourcentage sur 100
        enemyBar.style.width = Math.max(0, state.enemyHP) + "%";
    }
}

btnAttack.addEventListener('click', () => executeTurn('attack'));
btnDefend.addEventListener('click', () => executeTurn('defend'));

// Synchro initiale
window.onload = async () => {
    const res = await fetch('/api/game/state');
    const state = await res.json();
    updateUI(state);
};