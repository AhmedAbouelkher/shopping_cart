const createHttpError = require("http-errors");

const createError = function (errors, statusCode = 500, message) {
  return { http: createHttpError(statusCode, message), errors };
};

const createViewError = function (statusCode = 500, message) {
  return { http: createHttpError(statusCode, message), view: true };
};

const convertToViewError = function (err) {
  return {
    http: createHttpError(err.statusCode, err.message),
    errros: err.errros,
    view: true,
  };
};

module.exports = {
  createError,
  createViewError,
  convertToViewError,
};
