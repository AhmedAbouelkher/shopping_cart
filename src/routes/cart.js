const createHttpError = require('http-errors')
const { isAuthanticated } = require('../middleware/auth')
const {
    fetchUserCartByUserId,
    addProductToCartByUserId,
    checkIfProductInCart,
} = require('../models/cart')
const router = require('express').Router()

router.use(isAuthanticated)

//Fetch user cart
router.get('/', async (req, res, next) => {
    try {
        const cart = await fetchUserCartByUserId(req.user._id)
        res.send({ cart })
    } catch (error) {
        next(error)
    }
})

router.post('/add', async (req, res, next) => {
    try {
        const { product_id: productId, quantity } = req.body
        const cart = await addProductToCartByUserId(req.user._id, {
            productId,
            quantity,
        })
        res.send({ cart })
    } catch (error) {
        next(error)
    }
})

router.get('/has_product', async (req, res, next) => {
    try {
        const { id: productId } = req.query
        console.log(productId)
        const result = await fetchProductInCart(req.user._id, productId)
        res.send({ result })
    } catch (error) {
        next(error)
    }
})

module.exports = router
