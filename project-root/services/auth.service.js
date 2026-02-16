const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt');

exports.register = async (username, email, password) => {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new Error('Username or email already taken');
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);
    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    };
};

exports.login = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid username or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid username or password');
    }

    const token = generateToken(user._id);
    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    };
};
