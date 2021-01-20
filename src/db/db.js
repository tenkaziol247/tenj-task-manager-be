const mongoose = require('mongoose');

// 'mongodb+srv://tenkil247:sac12345@cluster0.mdmwz.mongodb.net/tenj-task-manager'

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connect successfully');
});
