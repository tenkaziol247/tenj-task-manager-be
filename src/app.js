const express = require('express');
const cors = require('cors');

require('./db/db');
const userRouter = require('./routers/user.router');
const taskRouter = require('./routers/task.router');

const app = express();

app.user(cors());

app.use(express.json());

app.use('/users', userRouter);
app.use('/tasks', taskRouter);

module.exports = app;
