const mongoose = require('mongoose');

const CLIENT_ROLE = 'client'
const ADMIN_ROLE = 'admin'

const schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please include a name"],
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    role: {
        enum: [CLIENT_ROLE, ADMIN_ROLE],
        default: CLIENT_ROLE,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tokens: [{
        token: {
            type: String
        }
    }]
}, {
    timeStamps: true
})

const User = mongoose.model('User', schema)

module.exports = User

exports.createUser = async() => {

}