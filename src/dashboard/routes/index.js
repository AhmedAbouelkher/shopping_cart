const passport = require('passport');
const { isAuth } = require('../middleware/auth');

const router = require('express').Router()

router.use(isAuth)

router.get('/', (req, res, next) => {
    return res.render('index')
})

module.exports = router