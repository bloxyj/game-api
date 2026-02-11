const currantId = require('../utils/generateId');

const monster_information = [{
    id:currantId(),
    PV: 100,
    ATK: 24,
    Type: "Wind Feary Shiny",
},
{
    id:currantId(),
    PV: 150,
    ATK: 42,
    Type: "King Skeleton BOSS",  
}
]

module.exports= monster_information;
