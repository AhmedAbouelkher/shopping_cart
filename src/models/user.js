const mongoose = require('mongoose');
const _ = require('lodash');
const createHttpError = require('http-errors');

const { validateRegister, validateLogin, validatePassUpdate, validateUpdate } = require('../validation/user')

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
            type: String,
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
const bycrpt = require('bcryptjs');
const createError = require('../utilities/error_handling');


async function createUser(payload, isAdmin = false) {
    const errors = await validateRegister(payload)
    if (errors) throw createError(errors, 422, null);

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
    const errors = await validateLogin({ email, password })
    if (errors) throw createError(errors, 422, null);

    const user = await User.findOne({ email })
    if (!user) throw createHttpError(404, 'User not found');

    const hasMatchedPassword = await bycrpt.compare(password, user.password)
    if (!hasMatchedPassword) throw createHttpError(422, 'User\'s email or password is not correct');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    await User.updateOne({ _id: user._id }, { $push: { tokens: { token } } })

    return { user, token }
}

const logout = async(req) => {
    const user = req.user
    user.tokens = []
    req.token = undefined
    await user.save()
}

const updatePassword = async(user, payload) => {
    const errors = await validatePassUpdate(payload)
    if (errors) throw createError(errors, 422, null);

    const { password, new_password } = payload

    if (password === new_password) throw createHttpError(422, "new_password can't match password");

    const hasValidOldpassword = await bycrpt.compare(password, user.password)
    if (!hasValidOldpassword) throw createHttpError(422, "Entered information is not valid");

    const hasedNewPassword = await bycrpt.hash(new_password, 10)
    user.password = hasedNewPassword
    await user.save()
}

const updateUser = async function(user, payload) {
    const errors = await validateUpdate(payload)
    if (errors) throw createError(errors, 422, null);
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        image: payload.image,
        name: payload.name,
        email: payload.email
    }, {
        new: true
    })
    return updatedUser
}

module.exports = {
    CLIENT_ROLE,
    ADMIN_ROLE,
    User,
    loginUser,
    createUser,
    logoutUser: logout,
    updatePassword,
    updateUser
}