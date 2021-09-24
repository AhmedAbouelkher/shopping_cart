const createHttpError = require("http-errors")
const mongoose = require("mongoose")
const _ = require("lodash")
const mongoose_delete = require("mongoose-delete")

//https://www.npmjs.com/package/mongoose-paginate-v2
const mongoosePaginate = require("mongoose-paginate-v2")
const { calculatePaginationOffset } = require("../utilities/pagination")
const { createError } = require("../utilities/error_handling")
const {
    validateCreateOrder,
    validateOrderStatus,
    validateFetchOrdersQuery
} = require("../validation/order")

const ORDER_STATUS = {
    PREPERING: -1,
    IN_PROGRESS: 0,
    DELIEVERED: 1
}

const CLIENT_ALLOWED_STATUS = [1]

const {
    fetchUserCartByUserId,
    deleteUserCart,
    getItemMongooseSchema
} = require("./cart")

const shippingAdressSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
    zip_code: { type: Number, required: true },
    address: { type: String, required: true }
})

const orderSchema = new mongoose.Schema(
    {
        items: [getItemMongooseSchema()],
        shipping_address: { type: shippingAdressSchema, required: true },
        delivery_status: {
            type: Number,
            min: -1,
            max: 1,
            default: -1,
            integer: true
        },
        total: { type: Number, default: 0 },
        client: { type: mongoose.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
)

orderSchema.plugin(mongoose_delete, { indexFields: true })

orderSchema.plugin(mongoosePaginate)

const Order = mongoose.model("Order", orderSchema)

//Create order
const createNewOrder = async (userId, payload) => {
    const {
        errors,
        value: { shipping_address }
    } = await validateCreateOrder(payload)
    if (errors)
        throw createError(errors, 422, "The givin order details is invalid")
    // check user cart
    const cart = await fetchUserCartByUserId(userId)
    // if the cart is not empty
    if (cart.items.length === 0)
        throw createHttpError(400, "User cart is empty")

    const items = cart.items
    // add products to order
    const newOrder = await Order.create({
        items: items,
        shipping_address,
        total: cart.subTotal,
        client: cart.owner
    })

    // delete cart
    //TODO: Delete the cart after the order has been created
    // await deleteUserCart(userId)

    return newOrder
}

//list orders
const fetchUserOrders = async (options) => {
    const { userId } = options
    const validationObject = _.omit(options, ["userId"])
    const { errors, value } = await validateFetchOrdersQuery(validationObject)
    if (errors) throw createError(errors, 400, "Invalid query options")
    const { page, show, order_by } = value
    const offset = calculatePaginationOffset(page)

    const filter = { client: userId }
    if (show !== -2) {
        filter.delivery_status = show
    }

    const orders = await Order.paginate(filter, {
        sort: { createdAt: order_by },
        offset: offset,
        select: "-items -shipping_address"
    })
    return orders
}

const fetchUserOrderById = async (userId, orderId) => {
    //https://www.youtube.com/watch?v=c2oWH1g2Fng
    const order = await Order.findOne({
        _id: orderId,
        client: userId
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

//change order status {if isAgent()}
const changeOrderStatus = async ({ userId, orderId, orderStatus }) => {
    const { errors, value } = await validateOrderStatus({
        delivery_status: orderStatus
    })
    if (errors) throw createError(errors, 422, "Invalid order status")
    const new_status = value.delivery_status

    //Check if he can change the status
    const isAlowed = _isClientAlowedToChangeStatus(new_status)
    if (!isAlowed)
        throw createHttpError(403, "You can not change the order status.")

    await fetchUserOrderById(userId, orderId)
    await Order.updateOne(
        { _id: orderId, client: userId },
        {
            delivery_status: new_status
        }
    )
    return decodeStatusCode(new_status)
}

const decodeStatusCode = (statusValue) => {
    return Object.keys(ORDER_STATUS).find(
        (k) => ORDER_STATUS[k] === statusValue
    )
}

const encodeStatusCode = (statusKey) => {
    console.log(statusKey)
    return ORDER_STATUS[`${statusKey}`]
}

const _isClientAlowedToChangeStatus = (status) => {
    return CLIENT_ALLOWED_STATUS.includes(status)
}

module.exports = {
    Order,
    orderStatus: ORDER_STATUS,
    createNewOrder,
    fetchUserOrders,
    fetchUserOrderById,
    changeOrderStatus,
    decodeStatusCode,
    encodeStatusCode
}
