const router = require("express").Router()
const { createViewError } = require("../../utilities/error_handling")
const { isAuth } = require("../middleware/auth")

const {
    getOrdersCount,
    getNumOfNewlyDeliveredOrders
} = require("../models/order_extension")
const { getNumOfNewlyAddedProducts } = require("../models/product_extension")

router.use(isAuth)

router.get("/", async (req, res, next) => {
    try {
        const numOfActiveOrders = await getOrdersCount()
        const numOfNewlyAddedProducts = await getNumOfNewlyAddedProducts()
        const numOfNewlyDeliveredOrders = await getNumOfNewlyDeliveredOrders()
        return res.render("index", {
            numOfActiveOrders,
            numOfNewlyAddedProducts,
            numOfNewlyDeliveredOrders
        })
    } catch (error) {
        console.log(error)
        return next(createViewError(error))
    }
})

module.exports = router
