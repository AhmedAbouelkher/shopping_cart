const createHttpError = require('http-errors');
const passport = require('passport');
const authRouter = require('express').Router()
const logoutRouter = require('express').Router()

const { createUser, loginUser, ADMIN_ROLE } = require('../../models/user')
const imageUpload = require('../../middleware/upload_image');

authRouter.get('/', (req, res, _) => {
    if (req.isUnauthenticated()) return res.render('login', { layout: 'layouts/auth.ejs' });
    return res.redirect('/dashboard')
})

//TODO: show proper errors in login page
//----- Login -----//
authRouter.post('/', passport.authenticate('admin_login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}))

const _isAlowed = (req, _, next) => {
    const canRegister = req.body.code === process.env.ADMIN_REGISTER_KEY
    if (!canRegister) return next(createHttpError(403, 'You are not allowed to user this route'))
    return next()
}

// Create new admin
authRouter.post('/new', imageUpload.single('image'), _isAlowed, async(req, res, next) => {
    const body = req.body
    const payload = {
        name: body.name,
        email: body.email,
        password: body.password,
        image: req.file.path,
    }
    try {
        const user = await createUser(payload, true)
        return res.send(user)
    } catch (error) {
        next(error)
    }
}, (err, req, res, next) => {
    next(err)
})

// Api login
authRouter.post('/check', async(req, res, next) => {
    try {
        const { email, password } = req.body
        const response = await loginUser(email, password)
        const userRole = response.user.role
        if (userRole !== ADMIN_ROLE) throw createHttpError(403, 'You are not an admin');
        return res.send(response)
    } catch (error) {
        return next(error)
    }
})


//----- Logout -----//
logoutRouter.post('/', (req, res, next) => {
    req.logOut()
    res.redirect('/')
})

module.exports = { loginRouter: authRouter, logoutRouter }