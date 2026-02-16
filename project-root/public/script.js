// =============================================================================
// UNDERTALE COMBAT SYSTEM - ROGUE-LITE API FRONTEND
// =============================================================================

// --- GLOBAL STATE ---
var gameId = null;
var playerId = null;
var authToken = localStorage.getItem('authToken') || null;
var currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
var monsterMaxHP = {};
var currentGameState = null;

// --- COMBAT STATE MACHINE ---
var COMBAT_STATE = {
    MENU: 'MENU',
    ATTACK_TIMING: 'ATTACK_TIMING',
    PLAYER_ATTACK_ANIM: 'PLAYER_ATTACK_ANIM',
    DODGE_PHASE: 'DODGE_PHASE',
    RESOLVE: 'RESOLVE',
    DIALOGUE: 'DIALOGUE',
    IDLE: 'IDLE'
};
var combatState = COMBAT_STATE.IDLE;
var timingScore = 0.5;
var dodgeScore = 0.0;
var currentAction = 'fight';

// --- DOM ELEMENTS ---
var loginScreen = document.getElementById('login-screen');
var gameScreen = document.getElementById('game-screen');
var roomName = document.getElementById('room-name');
var roomLog = document.getElementById('room-log');
var combatUI = document.getElementById('combat-ui');
var explorationUI = document.getElementById('exploration-controls');
var battleText = document.getElementById('battle-text');
var enemySprite = document.getElementById('enemy-sprite');
var canvas = document.getElementById('battle-canvas');
var ctx = canvas.getContext('2d');
var timingBarContainer = document.getElementById('timing-bar-container');
var timingIndicator = document.getElementById('timing-indicator');
var combatButtons = document.getElementById('combat-buttons');

// --- API LAYER ---
var API_URL = '/api';

async function apiCall(path, method, body) {
    method = method || 'POST';
    body = body || null;
    var options = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (authToken) options.headers['Authorization'] = 'Bearer ' + authToken;
    if (body) options.body = JSON.stringify(body);
    try {
        var res = await fetch(API_URL + path, options);
        var data = await res.json();
        if (res.status === 401) { logout(); alert('Session expired. Please login again.'); return null; }
        if (!res.ok) { alert(data.message || data.error || 'Request failed'); return null; }
        return data;
    } catch (err) { console.error('API error:', err); alert('Server connection error'); return null; }
}

// --- AUTH ---
function saveAuth(token, user) {
    authToken = token; currentUser = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    authToken = null; currentUser = null;
    localStorage.removeItem('authToken'); localStorage.removeItem('currentUser');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('player-section').style.display = 'none';
    document.getElementById('auth-login').style.display = 'block';
    document.getElementById('auth-register').style.display = 'none';
    gameScreen.classList.remove('active-screen');
    loginScreen.classList.add('active-screen');
}

function showLoggedInUI() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('auth-user-display').innerText = currentUser.username;
}

if (authToken && currentUser) showLoggedInUI();

document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('auth-login').style.display = 'none';
    document.getElementById('auth-register').style.display = 'block';
});
document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('auth-register').style.display = 'none';
    document.getElementById('auth-login').style.display = 'block';
});

document.getElementById('btn-login').addEventListener('click', async function() {
    var username = document.getElementById('auth-username').value;
    var password = document.getElementById('auth-password').value;
    if (!username || !password) return alert('Enter username and password!');
    var result = await apiCall('/auth/login', 'POST', { username: username, password: password });
    if (result && result.token) { saveAuth(result.token, result.user); showLoggedInUI(); playMusic(); }
});

document.getElementById('btn-register').addEventListener('click', async function() {
    var username = document.getElementById('reg-username').value;
    var email = document.getElementById('reg-email').value;
    var password = document.getElementById('reg-password').value;
    if (!username || !email || !password) return alert('Fill in all fields!');
    if (password.length < 6) return alert('Password must be at least 6 characters!');
    var result = await apiCall('/auth/register', 'POST', { username: username, email: email, password: password });
    if (result && result.token) { saveAuth(result.token, result.user); showLoggedInUI(); playMusic(); }
});

document.getElementById('btn-logout').addEventListener('click', function(e) { e.preventDefault(); logout(); });

// --- AUDIO ---
var bgAudio = document.getElementById('bg-music');
var musicStarted = false;
function playMusic() {
    if (musicStarted || !bgAudio) return;
    bgAudio.play().catch(function(){});
    musicStarted = true;
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, duration, vol) {
    freq = freq || 440; duration = duration || 0.08; vol = vol || 0.15;
    try {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}
function playHitSound() { playBeep(200, 0.12, 0.2); }
function playDamageSound() { playBeep(120, 0.15, 0.25); }
function playMenuSound() { playBeep(600, 0.05, 0.1); }

// =============================================================================
// GAME START
// =============================================================================
document.getElementById('btn-start-game').addEventListener('click', async function() {
    var name = document.getElementById('player-name-input').value;
    if (!name) return alert('Enter a name!');
    var player = await apiCall('/players', 'POST', { name: name });
    if (!player) return;
    playerId = player.id;
    document.getElementById('player-name-display').innerText = player.name.toUpperCase();
    var game = await apiCall('/games', 'POST', { playerId: playerId });
    if (!game) return;
    gameId = game.id;
    playMusic();
    loginScreen.classList.remove('active-screen');
    gameScreen.classList.add('active-screen');
    updateInterface(game);
});

// =============================================================================
// COMBAT BUTTONS
// =============================================================================
document.getElementById('btn-attack').addEventListener('click', function() {
    if (combatState !== COMBAT_STATE.MENU) return;
    playMenuSound();
    currentAction = 'fight';
    startTimingBar();
});

document.getElementById('btn-mercy').addEventListener('click', async function() {
    if (combatState !== COMBAT_STATE.MENU) return;
    playMenuSound();
    currentAction = 'mercy';
    combatState = COMBAT_STATE.RESOLVE;
    setButtonsDisabled(true);
    var monsterName = getCurrentMonsterName();
    var result = await apiCall('/games/' + gameId + '/attack', 'POST', {
        action: 'mercy', timingScore: 0, dodgeScore: 0
    });
    if (result) {
        await typeText('* You spared ' + monsterName + '.');
        await sleep(600);
        updateInterface(result);
    }
    combatState = COMBAT_STATE.MENU;
    setButtonsDisabled(false);
});

document.getElementById('btn-move').addEventListener('click', async function() {
    if (!gameId) return;
    var gameState = await apiCall('/games/' + gameId + '/move', 'POST');
    if (gameState) updateInterface(gameState);
});

function setButtonsDisabled(disabled) {
    document.getElementById('btn-attack').disabled = disabled;
    document.getElementById('btn-mercy').disabled = disabled;
}

function getCurrentMonsterName() {
    if (!currentGameState) return 'the monster';
    var room = currentGameState.dungeon.find(function(r) { return r.id === currentGameState.currentRoomId; });
    return (room && room.monster && room.monster.name) ? room.monster.name : 'the monster';
}

// =============================================================================
// TIMING BAR
// =============================================================================
var timingAnimId = null;
var timingPos = 0;
var timingDir = 1;
var TIMING_SPEED = 20;

function startTimingBar() {
    combatState = COMBAT_STATE.ATTACK_TIMING;
    setButtonsDisabled(true);
    timingBarContainer.style.display = 'block';
    canvas.style.display = 'none';
    battleText.style.display = 'block';
    battleText.innerText = '* Press ENTER or click the bar to attack!';
    timingPos = 0;
    timingDir = 1;
    animateTiming();
}

function animateTiming() {
    timingPos += TIMING_SPEED * timingDir;
    var barWidth = document.getElementById('timing-bar').offsetWidth;
    if (timingPos >= barWidth - 4) timingDir = -1;
    if (timingPos <= 0) timingDir = 1;
    timingIndicator.style.left = timingPos + 'px';
    timingAnimId = requestAnimationFrame(animateTiming);
}

function stopTimingBar() {
    if (combatState !== COMBAT_STATE.ATTACK_TIMING) return;
    cancelAnimationFrame(timingAnimId);
    var barWidth = document.getElementById('timing-bar').offsetWidth;
    var center = barWidth / 2;
    var dist = Math.abs(timingPos - center) / center;
    timingScore = Math.max(0.05, 1 - dist);
    timingBarContainer.style.display = 'none';

    var hitText, hitColor;
    if (timingScore > 0.85) { hitText = 'CRITICAL!'; hitColor = '#ff0'; }
    else if (timingScore > 0.5) { hitText = 'Hit!'; hitColor = '#fff'; }
    else { hitText = 'Miss...'; hitColor = '#888'; }

    playHitSound();
    showHitFeedback(hitText, hitColor);
    combatState = COMBAT_STATE.PLAYER_ATTACK_ANIM;

    enemySprite.classList.add('shake');
    enemySprite.style.filter = 'brightness(3)';
    setTimeout(function() {
        enemySprite.classList.remove('shake');
        enemySprite.style.filter = '';
        startDodgePhase();
    }, 600);
}

function showHitFeedback(text, color) {
    var el = document.createElement('div');
    el.className = 'hit-feedback';
    el.innerText = text;
    el.style.color = color;
    var container = document.querySelector('.enemy-container');
    container.appendChild(el);
    setTimeout(function() { el.remove(); }, 1000);
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && combatState === COMBAT_STATE.ATTACK_TIMING) {
        e.preventDefault();
        stopTimingBar();
    }
});
document.getElementById('timing-bar').addEventListener('click', function() { stopTimingBar(); });

// =============================================================================
// DODGE PHASE - BULLET HELL ENGINE
// =============================================================================
var SOUL = { x: 0, y: 0, w: 16, h: 16, speed: 2, vx: 0, vy: 0, color: '#ff0000', blue: false, grounded: false };
var projectiles = [];
var dodgeActive = false;
var dodgeFrameId = null;
var hitCount = 0;
var maxExpectedHits = 10;
var dodgeStartTime = 0;
var dodgeDuration = 5000;
var invulnFrames = 0;
var INVULN_TIME = 30;
var soulFlashFrame = 0;

var keysDown = {};
document.addEventListener('keydown', function(e) {
    keysDown[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0 && dodgeActive) e.preventDefault();
});
document.addEventListener('keyup', function(e) { keysDown[e.key] = false; });

function startDodgePhase() {
    combatState = COMBAT_STATE.DODGE_PHASE;
    battleText.style.display = 'none';
    canvas.style.display = 'block';

    SOUL.x = canvas.width / 2 - SOUL.w / 2;
    SOUL.y = canvas.height - 30;
    SOUL.vx = 0; SOUL.vy = 0;
    SOUL.blue = false;
    SOUL.grounded = false;
    projectiles = [];
    hitCount = 0;
    invulnFrames = 0;
    dodgeActive = true;
    dodgeStartTime = performance.now();

    var room = currentGameState.dungeon.find(function(r) { return r.id === currentGameState.currentRoomId; });
    var monsterName = (room && room.monster) ? room.monster.name : '';
    var pattern = MONSTER_PATTERNS[monsterName] || MONSTER_PATTERNS['default'];

    dodgeDuration = pattern.duration || 5000;
    maxExpectedHits = pattern.maxHits || 10;

    if (pattern.blueMode) {
        SOUL.blue = true;
        SOUL.y = canvas.height - SOUL.h - 2;
        SOUL.grounded = true;
    }

    pattern.run(canvas, projectiles, SOUL);

    var dialogue = pattern.dialogue || '* ...';
    battleText.style.display = 'block';
    battleText.innerText = dialogue;
    setTimeout(function() {
        if (dodgeActive) battleText.style.display = 'none';
    }, 1500);

    dodgeFrameId = requestAnimationFrame(dodgeLoop);
    setTimeout(function() { endDodgePhase(); }, dodgeDuration);
}

function dodgeLoop() {
    if (!dodgeActive) return;
    updateSOUL();
    updateProjectiles();
    checkCollisions();
    renderDodge();
    if (invulnFrames > 0) invulnFrames--;
    dodgeFrameId = requestAnimationFrame(dodgeLoop);
}

function updateSOUL() {
    if (SOUL.blue) {
        var GRAVITY = 0.2;
        var JUMP_FORCE = -6;
        if (keysDown['ArrowLeft']) SOUL.x -= SOUL.speed;
        if (keysDown['ArrowRight']) SOUL.x += SOUL.speed;
        if (keysDown['ArrowUp'] && SOUL.grounded) {
            SOUL.vy = JUMP_FORCE;
            SOUL.grounded = false;
        }
        SOUL.vy += GRAVITY;
        SOUL.y += SOUL.vy;
        if (SOUL.y >= canvas.height - SOUL.h - 2) {
            SOUL.y = canvas.height - SOUL.h - 2;
            SOUL.vy = 0;
            SOUL.grounded = true;
        }
        if (SOUL.y < 2) { SOUL.y = 2; SOUL.vy = 0; }
    } else {
        if (keysDown['ArrowLeft']) SOUL.x -= SOUL.speed;
        if (keysDown['ArrowRight']) SOUL.x += SOUL.speed;
        if (keysDown['ArrowUp']) SOUL.y -= SOUL.speed;
        if (keysDown['ArrowDown']) SOUL.y += SOUL.speed;
    }
    SOUL.x = Math.max(2, Math.min(canvas.width - SOUL.w - 2, SOUL.x));
    SOUL.y = Math.max(2, Math.min(canvas.height - SOUL.h - 2, SOUL.y));
}

function updateProjectiles() {
    for (var i = projectiles.length - 1; i >= 0; i--) {
        var p = projectiles[i];
        if (p.update) { p.update(p); }
        else { p.x += (p.vx || 0); p.y += (p.vy || 0); }
        if (!p.persistent && (p.x < -100 || p.x > canvas.width + 100 || p.y < -100 || p.y > canvas.height + 100)) {
            projectiles.splice(i, 1); continue;
        }
        if (p.lifetime !== undefined) {
            p.lifetime--;
            if (p.lifetime <= 0) projectiles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (invulnFrames > 0) return;
    var sx = SOUL.x + 3, sy = SOUL.y + 3, sw = SOUL.w - 6, sh = SOUL.h - 6;
    for (var i = 0; i < projectiles.length; i++) {
        var p = projectiles[i];
        if (p.inactive) continue;
        if (p.blue) {
            var moving = keysDown['ArrowLeft'] || keysDown['ArrowRight'] || keysDown['ArrowUp'] || keysDown['ArrowDown'];
            if (!moving) continue;
        }
        if (p.orange) {
            var movingO = keysDown['ArrowLeft'] || keysDown['ArrowRight'] || keysDown['ArrowUp'] || keysDown['ArrowDown'];
            if (movingO) continue;
        }
        var hit = false;
        if (p.shape === 'circle') {
            var pcx = p.x + (p.r || 0), pcy = p.y + (p.r || 0);
            hit = circleRect(pcx, pcy, p.r || 5, sx, sy, sw, sh);
        } else {
            var pw = p.w || 10, ph = p.h || 10;
            hit = sx < p.x + pw && sx + sw > p.x && sy < p.y + ph && sy + sh > p.y;
        }
        if (hit) {
            hitCount++;
            invulnFrames = INVULN_TIME;
            soulFlashFrame = 10;
            playDamageSound();
            break;
        }
    }
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
    var nearX = Math.max(rx, Math.min(cx, rx + rw));
    var nearY = Math.max(ry, Math.min(cy, ry + rh));
    var dx = cx - nearX, dy = cy - nearY;
    return dx * dx + dy * dy < cr * cr;
}

function renderDodge() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < projectiles.length; i++) {
        var p = projectiles[i];
        if (p.inactive && !p.render) continue;
        ctx.save();
        if (p.render) { p.render(ctx, p); }
        else if (p.shape === 'circle') {
            ctx.fillStyle = p.color || '#fff';
            ctx.beginPath();
            ctx.arc(p.x + (p.r || 5), p.y + (p.r || 5), p.r || 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = p.color || '#fff';
            ctx.fillRect(p.x, p.y, p.w || 10, p.h || 10);
        }
        ctx.restore();
    }
    // Draw SOUL
    if (soulFlashFrame > 0) {
        soulFlashFrame--;
        ctx.fillStyle = (soulFlashFrame % 4 < 2) ? '#fff' : SOUL.color;
    } else if (invulnFrames > 0) {
        ctx.fillStyle = (invulnFrames % 6 < 3) ? 'rgba(255,0,0,0.5)' : SOUL.color;
    } else {
        ctx.fillStyle = SOUL.blue ? '#4488ff' : SOUL.color;
    }
    drawHeart(ctx, SOUL.x, SOUL.y, SOUL.w, SOUL.h);
    // Timer bar at top
    var elapsed = performance.now() - dodgeStartTime;
    var pct = Math.min(1, elapsed / dodgeDuration);
    ctx.fillStyle = '#333';
    ctx.fillRect(10, 4, canvas.width - 20, 4);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(10, 4, (canvas.width - 20) * pct, 4);
}

function drawHeart(c, x, y, w, h) {
    var cx = x + w / 2, cy = y + h / 2, s = w / 2;
    c.beginPath();
    c.moveTo(cx, cy + s * 0.7);
    c.bezierCurveTo(cx - s * 1.3, cy - s * 0.2, cx - s * 0.7, cy - s * 1.1, cx, cy - s * 0.4);
    c.bezierCurveTo(cx + s * 0.7, cy - s * 1.1, cx + s * 1.3, cy - s * 0.2, cx, cy + s * 0.7);
    c.fill();
}

function endDodgePhase() {
    if (!dodgeActive) return;
    dodgeActive = false;
    cancelAnimationFrame(dodgeFrameId);
    canvas.style.display = 'none';
    battleText.style.display = 'block';
    dodgeScore = Math.max(0, Math.min(1, 1 - (hitCount / maxExpectedHits)));
    resolveTurn();
}

async function resolveTurn() {
    combatState = COMBAT_STATE.RESOLVE;
    var result = await apiCall('/games/' + gameId + '/attack', 'POST', {
        action: 'fight',
        timingScore: timingScore,
        dodgeScore: dodgeScore
    });
    if (result) {
        var logs = result.logs || [];
        var relevant = logs.slice(-3);
        await typeText('* ' + relevant.join('\n* '));
        await sleep(800);
        updateInterface(result);
    }
    combatState = COMBAT_STATE.MENU;
    setButtonsDisabled(false);
}

// =============================================================================
// TYPEWRITER EFFECT
// =============================================================================
async function typeText(text) {
    battleText.style.display = 'block';
    battleText.innerText = '';
    for (var i = 0; i < text.length; i++) {
        battleText.innerText += text[i];
        if (text[i] !== ' ' && text[i] !== '\n') playBeep(400 + Math.random() * 200, 0.02, 0.04);
        await sleep(25);
    }
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

// =============================================================================
// UI UPDATE
// =============================================================================
function updateInterface(game) {
    currentGameState = game;
    var currentRoomIndex = game.dungeon.findIndex(function(r) { return r.id === game.currentRoomId; });
    var currentRoom = game.dungeon[currentRoomIndex];
    roomName.innerText = 'ROOM ' + (currentRoomIndex + 1) + ': ' + currentRoom.name;
    if (game.logs.length > 0) {
        roomLog.innerText = game.logs[game.logs.length - 1];
    }
    var hpPercent = Math.max(0, game.playerCurrentHP);
    document.getElementById('player-hp').style.width = hpPercent + '%';
    document.getElementById('hp-text').innerText = game.playerCurrentHP + ' / 100';
    var monster = currentRoom.monster;
    var isMonsterAlive = monster && monster.hp > 0;
    if (isMonsterAlive) {
        combatUI.style.display = 'block';
        explorationUI.style.display = 'none';
        document.getElementById('enemy-name-display').innerText = monster.name.toUpperCase();
        if (monster.image) {
            enemySprite.src = monster.image;
            enemySprite.alt = monster.name;
        }
        if (!monsterMaxHP[game.currentRoomId]) monsterMaxHP[game.currentRoomId] = monster.hp;
        var maxHP = monsterMaxHP[game.currentRoomId];
        var monsterHpPercent = (monster.hp / maxHP) * 100;
        document.getElementById('enemy-hp').style.width = Math.max(0, monsterHpPercent) + '%';
        if (combatState === COMBAT_STATE.IDLE || combatState === COMBAT_STATE.MENU) {
            combatState = COMBAT_STATE.MENU;
            setButtonsDisabled(false);
            battleText.innerText = '* ' + monster.name + ' stands before you.';
        }
    } else {
        combatUI.style.display = 'none';
        explorationUI.style.display = 'block';
        combatState = COMBAT_STATE.IDLE;
        if (game.status === 'VICTORY') {
            roomName.innerText = 'VICTORY!';
            document.getElementById('btn-move').style.display = 'none';
            explorationUI.querySelector('p').innerText = '* You won! The underground is saved.';
        }
    }
    if (game.status === 'GAME_OVER') {
        combatState = COMBAT_STATE.IDLE;
        showGameOver();
    }
}

async function showGameOver() {
    battleText.style.display = 'block';
    await typeText('* You cannot give up just yet... Stay determined!');
    await sleep(1500);
    alert('GAME OVER! Refresh to restart.');
    location.reload();
}

// =============================================================================
// MONSTER ATTACK PATTERNS
// =============================================================================
var MONSTER_PATTERNS = {

    'Toriel': {
        dialogue: '* I am sorry, child...',
        duration: 7000,
        maxHits: 15,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            for (var wave = 0; wave < 4; wave++) {
                for (var i = 0; i < 5; i++) {
                    (function(w, idx) {
                        setTimeout(function() {
                            var startX = Math.random() * (W - 20);
                            proj.push({
                                shape: 'circle', r: 8,
                                x: startX, y: -10,
                                vx: 0, vy: 0.7 + Math.random() * 0.3,
                                color: '#fff',
                                update: function(p) {
                                    var dx = p.x - soul.x;
                                    p.vx += (dx > 0 ? 0.015 : -0.015);
                                    p.vx *= 0.98;
                                    p.x += p.vx;
                                    p.y += p.vy;
                                }
                            });
                        }, w * 1600 + idx * 350);
                    })(wave, i);
                }
            }
        }
    },

    'Papyrus': {
        dialogue: '* NYEH HEH HEH!',
        duration: 8000,
        maxHits: 14,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            for (var wave = 0; wave < 5; wave++) {
                (function(w) {
                    setTimeout(function() {
                        var fromLeft = w % 2 === 0;
                        var gapY = 30 + Math.random() * (H - 80);
                        var gapSize = 50;
                        for (var b = 0; b < 6; b++) {
                            var boneY = b * (H / 6);
                            if (Math.abs(boneY - gapY) < gapSize) continue;
                            var isBlue = b % 3 === 0;
                            proj.push({
                                shape: 'rect',
                                x: fromLeft ? -20 : W + 20,
                                y: boneY, w: 10, h: 40,
                                vx: fromLeft ? 1.5 : -1.5, vy: 0,
                                color: isBlue ? '#00ccff' : '#fff',
                                blue: isBlue,
                                render: function(ctx2, p) {
                                    ctx2.fillStyle = p.color;
                                    ctx2.fillRect(p.x, p.y + 5, p.w, p.h - 10);
                                    ctx2.beginPath();
                                    ctx2.arc(p.x + p.w / 2, p.y + 6, 7, 0, Math.PI * 2);
                                    ctx2.arc(p.x + p.w / 2, p.y + p.h - 6, 7, 0, Math.PI * 2);
                                    ctx2.fill();
                                }
                            });
                        }
                    }, w * 1500);
                })(wave);
            }
        }
    },

    'Undyne': {
        dialogue: '* NGAHHH!! FOR EVERYONE!',
        duration: 9000,
        maxHits: 16,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            for (var wave = 0; wave < 5; wave++) {
                var speed = 1.5 + wave * 0.3;
                for (var i = 0; i < 4 + wave; i++) {
                    (function(w, idx, spd) {
                        setTimeout(function() {
                            var targetX = soul.x + (Math.random() - 0.5) * 80;
                            var targetY = soul.y + (Math.random() - 0.5) * 80;
                            var edge = Math.floor(Math.random() * 4);
                            var sx2, sy2;
                            if (edge === 0) { sx2 = Math.random() * W; sy2 = -15; }
                            else if (edge === 1) { sx2 = Math.random() * W; sy2 = H + 15; }
                            else if (edge === 2) { sx2 = -15; sy2 = Math.random() * H; }
                            else { sx2 = W + 15; sy2 = Math.random() * H; }
                            var angle = Math.atan2(targetY - sy2, targetX - sx2);
                            proj.push({
                                shape: 'circle', r: 4,
                                x: sx2, y: sy2, vx: 0, vy: 0,
                                color: '#ffff00', inactive: true,
                                persistent: true, lifetime: 35
                            });
                            setTimeout(function() {
                                proj.push({
                                    shape: 'rect',
                                    x: sx2, y: sy2, w: 6, h: 24,
                                    vx: Math.cos(angle) * spd,
                                    vy: Math.sin(angle) * spd,
                                    color: '#ffff00',
                                    _angle: angle,
                                    render: function(ctx2, p) {
                                        ctx2.save();
                                        ctx2.translate(p.x + 3, p.y + 12);
                                        ctx2.rotate(p._angle);
                                        ctx2.fillStyle = '#ffff00';
                                        ctx2.beginPath();
                                        ctx2.moveTo(-3, 12);
                                        ctx2.lineTo(3, 12);
                                        ctx2.lineTo(0, -14);
                                        ctx2.closePath();
                                        ctx2.fill();
                                        ctx2.fillRect(-1.5, 4, 3, 16);
                                        ctx2.restore();
                                    }
                                });
                            }, 600);
                        }, w * 1600 + idx * 300);
                    })(wave, i, speed);
                }
            }
        }
    },

    'Muffet': {
        dialogue: '* Ahuhuhu~ Don\'t look so blue, dearie~',
        duration: 9000,
        maxHits: 16,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            var lanes = [H * 0.25, H * 0.5, H * 0.75];
            proj.push({ shape: 'rect', x: 0, y: H * 0.33 - 1, w: W, h: 2, vx: 0, vy: 0, color: 'rgba(153,51,255,0.25)', inactive: true, persistent: true, lifetime: 540 });
            proj.push({ shape: 'rect', x: 0, y: H * 0.66 - 1, w: W, h: 2, vx: 0, vy: 0, color: 'rgba(153,51,255,0.25)', inactive: true, persistent: true, lifetime: 540 });
            for (var wave = 0; wave < 5; wave++) {
                for (var i = 0; i < 4 + wave; i++) {
                    (function(w, idx) {
                        setTimeout(function() {
                            var lane = lanes[Math.floor(Math.random() * lanes.length)];
                            var fromLeft = Math.random() > 0.5;
                            var basePhase = Math.random() * Math.PI * 2;
                            proj.push({
                                shape: 'circle', r: 5,
                                x: fromLeft ? -10 : W + 10, y: lane,
                                vx: fromLeft ? 1.3 : -1.3, vy: 0,
                                color: '#cc66ff',
                                _baseY: lane, _phase: basePhase, _amp: 25 + Math.random() * 15,
                                update: function(p) {
                                    p.x += p.vx;
                                    p._phase += 0.04;
                                    p.y = p._baseY + Math.sin(p._phase) * p._amp;
                                }
                            });
                        }, w * 1600 + idx * 300);
                    })(wave, i);
                }
            }
        }
    },

    'Asgore Dreemurr': {
        dialogue: '* Human... It was nice to meet you. Goodbye.',
        duration: 10000,
        maxHits: 18,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            for (var wave = 0; wave < 6; wave++) {
                (function(w) {
                    setTimeout(function() {
                        var isOrange = w % 2 === 0;
                        for (var i = 0; i < 5; i++) {
                            (function(idx) {
                                setTimeout(function() {
                                    proj.push({
                                        shape: 'circle', r: 10,
                                        x: 30 + Math.random() * (W - 60), y: -15,
                                        vx: (Math.random() - 0.5) * 0.8,
                                        vy: 1.0 + Math.random() * 0.5,
                                        color: isOrange ? '#ff8800' : '#00aaff',
                                        orange: isOrange,
                                        blue: !isOrange
                                    });
                                }, idx * 250);
                            })(i);
                        }
                        if (w >= 2) {
                            setTimeout(function() {
                                var sweepY = Math.random() > 0.5 ? -5 : H + 5;
                                var sweepDir = sweepY < 0 ? 0.9 : -0.9;
                                proj.push({
                                    shape: 'rect', x: 30, y: sweepY, w: W - 60, h: 6,
                                    vx: 0, vy: sweepDir, color: '#ff4444'
                                });
                            }, 600);
                        }
                    }, w * 1500);
                })(wave);
            }
        }
    },

    'Asriel Dreemurr': {
        dialogue: '* I will absorb every SOUL!',
        duration: 12000,
        maxHits: 20,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            var centerX = W / 2, centerY = H / 2;
            for (var wave = 0; wave < 6; wave++) {
                (function(w) {
                    setTimeout(function() {
                        var numStars = 8 + w * 2;
                        for (var i = 0; i < numStars; i++) {
                            (function(idx) {
                                setTimeout(function() {
                                    var angle = (idx / numStars) * Math.PI * 2 + w * 0.5;
                                    var spd = 1.2 + w * 0.2;
                                    var hue = (idx * 40 + w * 90) % 360;
                                    proj.push({
                                        shape: 'rect',
                                        x: centerX - 5, y: centerY - 5,
                                        w: 10, h: 10,
                                        vx: Math.cos(angle) * spd,
                                        vy: Math.sin(angle) * spd,
                                        color: 'hsl(' + hue + ', 100%, 65%)',
                                        _angle: angle,
                                        render: function(ctx2, p) {
                                            ctx2.save();
                                            ctx2.translate(p.x + 5, p.y + 5);
                                            p._angle += 0.06;
                                            ctx2.rotate(p._angle);
                                            ctx2.fillStyle = p.color;
                                            ctx2.fillRect(-5, -5, 10, 10);
                                            ctx2.restore();
                                        }
                                    });
                                }, idx * 70);
                            })(i);
                        }
                    }, w * 1800);
                })(wave);
            }
            for (var l = 0; l < 5; l++) {
                (function(li) {
                    setTimeout(function() {
                        var lx = Math.random() > 0.5 ? -10 : W + 10;
                        var lvx = lx < 0 ? 1.2 : -1.2;
                        proj.push({
                            shape: 'rect', x: lx, y: 0, w: 20, h: H,
                            vx: lvx, vy: 0, color: '#ffff44',
                            render: function(ctx2, p) {
                                ctx2.strokeStyle = '#ffff44';
                                ctx2.lineWidth = 3;
                                ctx2.beginPath();
                                var py = 0;
                                ctx2.moveTo(p.x, py);
                                while (py < H) {
                                    py += 15 + Math.random() * 10;
                                    var zx = p.x + (Math.random() > 0.5 ? 12 : -12);
                                    ctx2.lineTo(zx, py);
                                }
                                ctx2.stroke();
                            }
                        });
                    }, 2000 + li * 2000);
                })(l);
            }
        }
    },

    'Sans': {
        dialogue: "* it's a beautiful day outside...",
        duration: 18000,
        maxHits: 28,
        blueMode: true,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;

            // Phase 1: Bone walls with jump gaps (0s - 10s) — 14 walls, slow speed
            for (var i = 0; i < 14; i++) {
                (function(idx) {
                    setTimeout(function() {
                        var fromLeft = idx % 2 === 0;
                        var gapBottom = 25 + Math.random() * 45;
                        proj.push({
                            shape: 'rect',
                            x: fromLeft ? -20 : W + 20, y: 0,
                            w: 12, h: H - gapBottom - 45,
                            vx: fromLeft ? 2.0 : -2.0, vy: 0,
                            color: '#fff',
                            render: function(ctx2, p) {
                                ctx2.fillStyle = '#fff';
                                ctx2.fillRect(p.x, p.y, p.w, p.h);
                                ctx2.beginPath();
                                ctx2.arc(p.x + p.w / 2, p.y + p.h, 8, 0, Math.PI * 2);
                                ctx2.fill();
                            }
                        });
                        var bottomH = gapBottom;
                        if (bottomH > 15) {
                            proj.push({
                                shape: 'rect',
                                x: fromLeft ? -20 : W + 20, y: H - bottomH,
                                w: 12, h: bottomH,
                                vx: fromLeft ? 2.0 : -2.0, vy: 0,
                                color: '#fff',
                                render: function(ctx2, p) {
                                    ctx2.fillStyle = '#fff';
                                    ctx2.fillRect(p.x, p.y, p.w, p.h);
                                    ctx2.beginPath();
                                    ctx2.arc(p.x + p.w / 2, p.y, 8, 0, Math.PI * 2);
                                    ctx2.fill();
                                }
                            });
                        }
                    }, 500 + idx * 700);
                })(i);
            }

            // Phase 2: Floor bones rising up (4s - 10s) — 10 bones, slow rise
            for (var j = 0; j < 10; j++) {
                (function(idx) {
                    setTimeout(function() {
                        var boneX = 40 + Math.random() * (W - 80);
                        var boneH = 30 + Math.random() * 50;
                        proj.push({
                            shape: 'rect',
                            x: boneX, y: H + 10,
                            w: 10, h: boneH,
                            vx: 0, vy: -1.8,
                            color: '#fff',
                            _stopY: H - boneH,
                            _timer: 0,
                            update: function(p) {
                                if (p.y > p._stopY) {
                                    p.y += p.vy;
                                } else {
                                    p.y = p._stopY;
                                    p.vy = 0;
                                    p._timer++;
                                    if (p._timer > 80) {
                                        p.vy = 2.5;
                                        p.y += p.vy;
                                    }
                                }
                            },
                            render: function(ctx2, p) {
                                ctx2.fillStyle = '#fff';
                                ctx2.fillRect(p.x, p.y, p.w, p.h);
                                ctx2.beginPath();
                                ctx2.arc(p.x + p.w / 2, p.y, 7, 0, Math.PI * 2);
                                ctx2.fill();
                            }
                        });
                    }, 4000 + idx * 600);
                })(j);
            }

            // Phase 3: Gaster Blasters (8s - 14s) — 5 blasters, slow charge
            for (var b = 0; b < 5; b++) {
                (function(bi) {
                    setTimeout(function() {
                        var horizontal = bi % 2 === 0;
                        var bx = horizontal ? (Math.random() > 0.5 ? -30 : W + 10) : 30 + Math.random() * (W - 60);
                        var by = horizontal ? (30 + Math.random() * (H - 60)) : (Math.random() > 0.5 ? -30 : H + 10);
                        proj.push({
                            shape: 'circle', r: 15,
                            x: bx, y: by, vx: 0, vy: 0,
                            color: '#ffff00', inactive: true,
                            persistent: true, lifetime: 50,
                            _charge: 0,
                            render: function(ctx2, p) {
                                p._charge += 0.04;
                                var glow = Math.min(1, p._charge) * 15 + 5;
                                ctx2.fillStyle = '#fff';
                                ctx2.beginPath();
                                ctx2.arc(p.x + 15, p.y + 15, glow, 0, Math.PI * 2);
                                ctx2.fill();
                                ctx2.fillStyle = 'rgba(255,255,0,0.5)';
                                ctx2.beginPath();
                                ctx2.arc(p.x + 15, p.y + 15, glow + 5, 0, Math.PI * 2);
                                ctx2.fill();
                            }
                        });
                        setTimeout(function() {
                            if (horizontal) {
                                proj.push({
                                    shape: 'rect', x: 0, y: by - 15,
                                    w: W, h: 30, vx: 0, vy: 0,
                                    color: '#ffffff', lifetime: 30,
                                    render: function(ctx2, p) {
                                        var grad = ctx2.createLinearGradient(0, p.y, 0, p.y + p.h);
                                        grad.addColorStop(0, 'rgba(255,255,255,0)');
                                        grad.addColorStop(0.3, '#ffffff');
                                        grad.addColorStop(0.7, '#ffffff');
                                        grad.addColorStop(1, 'rgba(255,255,255,0)');
                                        ctx2.fillStyle = grad;
                                        ctx2.fillRect(p.x, p.y, p.w, p.h);
                                    }
                                });
                            } else {
                                proj.push({
                                    shape: 'rect', x: bx - 15, y: 0,
                                    w: 30, h: H, vx: 0, vy: 0,
                                    color: '#ffffff', lifetime: 30,
                                    render: function(ctx2, p) {
                                        var grad = ctx2.createLinearGradient(p.x, 0, p.x + p.w, 0);
                                        grad.addColorStop(0, 'rgba(255,255,255,0)');
                                        grad.addColorStop(0.3, '#ffffff');
                                        grad.addColorStop(0.7, '#ffffff');
                                        grad.addColorStop(1, 'rgba(255,255,255,0)');
                                        ctx2.fillStyle = grad;
                                        ctx2.fillRect(p.x, p.y, p.w, p.h);
                                    }
                                });
                            }
                            playBeep(100, 0.3, 0.3);
                        }, 800);
                    }, 8000 + bi * 1200);
                })(b);
            }

            // Phase 4: Bone barrage from all sides (13s - 17s) — 20 bones, moderate speed
            for (var k = 0; k < 20; k++) {
                (function(idx) {
                    setTimeout(function() {
                        var edge = Math.floor(Math.random() * 4);
                        var bx2, by2, bvx, bvy, bw, bh;
                        if (edge === 0) { bx2 = Math.random() * W; by2 = -10; bvx = 0; bvy = 2.5; bw = 8; bh = 30; }
                        else if (edge === 1) { bx2 = Math.random() * W; by2 = H + 10; bvx = 0; bvy = -2.5; bw = 8; bh = 30; }
                        else if (edge === 2) { bx2 = -10; by2 = Math.random() * H; bvx = 2.5; bvy = 0; bw = 30; bh = 8; }
                        else { bx2 = W + 10; by2 = Math.random() * H; bvx = -2.5; bvy = 0; bw = 30; bh = 8; }
                        proj.push({
                            shape: 'rect', x: bx2, y: by2, w: bw, h: bh,
                            vx: bvx, vy: bvy, color: '#fff'
                        });
                    }, 13000 + idx * 200);
                })(k);
            }

            // Phase 5: Blue bone walls mixed with normal (15s - 18s) — must stay still for blue
            for (var m = 0; m < 6; m++) {
                (function(mi) {
                    setTimeout(function() {
                        var fromL = mi % 2 === 0;
                        var isBlue = mi % 3 === 0;
                        var gapB = 30 + Math.random() * 40;
                        proj.push({
                            shape: 'rect',
                            x: fromL ? -20 : W + 20, y: 0,
                            w: 12, h: H - gapB - 40,
                            vx: fromL ? 1.8 : -1.8, vy: 0,
                            color: isBlue ? '#00ccff' : '#fff',
                            blue: isBlue,
                            render: function(ctx2, p) {
                                ctx2.fillStyle = p.color;
                                ctx2.fillRect(p.x, p.y, p.w, p.h);
                                ctx2.beginPath();
                                ctx2.arc(p.x + p.w / 2, p.y + p.h, 8, 0, Math.PI * 2);
                                ctx2.fill();
                            }
                        });
                    }, 15000 + mi * 500);
                })(m);
            }
        }
    },

    'default': {
        dialogue: '* ...',
        duration: 6000,
        maxHits: 10,
        run: function(cv, proj, soul) {
            var W = cv.width, H = cv.height;
            for (var i = 0; i < 12; i++) {
                (function(idx) {
                    setTimeout(function() {
                        proj.push({
                            shape: 'circle', r: 6,
                            x: Math.random() * W, y: -10,
                            vx: (Math.random() - 0.5) * 1.2, vy: 0.8 + Math.random() * 0.5,
                            color: '#fff'
                        });
                    }, idx * 450);
                })(i);
            }
        }
    }
};

canvas.style.display = 'none';
