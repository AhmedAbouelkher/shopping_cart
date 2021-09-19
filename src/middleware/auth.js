const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { createError } = require("../utilities/error_handling");

const auth = async (req, res, next) => {
  try {
    const { user, token } = await checkAuthanticatedUser(req);
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    return next(error);
  }
};

const checkAuthanticatedUser = async (req) => {
  try {
    const rawToken = req.header("Authorization").replace("Bearer ", "");
    const decoded = verifyToken(rawToken);
    const user = await User.findOne({
      _id: decoded.id,
      "tokens.token": rawToken,
    });
    if (!user) {
      throw createHttpError(404, "User couldn't be found in our database");
    }
    return { user, token: rawToken };
  } catch (error) {
    const errors = error.name === "JsonWebTokenError" ? undefined : [error];
    throw createError(errors, 403, "UnAuthanticated");
  }
};

const verifyToken = (rawToken) => {
  const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
  return decoded;
};

module.exports = {
  isAuthanticated: auth,
  checkAuthanticatedUser,
  verifyToken,
};
