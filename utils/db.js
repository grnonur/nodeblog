const mongoose = require('mongoose');

const conn = async () => {
    await mongoose.connect(process.env.DB_URL, {
        dbName: 'nodeblog_online',
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Successfully connected to the database.')
    }).catch(err => {
        console.log(`DB connection: ${err}`)
    })
}

module.exports = conn;