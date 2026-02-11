const log = document.getElementById('log');
const sansSprite = document.getElementById('sans-sprite');
const enemyUI = document.getElementById('enemy-ui-block');
const mainUI = document.getElementById('main-ui');
const finalScene = document.getElementById('final-scene');
const uiButtons = document.getElementById('ui-buttons');

async function apiCall(endpoint, body = null) {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`/api/game/${endpoint}`, options);
    return await res.json();
}

// APPARITION DE L'IMAGE FINALE
function triggerFinalTransition() {
    mainUI.classList.add('hidden-ui');
    setTimeout(() => {
        mainUI.style.display = 'none';
        finalScene.classList.add('visible-scene');
    }, 1500);
}

async function executeTurn(action) {
    const data = await apiCall('turn', { actionType: action });
    log.innerText = `* ${data.logPlayer}`;
    if (action === 'attack') {
        sansSprite.classList.add('shake');
        setTimeout(() => sansSprite.classList.remove('shake'), 500);
    }
    updateUI(data.state);

    if (!data.isGameOver) {
        setTimeout(() => {
            log.innerText = `* ${data.logEnemy}`;
            updateUI(data.state);
        }, 1000);
    } else {
        log.innerText = "* Le combat est fini.";
        setTimeout(triggerFinalTransition, 2000);
    }
}

function updateUI(state) {
    document.getElementById('player-hp').style.width = Math.max(0, state.playerHP) + "%";
    document.getElementById('enemy-hp').style.width = Math.max(0, state.enemyHP) + "%";
    document.querySelector('.hp-values').innerText = `${Math.max(0, state.playerHP)} / 100`;
}

// BOUTON MERCY
document.getElementById('btn-mercy').addEventListener('click', async () => {
    const data = await apiCall('flee');
    log.innerText = `* ${data.message}`;
    sansSprite.classList.add('fade-out');
    enemyUI.classList.add('fade-out');
    uiButtons.style.display = 'none';
    setTimeout(triggerFinalTransition, 2500);
});

// BOUTON RETRY (Sur l'image de fin)
document.getElementById('btn-restart-final').addEventListener('click', async () => {
    const state = await apiCall('reset');
    finalScene.classList.remove('visible-scene');
    setTimeout(() => {
        finalScene.style.display = 'none';
        mainUI.style.display = 'block';
        mainUI.classList.remove('hidden-ui');
        sansSprite.classList.remove('fade-out');
        enemyUI.classList.remove('fade-out');
        uiButtons.style.display = 'flex';
        updateUI(state);
        log.innerText = "* Nouveau départ.";
    }, 1000);
});

document.getElementById('btn-attack').addEventListener('click', () => executeTurn('attack'));

window.onload = async () => {
    const res = await fetch('/api/game/state');
    updateUI(await res.json());
};

//music undertale fight
const music = document.getElementById('bgm');

function startMusic() {
    music.play().catch(error => {
        console.log("L'autoplay a été bloqué, en attente d'interaction.");
    });
    document.removeEventListener('click', startMusic);
}

// lance la music après le premier clique
document.addEventListener('click', startMusic);