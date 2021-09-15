const express = require('express');
const p = require('path');
const expressLayouts = require('express-ejs-layouts');
// const session = require('express-session');
// const passport = require('passport');

const connection = require('./src/db/mongoose')()

// Package documentation - https://www.npmjs.com/package/connect-mongo
// const MongoStore = require('connect-mongo')

const app = express()

app.set('view engine', 'ejs')
app.set('views', p.join(__dirname, 'views'))
app.set('layout', 'layouts/layout')

app.use(express.static(p.join(__dirname, "public")))
app.use(
    "/adminlte",
    express.static(p.join(__dirname, "/node_modules/admin-lte/"))
);

app.use(expressLayouts)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/files', express.static('files'))

/**
 * -------------- SESSION SETUP ----------------
 */

// const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGODB_URL,
//         mongooseConnection: connection,
//         ttl: 14 * 24 * 60 * 60 // save session for 14 days
//     }),
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
//     }
// }));

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
// require('./src/db/passport')(passport);

// app.use(passport.initialize());
// app.use(passport.session());


//----- GENERAL ----
app.get('/', (req, res) => res.redirect('/dashboard'))

//---- Normal api -----
const indexRouter = require('./src/routes/index')
app.use('/api', indexRouter)

//----- Dashboard api -----
const indexRouterDB = require('./src/dashboard/routes/index')
app.use('/dashboard', indexRouterDB)


//----- Error handling -----
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message, code: err.statusCode || 500 });
});


app.listen(process.env.PORT, () => {
    console.log(`Started on port ${process.env.PORT}`);
})