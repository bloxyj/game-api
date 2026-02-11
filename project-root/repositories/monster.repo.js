const monsters = [
    { id: 1, name: "Gobelin", hp: 50, attack: 10 },
    { id: 2, name: "Dragon", hp: 200, attack: 50 }
];

module.exports = {
    getAll: () => monsters,
    getById: (id) => monsters.find(m => m.id === id)
};