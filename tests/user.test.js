const request = require('supertest');
const app = require('../src/app');
const bcryptjs = require('bcryptjs');

const User = require('../src/models/user.model');

const {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    setupBeforeTest,
} = require('./fixtures/documents/document');
const Task = require('../src/models/task.model');

//teardown old data and create new data
beforeEach(setupBeforeTest);

test('Sign up valid', async () => {
    //status 201 create success
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Tenk',
            email: 'tenk@gmail.com',
            password: 'toilatenk',
        })
        .expect(201);

    //user response not null
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //user response match value
    expect(user.name).toBe('Tenk');
    expect(user.email).toBe('tenk@gmail.com');
    const isMatch = await bcryptjs.compare('toilatenk', user.password);
    expect(isMatch).toBe(true);
});

test('Sign up invalid', async () => {
    await request(app)
        .post('/users')
        .send({
            email: 'tenk2@gmail.com',
            password: 'toilatenk2',
        })
        .expect(400);

    await request(app)
        .post('/users')
        .send({
            name: 'tenk2',
            password: 'toilatenk2',
        })
        .expect(400);

    await request(app)
        .post('/users')
        .send({
            email: 'tenk2@gmail.com',
            name: 'Tenk2',
        })
        .expect(400);

    //create user namesake
    const response = await request(app)
        .post('/users')
        .send({
            email: userOne.email,
            password: userOne.password,
            name: userOne.name,
        })
        .expect(400);
    expect(response.body.error).toBe('Account already exists');
});

test('Login user valid', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password,
        })
        .expect(200);
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(user.name).toBe(userOne.name);
    expect(user.email).toBe(userOne.email);
    expect(user.age).toBe(userOne.age);
});

test('Login user invalid', async () => {
    await request(app)
        .post('/users/login')
        .send({ email: userOne.email, password: 'saisaisai' })
        .expect(400);
});

test('Get profile user', async () => {
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(response.body._id);
    expect(user.name).toBe(userOne.name);
    expect(user.email).toBe(userOne.email);
});

test('Get not profile user when dont have token', async () => {
    await request(app).get('/users/me').send().expect(401);
});

test('Logout user success', async () => {
    await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOne._id);
    if (user.tokens.length > 0) {
        expect(user.tokens[0].token).not.toBe(userOne.tokens[0].token);
    }
});

test('Logout user failure', async () => {
    await request(app).post('/users/logout').send().expect(401);
});

test('Logout all token success', async () => {
    await request(app)
        .post('/users/logoutAll')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOne._id);
    expect(user.tokens.length).toBe(0);
});

test('Logout all token failure', async () => {
    await request(app).post('/users/logoutAll').send().expect(401);
});

test('Update user success', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: userTwo.name,
            password: userTwo.password,
            age: 30,
        })
        .expect(200);
});

test('Update user failure', async () => {
    //dont have token
    await request(app)
        .patch('/users/me')
        .send({
            name: userTwo.name,
            password: userTwo.password,
            age: 30,
        })
        .expect(401);

    //invalid updates
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            hobby: 'dance',
            password: userTwo.password,
            age: 30,
        })
        .expect(400);
});

test('Delete user and delete task of user success', async () => {
    //check user
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`);
    expect(200);
    const user = await User.findById(response.body._id);
    expect(user).toBeNull();

    //check task
    const tasks = await Task.find({ owner: response.body._id });
    expect(tasks.length).toBe(0);
});

test('Delete user failure', async () => {
    await request(app).delete('/users/me').expect(401);
});

test('Should upload image success', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/image/lonely.jpg')
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Upload file failure', async () => {
    //bad token
    await request(app)
        .post('/users/me/avatar')
        .attach('avatar', 'tests/fixtures/image/lonely.jpg')
        .expect(401);

    //invalid file type
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/file/test.txt')
        .expect(400);

    //invalid file size
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/image/grammar.png')
        .expect(400);
});

test('Get image success', async () => {
    await request(app)
        .get('/users/me/avatar')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(200);
});

test('Dont get image when bad token', async () => {
    await request(app).get('/users/me/avatar').expect(401);
});

test('Delete avatar success', async () => {
    await request(app)
        .delete('/users/me/avatar')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(200);
    const user = await User.findById(userTwoId);
    expect(user.avatar).toBeNull();
});

test('Delelte avatar failure', async () => {
    await request(app).delete('/users/me/avatar').expect(401);
});
