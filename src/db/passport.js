const LocalStrategy = require('passport-local').Strategy;

const { loginUser, User } = require('../models/user')

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true },
        async(req, email, passport, done) => {
            try {
                const user = await loginUser(email, passport)
                done(null, user)
            } catch (error) {
                if (error.statusCode === 422) {
                    return done(null, false, { message: error.message })
                }
                return done(error)
            }
        }
    ))

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}