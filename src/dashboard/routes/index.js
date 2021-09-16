const createHttpError = require('http-errors');
const passport = require('passport');
const router = require('express').Router()

router.get('/', (req, res, next) => {
    if (req.isUnauthenticated()) {
        return res.redirect('/login')
    }
    return res.render('index')
})

module.exports = router