const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task.model');

const router = new express.Router();

//create a task
router.post('/', auth, async (req, res) => {
    const newTask = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await newTask.save();
        res.status(201).send(newTask);
    } catch (err) {
        res.status(400).send();
    }
});

//read a task
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(400).send({ error: 'Cannot find task!' });
        }

        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

//read all tasks of user
router.get('/', auth, async (req, res) => {
    try {
        await req.user
            .populate({
                path: 'tasks',
            })
            .execPopulate();
        res.send(req.user.tasks);
    } catch (err) {
        res.status(500).send();
    }
});

//edit many tasks
router.patch('/many', auth, async (req, res) => {
    //check update property valid
    const updateTasks = req.body;
    const allowedProperties = ['taskName', 'description', 'completed', 'date'];
    const isValid = updateTasks.every((obj) => {
        return Object.keys(obj).every((property) => {
            return property === 'id' || allowedProperties.includes(property);
        });
    });
    if (!isValid) {
        return res.status(400).send({ error: 'Updates invalid' });
    }

    let flag = true;

    try {
        //find task and update
        for (let update of updateTasks) {
            const task = await Task.findOne({
                _id: update.id,
                owner: req.user._id,
            });
            if (!task) {
                flag = false;
                break;
            }
            Object.keys(update).forEach(
                (property) => (task[property] = update[property]),
            );

            await task.save();
        }
        if (!flag) {
            res.status(404).send({ error: 'Cannot find tasks' });
        } else {
            res.send();
        }
    } catch (err) {
        res.status(500).send();
    }
});

//edit a task
router.patch('/:id', auth, async (req, res) => {
    //check update valid
    const updateProperties = Object.keys(req.body);
    const allowedProperties = ['taskName', 'description', 'completed', 'date'];
    const isValid = updateProperties.every((property) =>
        allowedProperties.includes(property),
    );
    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        //find task
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(404).send({ error: 'Cannot find task!' });
        }

        updateProperties.forEach(
            (property) => (task[property] = req.body[property]),
        );

        await task.save();
        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

//delete many task
router.delete('/many', auth, async (req, res) => {
    try {
        let flag = true;
        //find task and remove
        for (let id of req.body) {
            const task = await Task.findOne({ _id: id, owner: req.user._id });
            if (!task) {
                flag = false;
                break;
            }
            await task.remove();
        }
        if (!flag) {
            res.status(404).send({ error: 'Cannot find task' });
        } else {
            res.send();
        }
    } catch (err) {
        res.status(500).send();
    }
});

//delete all task
router.delete('/all', auth, async (req, res) => {
    try {
        await Task.deleteMany({ owner: req.user._id });
        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

//delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(404).send({ error: 'Cannot find task' });
        }
        await task.remove();
        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

module.exports = router;
