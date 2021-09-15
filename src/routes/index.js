const createHttpError = require('http-errors');

const router = require('express').Router()


router.get('/', (req, res, next) => {
    res.send({ msg: "Welcome to `Shopping Cart API`" })
})


module.exports = router