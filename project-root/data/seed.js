const Monster = require('../models/Monster.model');

const defaultMonsters = [
    { name: "Wind Fairy", hp: 50, atk: 10, xp: 10 },
    { name: "Sans (Boss)", hp: 150, atk: 42, xp: 50 }
];

const seedMonsters = async () => {
    try {
        const count = await Monster.countDocuments();
        if (count === 0) {
            await Monster.insertMany(defaultMonsters);
            console.log('Default monsters seeded into database');
        } else {
            console.log(`Monsters already exist (${count} found), skipping seed`);
        }
    } catch (error) {
        console.error('Error seeding monsters:', error.message);
    }
};

module.exports = seedMonsters;
