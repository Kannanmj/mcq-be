const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION, {
            useUnifiedTopology: true,
            UseNewUrlParser: true
        });
        console.log('DataBase connected successfully');
    }
    catch (err) {
        console.log('mongoDb connection-error', err.message);
    }
}

module.exports = connectDb;


