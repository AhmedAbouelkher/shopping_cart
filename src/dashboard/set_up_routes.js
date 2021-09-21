const indexRouterDB = require("./routes/index")
const { loginRouter, logoutRouter } = require("./routes/auth")
const productsRouter = require("./routes/products")
const ordersRouter = require("./routes/orders")

const { createViewError } = require("../utilities/error_handling")

const _useDBRouters = (app) => {
    indexRouterDB.use("/products", productsRouter)
    indexRouterDB.use("/orders", ordersRouter)
    //----- Error handling -----
    indexRouterDB.all("*", (_, __, next) => {
        return next(createViewError(404, "This route does not exist"))
    })
    app.use("/dashboard", indexRouterDB)
}

const setUp = (app) => {
    _useDBRouters(app)
    app.use("/login", loginRouter)
    app.use("/logout", logoutRouter)
}

module.exports = setUp
