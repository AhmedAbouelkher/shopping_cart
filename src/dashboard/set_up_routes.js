const indexRouterDB = require('./routes/index')
const { loginRouter, logoutRouter } = require('./routes/auth');
const productsRouter = require('./routes/products')


const _useDBRouters = app => {
    indexRouterDB.use('/products', productsRouter)
    app.use('/dashboard', indexRouterDB)
}

const setUp = app => {
    _useDBRouters(app)
    app.use('/login', loginRouter)
    app.use('/logout', logoutRouter)
}

module.exports = setUp