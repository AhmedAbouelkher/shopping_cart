const Joi = require("joi");

const _serializeErrors = function(error) {
    return error.details.map(detail => detail.message);
}

// ########## Register  ##########

const registerSchema = new Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    image: Joi.string().required(),
    password: Joi.string().min(4).max(32).required(),
})

const validateUserRegister = async function(payload) {
    try {
        await registerSchema.validateAsync(payload, {
            abortEarly: false,
        });
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Register  ##########

// ########## Login  ##########
const loginSchema = new Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(32).required(),
})

const validateUserLogin = async function(payload) {
    try {
        await loginSchema.validateAsync(payload, {
            abortEarly: false,
        });
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Login ##########

// ########## Update  ##########
const UpdateSchema = new Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    image: Joi.string(),
}).or('image', 'email', 'name')

const validateUserUpdate = async function(payload) {
    try {
        await UpdateSchema.validateAsync(payload, {
            abortEarly: false,
        });
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Update ##########

// ########## Update Password  ##########
const UpdatePasswordSchema = Joi.object({
    password: Joi.string().min(4).max(32).required(),
    new_password: Joi.string().min(4).max(32).required(),
})

const validateUserUpdatePassword = async function(payload) {
    try {
        await UpdatePasswordSchema.validateAsync(payload, {
            abortEarly: false,
        });
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Update Password ##########


module.exports = {
    validateRegister: validateUserRegister,
    validateLogin: validateUserLogin,
    validateUpdate: validateUserUpdate,
    validatePassUpdate: validateUserUpdatePassword,
}