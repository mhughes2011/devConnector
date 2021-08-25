const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //This is utilizing config package and can grab anything in that file.  Setting it equal to the db.

const connectDB = async () => {
    try{
        await mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

        console.log('MongoDB connected...');
    } catch(err) {
        console.error(err.message);
        //Exit process (connecting to db) with failure
        process.exit(1);
    }
}

module.exports = connectDB;