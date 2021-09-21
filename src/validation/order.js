const Joi = require("joi")
const { orderStatus } = require("../models/order")

const _serializeErrors = function (error) {
    return error.details.map((detail) => detail.message)
}

// ########## Create  ##########

const createSchema = new Joi.object({
    shipping_address: Joi.object({
        lat: Joi.number().positive().precision(6).required(),
        long: Joi.number().positive().precision(6).required(),
        zip_code: Joi.number().positive().required(),
        address: Joi.string().min(10).required().trim()
    }).required()
}).options({ abortEarly: false })

const validateCreateOrder = async function (payload) {
    const _obj = {}
    try {
        const value = await createSchema.validateAsync(payload)
        _obj.value = value
    } catch (error) {
        _obj.errors = _serializeErrors(error)
    }
    return _obj
}

// ########## End of Create  ##########

// ########## Update order status  ##########
const upadateOrderStatusSchema = new Joi.object({
    delivery_status: Joi.number().integer().min(-1).max(1).required()
}).options({ abortEarly: false })

const validateOrderStatus = async function (payload) {
    const _obj = {}
    try {
        const value = await upadateOrderStatusSchema.validateAsync(payload)
        _obj.value = value
    } catch (error) {
        _obj.errors = _serializeErrors(error)
    }
    return _obj
}
// ########## End of Update order status  ##########

// ########## Fetch orders query  ##########
const fetchOrdersQuerySchema = new Joi.object({
    page: Joi.number().integer().positive(),
    show: Joi.number()
        .integer()
        .valid(...[-2, -1, 0, 1])
        .default(-2),
    order_by: Joi.number()
        .integer()
        .valid(...[-1, 1])
        .default(-1)
}).options({ abortEarly: false })

const validateFetchOrdersQuery = async function (payload) {
    const _obj = {}
    try {
        const value = await fetchOrdersQuerySchema.validateAsync(payload)
        _obj.value = value
    } catch (error) {
        _obj.errors = _serializeErrors(error)
    }
    return _obj
}
// ########## End of fetch orders query  ##########

module.exports = {
    validateCreateOrder,
    validateOrderStatus,
    validateFetchOrdersQuery
}
