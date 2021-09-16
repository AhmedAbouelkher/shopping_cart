const router = require('express').Router()

const { uploadImage, handleError } = require('../middleware/upload_image')
const { createUser, loginUser, logoutUser, updatePassword, updateUser } = require('../models/user')
const { isAuthanticated } = require('../middleware/auth')

router.post('/register', uploadImage.single('image'), async(req, res, next) => {
    const body = req.body
    const payload = {
        name: body.name,
        email: body.email,
        image: req.file != null ? req.file.path : '',
        password: body.password,
    }
    try {
        const response = await createUser(payload)
        return res.send(response)
    } catch (error) {
        next(error)
    }
}, handleError)

router.post('/login', async(req, res, next) => {
    const { email, password } = req.body
    try {
        const response = await loginUser(email, password)
        return res.send(response)
    } catch (error) {
        next(error)
    }
})

router.post('/logout', isAuthanticated, async(req, res, next) => {
    try {
        await logoutUser(req)
        res.send({ message: "You have logged out" })
    } catch (error) {
        next(error)
    }
})

router.post('/update_password', isAuthanticated, async(req, res, next) => {
    try {
        await updatePassword(req.user, req.body)
        res.send({ message: "Your password has been changed successfuly" })
    } catch (error) {
        next(error)
    }
})

router.get('/me', isAuthanticated, (req, res, next) => {
    try {
        return res.send({ user: req.user })
    } catch (error) {
        next(error)
    }
})

router.put('/me', isAuthanticated, uploadImage.single('image'), async(req, res, next) => {
    const body = req.body
    const payload = {
        name: body.name,
        email: body.email,
        image: req.file != null ? req.file.path : undefined,
    }
    console.log(payload);
    try {
        const updatedUser = await updateUser(req.user, payload)
        return res.send({ user: updatedUser })
    } catch (error) {
        return next(error)
    }
}, handleError)


module.exports = router