const createHttpError = require("http-errors");
const { User, ADMIN_ROLE } = require("../../models/user");
const { verifyToken } = require("../../middleware/auth");

const _fetchUserById = async (id, token) => {
  const user = await User.findOne({ _id: id });
  verifyToken(token);
  if (!user) {
    throw createHttpError(404, "User couldn't be found in our database");
  }
  if (user.role !== ADMIN_ROLE) {
    throw createHttpError(403, "You are not an admin");
  }
  return user;
};

const isAuth = async (req, res, next) => {
  const exist = req.isAuthenticated();
  if (!exist) return res.redirect("/login");
  const passportUser = req.user;
  try {
    const savedUser = passportUser.user;
    const token = passportUser.token;
    const user = await _fetchUserById(savedUser._id, token);
    if (user.role !== ADMIN_ROLE) {
      throw createHttpError(403, "You are not an admin");
    }
    next();
  } catch (error) {
    console.log(error);
    return res.redirect("/login");
  }
};

module.exports = {
  isAuth,
};
