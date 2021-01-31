const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task.model');

const router = new express.Router();

//create a task
router.post('/', auth, async (req, res) => {
    try {
        const range = Task.generateRangeProperty(req.body.date);

        if (!range) {
            return res
                .status(400)
                .send({ message: 'The end time must be after the start time' });
        }

        const data = { ...req.body, range, owner: req.user._id };
        const newTask = new Task(data);

        await newTask.save();
        res.status(201).send(newTask);
    } catch (err) {
        res.status(400).send(err);
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
            return res.status(400).send({ message: 'Cannot find task!' });
        }

        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

//read all tasks of user
//Filter: ?completed=false
//Pagination: ?limit=0&skip=0
//Sort: ?sortBy=[field]:(desc|asc) //field: createdAt|priority|grade // descending = reduce, ascending = increase
router.get('/', auth, async (req, res) => {
    const match = {};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1].toString() === 'desc' ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: 'tasks',
                match,
                options: {
                    limit: +req.query.limit,
                    skip: +req.query.skip,
                    sort,
                },
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
    const allowedProperties = [
        'taskName',
        'description',
        'completed',
        'date',
        'grade',
        'priority',
    ];
    const isValid = updateTasks.every((obj) => {
        if (obj.date && obj.date.startAt && obj.date.endAt) {
            return obj.date.endAt > obj.date.startAt;
        }
        return Object.keys(obj).every((property) => {
            return property === 'id' || allowedProperties.includes(property);
        });
    });
    if (!isValid) {
        return res.status(400).send({ message: 'Updates invalid' });
    }

    let flag = true;
    let idTaskNotFind;
    const tasksFound = [];

    try {
        //check idTask
        for (let update of updateTasks) {
            const task = await Task.findOne({
                _id: update.id,
                owner: req.user._id,
            });
            if (!task) {
                idTaskNotFind = update.id;
                flag = false;
                break;
            }
            tasksFound.push(task);
        }

        if (!flag) {
            res.status(404).send({
                message: `Cannot find task has id: ${idTaskNotFind}`,
            });
        } else {
            //find and update task
            for (let update of updateTasks) {
                const task = tasksFound.find(
                    (task) => update.id === task._id.toString(),
                );
                Object.keys(update).forEach((property) => {
                    if (property === 'date') {
                        const range = Task.generateRangeProperty(
                            req.body[property],
                        );
                        if (range) {
                            task.range = range;
                        }

                        task[property] = update[property];
                    } else {
                        task[property] = update[property];
                    }
                });

                await task.save();
            }
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
    const allowedProperties = [
        'taskName',
        'description',
        'completed',
        'date',
        'grade',
        'priority',
    ];
    const isValid = updateProperties.every((property) =>
        allowedProperties.includes(property),
    );
    if (!isValid) {
        return res.status(400).send({ message: 'Invalid updates' });
    }

    try {
        //find task
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(404).send({ message: 'Cannot find task!' });
        }

        updateProperties.forEach((property) => {
            if (property === 'date') {
                const range = Task.generateRangeProperty(req.body[property]);

                if (!range) {
                    return res.status(400).send({
                        message: 'The end time must be after the start time',
                    });
                }

                task.range = range;
                task.date = req.body.date;
            } else {
                task[property] = req.body[property];
            }
        });

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
        let idTaskNotFind;
        const tasksFound = [];
        //check isTask
        for (let id of req.body) {
            const task = await Task.findOne({ _id: id, owner: req.user._id });
            if (!task) {
                idTaskNotFind = id;
                flag = false;
                break;
            }
            tasksFound.push(task);
        }
        if (!flag) {
            res.status(404).send({
                message: `Cannot find task has id: ${idTaskNotFind}`,
            });
        } else {
            //find task and remove
            for (let id of req.body) {
                const task = tasksFound.find(
                    (task) => task._id.toString() === id,
                );
                if (!task) {
                    flag = false;
                    break;
                }
                await task.remove();
            }
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
            return res.status(404).send({ message: 'Cannot find task' });
        }
        await task.remove();
        res.send(task);
    } catch (err) {
        res.status(500).send();
    }
});

module.exports = router;
