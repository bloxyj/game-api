const Monster = require('../models/Monster.model');
const generateId = require('../utils/generateId');

const defaultMonsters = [
    // Ruins
    { _id: generateId(), name: "Toriel", hp: 90, atk: 8, xp: 150, zone: "Ruins", image: "/assets/Toriel_battle.webp" },

    // Snowdin
    { _id: generateId(), name: "Papyrus", hp: 110, atk: 10, xp: 200, zone: "Snowdin", image: "/assets/Papyrus_battle.webp" },

    // Waterfall
    { _id: generateId(), name: "Undyne", hp: 140, atk: 13, xp: 260, zone: "Waterfall", image: "/assets/Undyne_battle_armor.webp" },

    // Hotland / Core
    { _id: generateId(), name: "Muffet", hp: 160, atk: 15, xp: 320, zone: "Hotland", image: "/assets/Muffet_battle_idle.webp" },

    // New Home / Endgame
    { _id: generateId(), name: "Asgore Dreemurr", hp: 200, atk: 18, xp: 420, zone: "New Home", image: "/assets/Asgore_Dreemurr_battle_idle.webp" },

    // True Pacifist Final Boss
    { _id: generateId(), name: "Asriel Dreemurr", hp: 230, atk: 20, xp: 500, zone: "True Lab", image: "/assets/Asriel_Dreemurr_battle_final_form.webp" },

    // Genocide Final Boss
    { _id: generateId(), name: "Sans", hp: 80, atk: 24, xp: 600, zone: "Last Corridor", image: "/assets/Sans_battle_idle.webp" }
];

const seedMonsters = async () => {
    try {
        const count = await Monster.countDocuments();
        if (count === 0) {
            await Monster.insertMany(defaultMonsters);
            console.log('Default monsters seeded into database');
        } else {
            const monstersWithoutId = await Monster.find({
                $or: [
                    { _id: { $exists: false } },
                    { _id: null },
                    { _id: '' }
                ]
            });

            if (monstersWithoutId.length > 0) {
                await Promise.all(monstersWithoutId.map(async (monster) => {
                    monster._id = generateId();
                    await monster.save();
                }));
                console.log(`Backfilled id for ${monstersWithoutId.length} existing monster(s)`);
            }

            console.log(`Monsters already exist (${count} found), skipping seed`);
        }
    } catch (error) {
        console.error('Error seeding monsters:', error.message);
    }
};

module.exports = seedMonsters;
