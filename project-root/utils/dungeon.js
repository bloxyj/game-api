// utils/dungeon.js
// Generates a 5-room dungeon with deep-cloned monster instances

const buildDungeon = (monsters) => {
    // monsters is an array of monster documents from DB
    // We deep-clone them so combat doesn't mutate the originals
    const fairy = monsters.find(m => m.name === 'Wind Fairy');
    const boss = monsters.find(m => m.name === 'Sans (Boss)');

    const cloneMonster = (m) => {
        if (!m) return null;
        return {
            name: m.name,
            hp: m.hp,
            atk: m.atk,
            xp: m.xp
        };
    };

    return [
        { id: 1, name: "Entrée sombre", monster: null },
        { id: 2, name: "Couloir humide", monster: cloneMonster(fairy) },
        { id: 3, name: "Armurerie vide", monster: null },
        { id: 4, name: "Antre du Boss", monster: cloneMonster(boss) },
        { id: 5, name: "Salle du trésor", monster: null, isExit: true }
    ];
};

module.exports = { buildDungeon };
