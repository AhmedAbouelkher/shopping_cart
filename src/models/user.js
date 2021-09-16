const mongoose = require('mongoose');
const _ = require('lodash');

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
        unique: true
    },
    image: {
        type: String,
        required: true,
    },
    role: {
        type: String,
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

// ----- User Methods -------

schema.methods.toJSON = function() {
    const obj = this.toObject()
    return _.omit(obj, ['password', '__v', 'tokens', 'updatedAt'])
}

// ----- End of User Methods -------

const User = mongoose.model('User', schema)

//----- Auth Methods -------

const jwt = require('jsonwebtoken')
const bycrpt = require('bcryptjs')
const createHttpError = require('http-errors');

async function createUser(payload, isAdmin = false) {
    //TODO: Validate schema

    const newUser = new User({
        name: payload.name,
        email: payload.email,
        image: payload.image,
    })
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
    const password = await bycrpt.hash(payload.password, 10)
    newUser.tokens = [{ token }]
    newUser.password = password

    if (isAdmin) { newUser.role = ADMIN_ROLE }

    const user = await newUser.save()
    return { user, token }
}


async function loginUser(email, password) {
    try {
        //TODO: validate schema

        const user = await User.findOne({ email })
        if (!user) throw createHttpError(404, 'User not found');

        const hasMatchedPassword = await bycrpt.compare(password, user.password)
        if (!hasMatchedPassword) throw createHttpError(422, 'User\'s email or password is not correct');

        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        user.tokens = user.tokens.concat({ newToken })

        return { user, token: newToken }
    } catch (error) {
        return { error }
    }
}

module.exports = {
    CLIENT_ROLE,
    ADMIN_ROLE,
    User,
    loginUser,
    createUser
}