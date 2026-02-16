const generateId = require('./generateId');

const buildDungeon = (monsters) => {
    const cloneMonster = (m) => {
        if (!m) return null;
        return {
            name: m.name,
            hp: m.hp,
            atk: m.atk,
            xp: m.xp,
            image: m.image
        };
    };

    const find = (name) => monsters.find(m => m.name === name);

    const rooms = [
        { id: generateId(), name: "Ruins - Home", monster: cloneMonster(find('Toriel')) },
        { id: generateId(), name: "Snowdin - Bridge", monster: cloneMonster(find('Papyrus')) },
        { id: generateId(), name: "Waterfall - Bridge", monster: cloneMonster(find('Undyne')) },
        { id: generateId(), name: "Hotland - Spider Bakery", monster: cloneMonster(find('Muffet')) },
        { id: generateId(), name: "Barrier", monster: cloneMonster(find('Asgore Dreemurr')) },
        { id: generateId(), name: "True Lab", monster: cloneMonster(find('Asriel Dreemurr')) },
        { id: generateId(), name: "Last Corridor", monster: cloneMonster(find('Sans')) },
    ];

    return rooms;
};

module.exports = { buildDungeon };
