const router = require("express").Router()

const { IncomingForm } = require("formidable")

const moment = require("moment")

const { isAuth } = require("../middleware/auth")
const {
    convertToViewError,
    createViewError
} = require("../../utilities/error_handling")

const { fetchOrders, fetchOrderById } = require("../models/order_extension")

router.use(isAuth)

// ## Orders

router.get("/", async (req, res, next) => {
    try {
        const orderssResponse = await fetchOrders()
        return res.render("orders/index", {
            orders: orderssResponse.docs,
            moment,
            data: {
                totalPages: orderssResponse.totalPages,
                currentPage: orderssResponse.page,
                prevPage: orderssResponse.prevPage,
                nextPage: orderssResponse.nextPage
            },
            url: null,
            query: null
        })
    } catch (error) {
        console.log(error)
        return next(convertToViewError(error))
    }
})

// ## Order

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await fetchOrderById(id)
        return res.render("orders/index", {
            orders: orderssResponse.docs,
            moment,
            data: {
                totalPages: orderssResponse.totalPages,
                currentPage: orderssResponse.page,
                prevPage: orderssResponse.prevPage,
                nextPage: orderssResponse.nextPage
            },
            url: null,
            query: null
        })
    } catch (error) {
        console.log(error)
        return next(convertToViewError(error))
    }
})

router.post("/:id", (req, res, next) => {})

router.get("/:id/delete", (req, res, next) => {})

router.get("/:id/edit", (req, res, next) => {})

module.exports = router
