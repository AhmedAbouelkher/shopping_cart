const Joi = require('joi')

const _serializeErrors = function (error) {
    return error.details.map((detail) => detail.message)
}

// ########## Create  ##########

const createSchema = new Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().required(),
}).options({ abortEarly: false })

const validateCreateProduct = async function (payload) {
    try {
        await createSchema.validateAsync(payload)
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Create  ##########

// ########## Update  ##########

const updateSchema = new Joi.object({
    name: Joi.string(),
    price: Joi.number().min(0),
    image: Joi.string(),
})
    .min(1)
    .options({ abortEarly: false })

const validateUpdateProduct = async function (payload) {
    try {
        await updateSchema.validateAsync(payload)
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Update  ##########

// ########## Update  ##########

const addProductToCartSchema = new Joi.object({
    productId: Joi.string().length(24).required(),
    quantity: Joi.number().min(1).max(32),
}).options({ abortEarly: false })

const validateAddProductToCart = async function (payload) {
    try {
        await addProductToCartSchema.validateAsync(payload)
        return undefined
    } catch (error) {
        return _serializeErrors(error)
    }
}

// ########## End of Update  ##########

module.exports = {
    validateCreateProduct,
    validateUpdateProduct,
    validateAddProductToCart,
}
