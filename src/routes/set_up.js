const indexRouter = require('./index')
const productsRouter = require('./products')
const authRouter = require('./auth')

const setUp = app => {
    indexRouter.use('/auth', authRouter)
        // indexRouter.use('/products', productsRouter)
    app.use('/api', indexRouter)
}

module.exports = setUp