const express = require('express');
require('./db/db');
const userRouter = require('./routers/user.router');
const taskRouter = require('./routers/task.router');

const app = express();

//active middleware body parser
app.use(express.json());

//connect routers
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

module.exports = app;
