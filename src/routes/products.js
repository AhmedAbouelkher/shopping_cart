const router = require("express").Router()

const {
    fetchProducts,
    createProduct,
    updateProductById,
    deleteProductById,
    findProductById
} = require("../models/product")
const { uploadImage, handleError } = require("../middleware/upload_image")
const { isAuthanticated } = require("../middleware/auth")

const { Order } = require("../models/order")

router.use(isAuthanticated)

// list products
router.get("/", async (req, res, next) => {
    const { page, q } = req.query
    try {
        const products = await fetchProducts(page, q)
        return res.send({ products })
    } catch (error) {
        next(error)
    }
})

router.get("/:id", async (req, res, next) => {
    const { id } = req.params
    try {
        const product = await findProductById(id)
        return res.send({ product })
    } catch (error) {
        next(error)
    }
})

//! ****** User canot do those ****** !//

// Create new product
router.post(
    "/",

    uploadImage.single("image"),
    async (req, res, next) => {
        const body = req.body
        if (req.file !== undefined) {
            body.image = req.file.path
        }
        try {
            const product = await createProduct(body)
            return res.send({ product })
        } catch (error) {
            next(error)
        }
    },
    handleError
)

// update product
router.put(
    "/:id",
    isAuthanticated,
    uploadImage.single("image"),
    async (req, res, next) => {
        const body = req.body
        const id = req.params.id
        if (req.file !== undefined) {
            body.image = req.file.path
        }
        try {
            const product = await updateProductById(id, body)
            return res.send({ product })
        } catch (error) {
            next(error)
        }
    },
    handleError
)

// delete product
router.delete(
    "/:id",
    async (req, res, next) => {
        const body = req.body
        const id = req.params.id
        if (req.file !== undefined) {
            body.image = req.file.path
        }
        try {
            const product = await deleteProductById(id)
            return res.send({ product })
        } catch (error) {
            next(error)
        }
    },
    handleError
)

router.get("/:id/exist", async (req, res, next) => {
    try {
        const { id } = req.params
        await Order.updateMany(
            { "items.productId": id },
            { $pull: { items: { productId: id } } }
        ).exec()
        return res.send({ message: "Done" })
    } catch (error) {
        return next(error)
    }
})

module.exports = router
