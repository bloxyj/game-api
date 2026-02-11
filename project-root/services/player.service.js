module.exports = {
    getAttackPower: () => {
        return Math.floor(Math.random() * 15) + 10;
    },
    getDefenseMultiplier: () => 0.5 
};