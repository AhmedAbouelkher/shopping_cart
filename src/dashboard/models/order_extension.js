const {
    Order,
    orderStatus,
    decodeStatusCode,
    encodeStatusCode
} = require("../../models/order")

const _ = require("lodash")

const { validateFetchOrdersQuery } = require("../../validation/order")
const { calculatePaginationOffset } = require("../../utilities/pagination")
const {
    createError,
    createViewError
} = require("../../utilities/error_handling")
const {
    Types: { ObjectId },
    Types
} = require("mongoose")

const ADMIN_ALLOWED_STATUS = [0, 1]

const fetchOrders = async (options = {}) => {
    const validationObject = _.omit(options, ["userId"])
    const { errors, value } = await validateFetchOrdersQuery(validationObject)

    if (errors) throw createError(errors, 400, "Invalid query options")

    const { page, show, order_by, delivered } = value
    const offset = calculatePaginationOffset(1)

    const filter = { deleted: false }

    if (delivered) filter.delivery_status = 1
    if (show !== -2) filter.delivery_status = show
    if (options.deleted) filter.deleted = true
    const orders = await Order.paginate(filter, {
        sort: { createdAt: -1 },
        offset: offset,
        select: "-shipping_address"
    })
    return orders
}

const fetchOrderById = async (orderId) => {
    //https://www.youtube.com/watch?v=c2oWH1g2Fng
    const order = await Order.findOne({
        _id: orderId
    })
        .populate({
            path: "items",
            populate: {
                path: "productId",
                select: "name image"
            }
        })
        .populate({
            path: "client",
            select: "name email"
        })
    if (!order) throw createHttpError(404, "Invalid order id")
    return order
}

const deleteOrderById = async (orderId) => {
    const id = ObjectId(orderId)
    await Order.deleteById(id).exec()
}

const recoverOrderById = async (orderId) => {
    const id = ObjectId(orderId)
    await Order.restore({ _id: id }).exec()
}

const fetchOrderStatusById = async (orderId) => {
    //https://www.youtube.com/watch?v=c2oWH1g2Fng
    const order = await Order.findOne({
        _id: orderId
    }).select("delivery_status updatedAt")
    if (!order) throw createHttpError(404, "Invalid order id")
    return order
}

const getAvailableAllOrderStatus = () => {
    return orderStatus
}

const upadateOrderStatus = async ({ orderId, new_status }) => {
    //https://dmitripavlutin.com/access-object-properties-javascript/
    // const { [`${new_status}`]: delivery_status } = orderStatus
    const delivery_status = encodeStatusCode(new_status)
    if (delivery_status == null)
        throw createViewError(422, "invalid order status update")
    await Order.updateOne({ _id: ObjectId(orderId) }, { delivery_status })
}

const _isAdminAlowedToChangeStatus = (status) => {
    return ADMIN_ALLOWED_STATUS.includes(status)
}

const getOrdersCount = async () => {
    const ordersCount = await Order.find({
        delivery_status: {
            $lt: 1
        }
    })
        .count()
        .exec()
    return ordersCount
}

const getNumOfNewlyDeliveredOrders = async (limitInDays = 2) => {
    const diff = new Date(Date.now() - limitInDays * 24 * 60 * 60 * 1000)
    const productsCount = await Order.find({
        delivery_status: 1,
        updatedAt: { $gt: diff }
    })
        .count()
        .exec()
    return productsCount
}

module.exports = {
    fetchOrders,
    fetchOrderById,
    deleteOrderById,
    recoverOrderById,
    fetchOrderStatusById,
    getAvailableAllOrderStatus,
    upadateOrderStatus,
    getOrdersCount,
    getNumOfNewlyDeliveredOrders
}
