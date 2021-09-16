const LocalStrategy = require('passport-local').Strategy;
const createHttpError = require('http-errors');

const { loginUser, ADMIN_ROLE } = require('../models/user')

async function setupPassort(passport) {
    passport.use('admin_login', new LocalStrategy({ usernameField: 'email', passReqToCallback: true },
        async(req, email, password, done) => {
            try {
                const { error, user, token } = await loginUser(email, password)
                if (error) {
                    console.log(error);
                    return done(error)
                }
                const userRole = user.role
                if (userRole !== ADMIN_ROLE) done(null, false, { message: "You are not an admin and can't access this information" })
                return done(null, user);
            } catch (error) {
                console.log("Passport error", error);
                return done(error, null, { message: error.messsage })
            }
        }
    ))
}

const checkAuth = function(req, res, next) {
    if (req.user && req.user.role === ADMIN_ROLE) return next();
    return res.redirect('/login')
}

module.exports = {
    setupPassort,
    isAuthanticated: checkAuth,
}

// function setupPassort(passport) {
//     passport.use('admin_login', new LocalStrategy({ usernameField: 'email', passReqToCallback: true },
//         async(req, email, password, done) => {
//             try {
//                 const { user, token } = await loginUser(email, password)
//                 const userRole = user.role
//                     // console.log(user, token);
//                 if (userRole !== ADMIN_ROLE) throw createHttpError(403, 'You are not an admin');
//                 return done(null, user);
//             } catch (error) {
//                 console.log(error);
//                 if (error.statusCode === 422) {
//                     return done(null, false, { message: error.message })
//                 }
//                 return done(error)
//             }
//         }
//     ))
// }