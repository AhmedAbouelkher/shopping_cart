const createHttpError = require('http-errors');
const passport = require('passport');
const router = require('express').Router()

router.get('/f', (req, res, next) => {
    res.render('index')
})

router.get('/', checkAuthenticated, (req, res, next) => {
    res.render('index')
})

router.get('/login', (req, res, next) => {
    res.render('login');
})

router.post('/login', passport.authenticate('local_login', {
    successRedirect: '/',
    failureRedirect: 'dashboard/login',
}))

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('dashboard/login')
}

module.exports = router