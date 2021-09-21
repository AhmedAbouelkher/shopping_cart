const indexRouter = require("./index")
const productsRouter = require("./products")
const cartRouter = require("./cart")
const orderRouter = require("./order")

const authRouter = require("./auth")
const createHttpError = require("http-errors")

const setUp = (app) => {
    indexRouter.use("/auth", authRouter)
    indexRouter.use("/products", productsRouter)
    indexRouter.use("/cart", cartRouter)
    indexRouter.use("/order", orderRouter)

    indexRouter.all("*", (_, __, next) => {
        return next(createHttpError(404, "This route does not exist"))
    })
    app.use("/api", indexRouter)
}

module.exports = setUp
