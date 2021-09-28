const router = require("express").Router()

const { IncomingForm } = require("formidable")

const {
    fetchProducts,
    findProductById,
    createProduct,
    updateProductById,
    deleteProductById
} = require("../../models/product")

const { isAuth } = require("../middleware/auth")
const {
    convertToViewError,
    createViewError
} = require("../../utilities/error_handling")

const { setCSRF, checkCSRF } = require("../middleware/csruf")
const { parseFormAndCheckCSRF } = require("../middleware/parse_form")

router.use(isAuth)

//Fetch all products
router.get("/", setCSRF, async (req, res, next) => {
    const page = req.query.page
    const query = req.body.q || req.query.q
    try {
        const productsResponse = await fetchProducts(page, query)
        res.render("products/index", {
            products: productsResponse.docs,
            data: {
                totalPages: productsResponse.totalPages,
                currentPage: productsResponse.page,
                prevPage: productsResponse.prevPage,
                nextPage: productsResponse.nextPage
            },
            url: JSON.stringify({
                origin: req.originalUrl,
                host: `http://${req.headers.host}`
            }),
            query,
            csrfToken: req.csrfToken()
        })
    } catch (error) {
        console.log(error)
        next(convertToViewError(error))
    }
})

// Create new product
router.get("/create", setCSRF, (req, res, next) => {
    res.render("products/create", { csrfToken: req.csrfToken() })
})

router.post("/create", parseFormAndCheckCSRF, async (req, res, next) => {
    const { path } = req.files.image
    const payload = req.body
    payload.image = path
    try {
        await createProduct(payload)
        return res.redirect("/dashboard/products")
    } catch (error) {
        console.log(error)
        next(convertToViewError(error))
    }
})

// View
router.get("/:id/edit", setCSRF, async (req, res, next) => {
    const { id } = req.params
    try {
        const product = await findProductById(id)
        res.render("products/edit", { product, csrfToken: req.csrfToken() })
    } catch (error) {
        next(convertToViewError(error))
    }
})

// update product
router.post("/:id/edit", parseFormAndCheckCSRF, async (req, res, next) => {
    const { id } = req.params
    const payload = req.body
    const { path, size } = req.files.image
    if (size > 0) payload.image = path
    try {
        await updateProductById(id, payload)
        return res.redirect("/dashboard/products")
    } catch (error) {
        next(convertToViewError(error))
    }
})

router.post("/upload", (req, res, next) => {
    const form = new IncomingForm({
        keepExtensions: true,
        uploadDir: "./files/"
    })
    form.parse(req, async function (err, fields, files) {
        console.log(files.file.path)
        return res.send({ msg: "success" })
    })
})

// delete product
router.post("/:id/delete", checkCSRF, async (req, res, next) => {
    console.log(req.body)
    try {
        const { id } = req.params
        await deleteProductById(id)
        return res.redirect("/dashboard/products")
    } catch (error) {
        return next(createViewError(error))
    }
})

// view product
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const product = await findProductById(id)
        return res.send(product)
    } catch (error) {
        return next(convertToViewError(error))
    }
})

module.exports = router
