const router = require("express").Router()

router.get("/", (req, res, next) => {
    res.send({ message: "Welcome to Shopping Cart API" })
})

module.exports = router
