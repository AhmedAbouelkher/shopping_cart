const csurf = require("csurf")
const createHttpError = require("http-errors")
const _ = require("lodash")

const setCSRF = (req, res, next) => {
    return csurf()(req, res, next)
}

const checkCSRF = (req, res, next) => {
    return csurf()(req, res, (err) => {
        if (err) return next(err)
        req.body = _omitCSRFTokenFromReqBody(req)
        next()
    })
}

const verifyCSRF = async (req, token = null) => {
    if (token) req.body._csrf = token
    return new Promise((resolve, reject) => {
        if (!req.body._csrf)
            return reject(createHttpError(422, "Invalid _csrf token"))
        csurf()(req, {}, (err) => {
            if (err) return reject(createHttpError(403, err.message))
            req.body = _omitCSRFTokenFromReqBody(req)
            return resolve(true)
        })
    })
}

const _omitCSRFTokenFromReqBody = (req) => {
    return _.omit(req.body, ["_csrf"])
}

module.exports = {
    setCSRF,
    checkCSRF,
    verifyCSRF
}
