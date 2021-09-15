const mongoose = require("mongoose")

module.exports = () => {
    const url = process.env.MONGODB_URL
    mongoose.connect(url)
    const db = mongoose.connection
    db.on('open', () => console.log("🎉 DB is live 🎉", 'on', url))
    db.on('error', error => console.error(error))
    return db
}