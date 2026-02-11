const generateId = require('../utils/generateId');

const monster_information = [{
    id:generateId(),
    PV: 100,
    ATK: 24,
    Type: "Wind Feary Shiny",
},
{
    id:generateId(),
    PV: 150,
    ATK: 42,
    Type: "King Skeleton BOSS",  
}
]

module.exports= monster_information;
