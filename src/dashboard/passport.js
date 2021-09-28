const LocalStrategy = require("passport-local").Strategy
const createHttpError = require("http-errors")

const { loginUser, ADMIN_ROLE, User } = require("../models/user")

async function setupPassort(passport) {
    passport.use(
        "admin_login",
        new LocalStrategy(
            { usernameField: "email", passReqToCallback: true },
            async (req, email, password, done) => {
                try {
                    const { error, user, token } = await loginUser(
                        email,
                        password
                    )
                    if (error) return done(error)
                    const userRole = user.role
                    if (userRole !== ADMIN_ROLE) {
                        return done(
                            createHttpError(422, "you are not an admin")
                        )
                    }
                    const data = { user, token }
                    return done(null, data)
                } catch (error) {
                    return done(error, null)
                }
            }
        )
    )

    passport.serializeUser(function (data, done) {
        if (!data.user) {
            return done(createHttpError(404, "User is not found"))
        }
        done(null, data.user.id)
    })

    passport.deserializeUser(function (id, done) {
        User.findById(id, async function (err, user) {
            if (err) return done(err)
            if (!user) return done(null, false)
            const token = user.tokens.slice(-1)[0].token
            done(null, { user, token })
        })
    })
}

module.exports = {
    setupPassort
}
