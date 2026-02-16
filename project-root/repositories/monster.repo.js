const Monster = require('../models/Monster.model');

module.exports = {
    findAll: async () => {
        return Monster.find();
    },

    findById: async (id) => {
        return Monster.findById(id);
    },

    create: async (data) => {
        const monster = new Monster(data);
        return monster.save();
    },

    updateById: async (id, data) => {
        return Monster.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    deleteById: async (id) => {
        return Monster.findByIdAndDelete(id);
    }
};
