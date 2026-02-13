
const store = require('../data/store'); 
const generateId = require('../utils/generateId');

module.exports = {
    
    findAll: () => store.players,

   
    create: (name) => {
        const newPlayer = {
            id: generateId(),
            name: name,
            hp: 100,
            attack: 25,
            level: 1
        };
        store.players.push(newPlayer); 
        return newPlayer;
    },
    
  
    findById: (id) => store.players.find(p => p.id === id)
};