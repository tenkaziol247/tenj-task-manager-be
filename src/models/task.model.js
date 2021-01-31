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
            trim: true,
            lowercase: true,
            default: 'b',
        },
        priority: {
            type: String,
            trim: true,
            lowercase: true,
            default: 'b',
        },
        range: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        date: {
            startAt: Date,
            endAt: Date,
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

taskSchema.statics.generateRangeProperty = (date) => {
    let range;
    if (!date) {
        range = 'unset';
    } else {
        if (!date.startAt) {
            range = 'nostarttime';
        } else if (!date.endAt) {
            range = 'noendtime';
        } else {
            if (date.endAt < date.startAt) {
                return;
            } else {
                const startTime = new Date(date.startAt);
                const endTime = new Date(date.endAt);
                const startAt = {
                    year: startTime.getFullYear(),
                    month: startTime.getMonth(),
                    day: startTime.getDate(),
                };
                const endAt = {
                    year: endTime.getFullYear(),
                    month: endTime.getMonth(),
                    day: endTime.getDate(),
                };
                if (
                    startAt.year === endAt.year &&
                    startAt.month === endAt.month &&
                    startAt.day === endAt.day
                ) {
                    range = 'day';
                } else if (
                    startAt.year === endAt.year &&
                    startAt.month === endAt.month
                ) {
                    range = 'month';
                } else {
                    range = 'year';
                }
            }
        }
    }
    return range;
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
