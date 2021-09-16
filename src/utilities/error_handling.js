const createHttpError = require('http-errors');

const createError = function(errors, statusCode = 500, message) {
    return { http: createHttpError(statusCode, message), errors }
}

module.exports = createError