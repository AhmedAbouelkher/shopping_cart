const router = require("express").Router()
const moment = require("moment")

const { isAuth } = require("../middleware/auth")
const {
    convertToViewError,
    createViewError
} = require("../../utilities/error_handling")

const { decodeStatusCode, encodeStatusCode } = require("../../models/order")

const {
    fetchOrders,
    fetchOrderById,
    deleteOrderById,
    recoverOrderById,
    fetchOrderStatusById,
    getAvailableAllOrderStatus,
    upadateOrderStatus
} = require("../models/order_extension")
const { setCSRF, checkCSRF } = require("../middleware/csruf")

router.use(isAuth)

// ## Orders

router.get("/", setCSRF, async (req, res, next) => {
    try {
        const { deleted, delivered } = req.query

        const orderssResponse = await fetchOrders({
            deleted,
            delivered
        })

        const options = {
            orders: orderssResponse.docs,
            moment,
            data: {
                totalPages: orderssResponse.totalPages,
                currentPage: orderssResponse.page,
                prevPage: orderssResponse.prevPage,
                nextPage: orderssResponse.nextPage
            },
            url: JSON.stringify({
                origin: req.originalUrl,
                host: `http://${req.headers.host}`
            }),
            query: null,
            csrfToken: req.csrfToken()
        }

        if (deleted) {
            options.title = "Deleted Orders"
        } else if (delivered) {
            options.title = "Delivered Orders"
        }
        return res.render("orders/index", options)
    } catch (error) {
        console.log(error)
        return next(convertToViewError(error))
    }
})

// ## Order

router.get("/:id", setCSRF, async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await fetchOrderById(id)

        return res.render("orders/order", {
            order,
            currentStatus: decodeStatusCode(order.delivery_status),
            moment,
            csrfToken: req.csrfToken()
        })
    } catch (error) {
        console.log(error)
        return next(convertToViewError(error))
    }
})

router.post("/:id/delete", checkCSRF, async (req, res, next) => {
    try {
        const { id } = req.params
        await deleteOrderById(id)
        return res.redirect("/dashboard/orders")
    } catch (error) {
        console.log(error)
        next(createViewError(error))
    }
})

router.post("/:id/recover", checkCSRF, async (req, res, next) => {
    try {
        const { id } = req.params
        await recoverOrderById(id)
        return res.redirect("/dashboard/orders")
    } catch (error) {
        console.log(error)
        next(createViewError(error))
    }
})

router.get("/:id/update_status", setCSRF, async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await fetchOrderStatusById(id)
        return res.render("orders/update_status", {
            order,
            currentStatus: decodeStatusCode(order.delivery_status),
            allOrderStatus: getAvailableAllOrderStatus(),
            moment,
            csrfToken: req.csrfToken()
        })
    } catch (error) {
        console.log(error)
        return next(convertToViewError(error))
    }
})

router.post("/:id/update_status", checkCSRF, async (req, res, next) => {
    try {
        const { id } = req.params
        const { new_status } = req.body
        await upadateOrderStatus({
            orderId: id,
            new_status
        })
        return res.redirect("/dashboard/orders")
    } catch (error) {
        console.log(error)
        return next(convertToViewError(error))
    }
})

module.exports = router
