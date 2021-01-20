const request = require('supertest');
const app = require('../src/app');

const Task = require('../src/models/task.model');

const {
    userOneId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    taskFive,
    taskSix,
    setupBeforeTest,
} = require('./fixtures/documents/document');

beforeEach(setupBeforeTest);

test('Should create a new task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            taskName: 'Task 5',
            description: 'Task 5 description',
            completed: true,
        })
        .expect(201);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.taskName).toBe('Task 5');
    expect(task.description).toBe('Task 5 description');
    expect(task.completed).toBe(true);
});

test('Should create task failure', async () => {
    //bad token
    await request(app)
        .post('/tasks')
        .send({
            taskName: 'Task 5',
            description: 'Task 5 description',
            completed: true,
        })
        .expect(401);

    //invalid update
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Task 5',
            description: 'Task 5 description',
            completed: true,
        })
        .expect(400);
});

test('Should get a task success', async () => {
    const response = await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(200);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.taskName).toBe(taskThree.taskName);
    expect(task.description).toBe(taskThree.description);
    expect(task.completed).toBe(taskThree.completed);
});

test('Get a task failure', async () => {
    //bad token
    await request(app).get(`/tasks/${taskThree._id}`).expect(401);

    //bad id task
    await request(app)
        .get(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(400);
});

test('Should get all task of user success', async () => {
    const response = await request(app)
        .get(`/tasks`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(200);
    const tasks = response.body;
    expect(tasks.length).toBe(2);
});

test('Get all task of user failure', async () => {
    //bad token
    await request(app).get(`/tasks`).expect(401);
});

test('Update many task of user success', async () => {
    await request(app)
        .patch('/tasks/many')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send([
            {
                id: taskOne._id,
                taskName: 'Update task one',
            },
            {
                id: taskTwo._id,
                description: 'Description update task two',
            },
        ])
        .expect(200);
    //check updated
    const taskOneUpdated = await Task.findById(taskOne._id);
    const taskTwoUpdated = await Task.findById(taskTwo._id);
    expect(taskOneUpdated.taskName).toBe('Update task one');
    expect(taskTwoUpdated.description).toBe('Description update task two');
});

test('Updated many task of user invalid', async () => {
    //bad token
    await request(app)
        .patch('/tasks/many')
        .send([
            {
                id: taskOne._id,
                taskName: 'Update task one',
            },
            {
                id: taskTwo._id,
                description: 'Description update task two',
            },
        ])
        .expect(401);

    //bad id task
    await request(app)
        .patch('/tasks/many')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send([
            {
                id: taskThree._id,
                taskName: 'Update task one',
            },
            {
                id: taskTwo._id,
                description: 'Description update task two',
            },
        ])
        .expect(404);

    //invalid updates
    await request(app)
        .patch('/tasks/many')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send([
            {
                id: taskOne._id,
                name: 'Update task one',
            },
            {
                id: taskTwo._id,
                description: 'Description update task two',
            },
        ])
        .expect(400);
});

test('Update a task of user success', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            taskName: 'Update task three',
            description: 'Description update task three',
        })
        .expect(200);
    const taskUpdated = await Task.findById(response.body._id);
    expect(taskUpdated.taskName).toBe('Update task three');
    expect(taskUpdated.description).toBe('Description update task three');
});

test('Update a task of user failure', async () => {
    //bad token
    await request(app)
        .patch(`/tasks/${taskFour._id}`)
        .send({
            taskName: 'Update task four',
            description: 'Description update task four',
        })
        .expect(401);

    //bad id task
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            taskName: 'Update task three',
            description: 'Description update task three',
        })
        .expect(404);

    //invalid update
    await request(app)
        .patch(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            name: 'Update task three',
            description: 'Description update task three',
        })
        .expect(400);
});

test('Delete a task of user success', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);
    const taskDeleted = await Task.findById(response.body._id);
    expect(taskDeleted).toBeNull();
});

test('Delte a task of user failure', async () => {
    //bad token
    await request(app).delete(`/tasks/${taskOne._id}`).expect(401);

    //bad id task
    await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(404);
});

test('Delete many task of user success', async () => {
    await request(app)
        .delete('/tasks/many')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send([taskFive._id, taskSix._id])
        .expect(200);
    const taskFiveDeleted = await Task.findById(taskFive._id);
    const taskSixDeleted = await Task.findById(taskSix._id);
    expect(taskFiveDeleted).toBeNull();
    expect(taskSixDeleted).toBeNull();
});

test('Delete many task of user failure', async () => {
    //bad token
    await request(app)
        .delete('/tasks/many')
        .send([taskFive._id, taskSix._id])
        .expect(401);

    //bad id task
    await request(app)
        .delete('/tasks/many')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send([taskFive._id, taskFour._id])
        .expect(404);
});

test('Delete all task of user success', async () => {
    await request(app)
        .delete('/tasks/all')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);
    const tasks = await Task.find({ owner: userOneId });
    expect(tasks.length).toBe(0);
});

test('Delete all task of user failure', async () => {
    //bad token
    await request(app).delete('/tasks/all').expect(401);
});
