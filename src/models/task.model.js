const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        taskName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        grade: {
            type: String,
            default: 'normal',
        },
        date: {
            type: String,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    },
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
