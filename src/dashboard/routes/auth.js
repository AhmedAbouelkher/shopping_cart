const createHttpError = require("http-errors")
const passport = require("passport")
const tokens = require("csrf")()

const authRouter = require("express").Router()
const logoutRouter = require("express").Router()

const { createUser, loginUser, ADMIN_ROLE } = require("../../models/user")
const { uploadImage } = require("../../middleware/upload_image")

authRouter.get("/", async (req, res, _) => {
    //TODO: insert form token (for security)
    if (req.isUnauthenticated())
        return res.render("login", { layout: false, form_token: "token" })
    // if (req.isUnauthenticated()) return res.render('login', { layout: 'layouts/auth.ejs', form_token: "token" });
    return res.redirect("/dashboard")
})

//TODO: show proper errors in login page
//----- Login -----//
authRouter.post(
    "/",
    // passport.authenticate("admin_login", {
    //     successRedirect: "/",
    //     failureRedirect: "/login",
    //     failureFlash: true
    // })
    (req, res, next) => {
        passport.authenticate("admin_login", (err, user, info) => {
            req.login(user, function (err) {
                if (err) return next(err)
                return res.redirect("/users/" + req.user.username)
            })
        })(req, res, next)
    }
)

const _isAlowed = (req, _, next) => {
    const canRegister = req.body.code === process.env.ADMIN_REGISTER_KEY
    if (!canRegister)
        return next(
            createHttpError(403, "You are not allowed to user this route")
        )
    return next()
}

// Create new admin
authRouter.post(
    "/new",
    uploadImage.single("image"),
    _isAlowed,
    async (req, res, next) => {
        const body = req.body
        const payload = {
            name: body.name,
            email: body.email,
            password: body.password,
            image: req?.file?.path
        }
        try {
            const user = await createUser(payload, true)
            return res.send(user)
        } catch (error) {
            next(error)
        }
    },
    (err, req, res, next) => {
        next(err)
    }
)

// Api login
authRouter.post("/check", async (req, res, next) => {
    try {
        const { email, password } = req.body
        const response = await loginUser(email, password)
        const userRole = response.user.role
        if (userRole !== ADMIN_ROLE)
            throw createHttpError(403, "You are not an admin")
        return res.send(response)
    } catch (error) {
        return next(error)
    }
})

//----- Logout -----//
logoutRouter.post("/", (req, res, next) => {
    req.logOut()
    req.token = undefined
    res.redirect("/")
})

module.exports = { loginRouter: authRouter, logoutRouter }
