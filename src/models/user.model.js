const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./task.model');

//setup user schema
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid!');
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 24,
        },
        age: {
            type: Number,
            default: 1,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a positive number!');
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

//create function generate token
userSchema.methods.generateToken = async function () {
    const user = this;

    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Email or password is incorrect');
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Email or password is incorrect');
    }

    return user;
};

// hash password previous save to mongodb
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8);
    }

    next();
});

//delete task of user previous delete user
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

//edit user previous response
userSchema.methods.toJSON = function () {
    const user = this;

    const userDup = user.toObject();

    delete userDup.password;
    delete userDup.tokens;
    delete userDup.avatar;

    return userDup;
};

//create User model
const User = mongoose.model('User', userSchema);

//export User
module.exports = User;
