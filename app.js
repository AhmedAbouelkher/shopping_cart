const express = require('express')
const p = require('path')
const createHttpError = require('http-errors')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('passport')
// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')
const flash = require('express-flash')

const connection = require('./src/db/mongoose')()
const app = express()

app.set('view engine', 'ejs')
app.set('views', p.join(__dirname, 'views'))
app.set('layout', 'layouts/layout')
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)

app.use('/public', express.static(p.join(__dirname, 'public')))
app.use(
    '/adminlte',
    express.static(p.join(__dirname, 'node_modules', 'admin-lte'))
)
app.use('/files', express.static('files'))

// app.use('/files', express.static('files'))

app.use(expressLayouts)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/**
 * -------------- SESSION SETUP ----------------
 */
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URL,
            mongooseConnection: connection,
            ttl: 14 * 24 * 60 * 60 // save session for 14 days
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
        }
    })
)

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
require('./src/dashboard/passport').setupPassort(passport)
// require("./src/db/passport")(passport);

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

//----- GENERAL ----
app.get('/', (req, res) => res.redirect('/dashboard'))

//---- Normal api -----
require('./src/routes/set_up')(app)

//----- Dashboard api -----
require('./src/dashboard/set_up_routes')(app)

//----- Error handling -----
app.all('*', (_, __, next) => {
    return next(createHttpError(404, 'This route does not exist'))
})

app.use((err, req, res, next) => {
    const httpError = err.http || err
    const statusCode = httpError.status || 500
    const message = httpError.message
    const errors = err.errors
    if (!err.view) {
        return res.status(statusCode).json({ message, errors, statusCode })
    }
    if (statusCode === 404) return res.render('partials/404', { message })
    return res.render('partials/500', { message })
})

app.listen(process.env.PORT, () => {
    console.log(`Started on port ${process.env.PORT}`)
})
