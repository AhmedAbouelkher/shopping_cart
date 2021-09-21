const { isAuthanticated } = require("../middleware/auth")
const {
    fetchUserCartByUserId,
    addProductToCartByUserId,
    removeProductFromCartByUserId,
    updateProductQuantityInCartByUserId,
    deleteUserCart
} = require("../models/cart")
const router = require("express").Router()

router.use(isAuthanticated)

//Fetch user cart
router.get("/", async (req, res, next) => {
    try {
        const cart = await fetchUserCartByUserId(req.user._id)
        res.send({ cart })
    } catch (error) {
        next(error)
    }
})

router.post("/item", async (req, res, next) => {
    try {
        const { productId, quantity } = req.body
        await addProductToCartByUserId(req.user._id, {
            productId,
            quantity
        })
        res.send({ message: "product_added" })
    } catch (error) {
        next(error)
    }
})

router.put("/item", async (req, res, next) => {
    try {
        const { productId, removedQuantity } = req.body
        await updateProductQuantityInCartByUserId(req.user._id, {
            productId: productId,
            removedQuantity
        })
        res.send({ message: "product_updated" })
    } catch (error) {
        next(error)
    }
})

router.delete("/item", async (req, res, next) => {
    try {
        const { productId } = req.body
        await removeProductFromCartByUserId(req.user._id, productId)
        res.send({ message: "product_removed" })
    } catch (error) {
        next(error)
    }
})

router.delete("/", async (req, res, next) => {
    try {
        await deleteUserCart(req.user._id)
        res.send({ message: "user_cart_deleted" })
    } catch (error) {
        next(error)
    }
})

module.exports = router
