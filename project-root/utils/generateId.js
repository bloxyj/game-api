let currantId = 0;
function generateId(){ 
    return (currantId++).toString();
}

module.exports = generateId;