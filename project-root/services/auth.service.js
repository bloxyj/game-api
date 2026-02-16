const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt');


// Check if user already exists
exports.register = async (username, email, password) => {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        const err = new Error('Username or email already taken');
        err.status = 409;
        throw err;
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);
    return {
        token,
        user: user.toJSON()
    };
};

exports.login = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        const err = new Error('Invalid username or password');
        err.status = 401;
        throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error('Invalid username or password');
        err.status = 401;
        throw err;
    }

    const token = generateToken(user._id);
    return {
        token,
        user: user.toJSON()
    };
};
