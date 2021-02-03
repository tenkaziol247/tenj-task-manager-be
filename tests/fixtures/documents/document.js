const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const User = require('../../../src/models/user.model');
const Task = require('../../../src/models/task.model');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    email: 'loizaknet@gmail.com',
    password: 'toilaloizaknet',
    name: 'Loizaknet',
    age: 24,
    tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }],
};

const userTwoId = new mongoose.Types.ObjectId();

const buffer = fs.readFileSync('tests/fixtures/image/lonely.jpg');

const userTwo = {
    _id: userTwoId,
    email: 'tenj@gmail.com',
    password: 'toilatenj',
    name: 'TenJ',
    age: 25,
    avatar: buffer,
    tokens: [{ token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET) }],
};

const userThreeId = new mongoose.Types.ObjectId();

const userThree = {
    _id: userThreeId,
    email: 'user3@gmail.com',
    password: 'user123',
    name: 'TenJ',
    age: 26,
    tokens: [{ token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET) }],
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Clean the table',
    description: 'Today i will clean the table',
    completed: true,
    grade: 'b',
    priority: 'b',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userOne._id,
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Wipe the floor',
    description: 'Tomorrow i will clean the table',
    completed: false,
    grade: 'a',
    priority: 'c',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userOne._id,
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Make the bed',
    description: 'Today i will make the bed',
    completed: true,
    grade: 'b',
    priority: 'c',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userTwo._id,
};

const taskFour = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Go to school',
    description: 'Tonight i will go to school',
    completed: false,
    grade: 'c',
    priority: 'b',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userTwo._id,
};

const taskFive = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Take care yard',
    description: 'Afternoon i will get rid of weed',
    completed: false,
    grade: 'c',
    priority: 'a',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userOne._id,
};

const taskSix = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Clean the body:))',
    description: 'Afternoon i will bath',
    completed: true,
    grade: 'b',
    priority: 'b',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userOne._id,
};

const taskSeven = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Task 7 User 3',
    description: 'Afternoon i will bath',
    completed: true,
    grade: 'b',
    priority: 'b',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userThree._id,
};

const taskEight = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Task 8 User 3',
    description: 'Afternoon i will bath',
    completed: true,
    grade: 'b',
    priority: 'b',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userThree._id,
};

const taskNine = {
    _id: new mongoose.Types.ObjectId(),
    taskName: 'Task 9 User 3',
    description: 'Afternoon i will bath',
    completed: false,
    grade: 'b',
    priority: 'b',
    date: {
        startAt: new Date(),
        endAt: new Date(),
    },
    range: 'day',
    owner: userThree._id,
};

const setupBeforeTest = async () => {
    //teardown data
    await User.deleteMany();
    await Task.deleteMany();

    //create new data
    await new User(userOne).save();
    await new User(userTwo).save();
    await new User(userThree).save();

    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
    await new Task(taskFour).save();
    await new Task(taskFive).save();
    await new Task(taskSix).save();
    await new Task(taskSeven).save();
    await new Task(taskEight).save();
    await new Task(taskNine).save();
};

module.exports = {
    userOneId,
    userTwoId,
    userThreeId,
    userOne,
    userTwo,
    userThree,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    taskFive,
    taskSix,
    taskSeven,
    taskEight,
    taskNine,
    setupBeforeTest,
};
