const createHttpError = require('http-errors')
const jwt = require('jsonwebtoken')
const { User } = require('../models/user')
const createError = require('../utilities/error_handling')

const auth = async(req, res, next) => {
    try {
        const rawToken = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET)
        const u = await User.findById(decoded.id)
        const user = await User.findOne({ _id: decoded.id, 'tokens.token': rawToken })
        if (!user) return next(createHttpError(404, "User couldn't be found in our database"));
        req.user = user
        req.token = rawToken
        next()
    } catch (error) {
        const errors = error.name === 'JsonWebTokenError' ? undefined : [error]
        return next(createError(errors, 403, "UnAuthanticated"))
    }
}

module.exports = {
    isAuthanticated: auth
}