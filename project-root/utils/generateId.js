let currentId = 1; // we the best

module.exports = (seed) => {
    if (seed !== undefined && seed !== null) {
        return seed.toString();
    }
    return (currentId++).toString();
};
