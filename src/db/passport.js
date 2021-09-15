const LocalStrategy = require('passport-local').Strategy;

const authenticateUser = async(email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
        return done(null, false, { message: 'No user with that email' })
    }
    try {
        if (await bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
            return done(null, false, { message: 'Password incorrect' })
        }
    } catch (e) {
        return done(e)
    }
}


module.exports = function(passport) {
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, authenticateUser))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async(userId, done) => {
        try {
            const user = await User.findById(userId)
            done(null, user)
        } catch (error) {
            done(error)
        }
    });
}