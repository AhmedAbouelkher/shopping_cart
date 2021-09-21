const { isAuthanticated } = require("../middleware/auth")
const {
    createNewOrder,
    fetchUserOrders,
    fetchUserOrderById,
    changeOrderStatus
} = require("../models/order")
const router = require("express").Router()

router.use(isAuthanticated)

//fetch all orders
router.get("/", async (req, res, next) => {
    try {
        const { page, show, order_by } = req.query
        const orders = await fetchUserOrders({
            userId: req.user._id,
            page,
            show,
            order_by
        })
        res.send({ orders })
    } catch (error) {
        next(error)
    }
})

//fetch all orders
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await fetchUserOrderById(req.user._id, id)
        res.send({ order })
    } catch (error) {
        next(error)
    }
})

//update order status
router.put("/:id/update_status", async (req, res, next) => {
    try {
        const { id } = req.params
        const { delivery_status } = req.body
        const newStatus = await changeOrderStatus({
            userId: req.user._id,
            orderId: id,
            orderStatus: delivery_status
        })
        return res.send({
            message: "status_changed",
            new_status: {
                string: newStatus,
                code: parseInt(delivery_status)
            }
        })
    } catch (error) {
        return next(error)
    }
})

//create new order
router.post("/", async (req, res, next) => {
    try {
        const payload = req.body
        const order = await createNewOrder(req.user._id, payload)
        res.status(201).send({ order })
    } catch (error) {
        next(error)
    }
})

module.exports = router
