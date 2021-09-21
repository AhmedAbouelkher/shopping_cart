const { Order } = require("../../models/order")
const _ = require("lodash")
const { validateFetchOrdersQuery } = require("../../validation/order")
const { calculatePaginationOffset } = require("../../utilities/pagination")
const { createError } = require("../../utilities/error_handling")

const ADMIN_ALLOWED_STATUS = [0, 1]

const fetchOrders = async (options = {}) => {
    const validationObject = _.omit(options, ["userId"])
    const { errors, value } = await validateFetchOrdersQuery(validationObject)

    if (errors) throw createError(errors, 400, "Invalid query options")
    const { page, show, order_by } = value
    const offset = calculatePaginationOffset(page)

    const filter = {}
    if (show !== -2) filter.delivery_status = show

    const orders = await Order.paginate(filter, {
        sort: { createdAt: order_by },
        offset: offset,
        select: "-shipping_address"
    })
    return orders
}

const fetchOrderById = async (orderId) => {
    //https://www.youtube.com/watch?v=c2oWH1g2Fng
    const order = await Order.findOne({
        _id: orderId
    }).populate({
        path: "items",
        populate: {
            path: "productId",
            select: "name image"
        }
    })
    if (!order) throw createHttpError(404, "Invalid order id")
    return order
}

const _isAdminAlowedToChangeStatus = (status) => {
    return ADMIN_ALLOWED_STATUS.includes(status)
}

const _getOrderStatusKeyFromValue = (status) => {
    return Object.keys(ORDER_STATUS).find((k) => ORDER_STATUS[k] === status)
}

module.exports = {
    fetchOrders,
    fetchOrderById
}
