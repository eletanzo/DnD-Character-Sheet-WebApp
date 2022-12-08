// =================================================================================================
// IMPORTS
// =================================================================================================
const fs = require('fs')
require('dotenv').config()
const https = require('https')
const logger = require('morgan')
const express = require('express')
const mongoose = require('mongoose')
const Account = require('./account')
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn

// =================================================================================================
// INITIALIZATIONS
// =================================================================================================



const TIMEOUT_HOURS = 8 // Number of hours before a login session expires
const APP = express()

// =================================================================================================
// CONFIGURATIONS
// =================================================================================================

APP.set('view engine', 'ejs')

// =================================================================================================
// MIDDLEWARE
// =================================================================================================

APP.use(logger('dev'))
APP.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * TIMEOUT_HOURS } 
}))
APP.use(flash())
APP.use(express.json())
APP.use(express.urlencoded({ extended: true }))
APP.use(passport.initialize())
APP.use(passport.session())
APP.use(express.static(__dirname + '/static'))

// Define any values that need to be used by EVERY res.render() call here as part of res.locals
// E.g., loggedIn is used in every .ejs by the header to see if the user is logged in to display the profile icon
APP.use((req, res, next) => {
    // Initializing all flash messages
    res.locals.error = req.flash('error')[0]
    res.locals.warning = req.flash('warning')[0]
    res.locals.info = req.flash('info')[0]
    res.locals.success = req.flash('success')[0]
    // Initializing user info
    res.locals.user = {}
    res.locals.user.isLoggedIn = req.isAuthenticated()
    if (req.user) { // req.user is attached by passport, and populated with data from mongoose by passport-local-mongoose (e.g., req.user.DOCUMENT_ATTRIBUTE)
        
    }
    next()
})

passport.use(Account.createStrategy())
passport.serializeUser(Account.serializeUser())
passport.deserializeUser(Account.deserializeUser())


// =================================================================================================
// ROUTING
// =================================================================================================

// GET

// Authorized-only pages
APP.get('/a/:authorized_only_page', ensureLoggedIn(), (req, res) => {
    res.render(`authorized/${authorized_only_page}`, { userInfo: req.user }, (err, html) => {
        if (err) return next(err)
        else res.status(200).send(html)
    })
})

// Redirect default to homepage
APP.get('/', (req, res, next) => {
    res.redirect('/home')
})

// Publicly-reachable pages (i.e., no login required)
APP.get('/:static_page', (req, res, next) => {
    res.render(`public/${req.params.static_page}`, (err, html) => {
        if (err) return next(err)
        else res.status(200).send(html)
    })
})

// POST

// Register new user
APP.post('/register', (req, res, next) => {
    Account.register(new Account({ username: req.body.username, email: req.body.email }), req.body.password, (err) => {
        if (err) return next(err)
        else {
            req.flash('success', 'Registration successful! Feel free to log in now')
            res.redirect('/login')
        } 
    })
})

// Save profile settings
APP.post('/save', ensureLoggedIn(), (req, res, next) => {
    Account.findById(req.user._id, (err, user) => {
        if (err) return next(err)
        user.save().then(_ => {
            res.redirect('/profile')
            res.end()
        })
    })
})

// Log in to existing user
APP.post('/login', passport.authenticate('local', { 
    successRedirect: '/login-success',
    failureRedirect: '/login',
    failureFlash: true
}))

// Log out from logged in user
APP.post('/logout', ensureLoggedIn(), (req, res, next) => {
    req.logout( (err) => {
        if (err) return next(err)
        else res.redirect('/')
    })
})

// =================================================================================================
// ERROR HANDLING
// =================================================================================================

// Passport-local-mongoose Errors, common with user registration or login
const passportLocalMongooseErrorHandler = function(err, req, res, next) {
    if (err.name === 'UserExistsError') {
        req.flash('error', err.message)
        res.redirect('/register') // Needs to send 409 - already exists
        err.status = 409
    }
    return next(err)
    
}

// Mongo errors, typically raised from database data validation errors
const mongooseErrorHandler = function(err, req, res, next) {
    if (err instanceof mongoose.Error.ValidationError) { // Mongoose validation error
        if (err.errors.email) { // Mongoose email error exists
            req.flash('error', err.errors.email.message)
            res.redirect('/register') // Needs to send 400 - malformed form data
            err.status = 400
        }
    } else if (err.name === 'MongoServerError') { // Mongo server errors specifically
        console.log("MongoServerError caught")
        if (err.code === 11000) { // duplicate key error code. Email is the key index, so duplicate email
            req.flash('error', 'A user with the given email is already registered')
            res.redirect('/register') // Needs to send 409 - already exists
            err.status = 409
        } 

    }
    return next(err)

}

// Client-side errors
const clientErrorHandler = function(err, req, res, next) {
    // Handling missing page from ejs (God why can't they just make an error type that extends error...)
    if (err.message.includes('Failed to lookup view')) { err.status = 404 }
    // No clue what this error is
    else if (req.xhr) { 
        err.status = 500 
    }
    return next(err)
}

// Catch server-side errors (e.g., ReferenceError)
const serverErrorHandler = function(err, req, res, next) {
    if (err instanceof ReferenceError) {
        err.status = 500
    }
    else return next(err)
}

// Catch-all error handler to render error pages
const errorHandler = function(err, req, res, next) {
    console.log("ERRORHANDLER CAUGHT:" + err + '\n' + JSON.stringify(err))
    res.status(err.status || 500)
    res.render('public/error', {
        code: res.statusCode
    })
}

APP.use(passportLocalMongooseErrorHandler)
APP.use(mongooseErrorHandler)
APP.use(clientErrorHandler)
APP.use(serverErrorHandler)
APP.use(errorHandler)

// =================================================================================================
// STARTUP
// =================================================================================================
try {
    var listener = https.createServer({
        key: fs.readFileSync('SSL/server.key'),
        cert: fs.readFileSync('SSL/server.cert')
    }, APP).listen(process.env.PORT | 8080, () => {
        console.log(`Listening on port ${listener.address().port}`)
    })
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Could not find SSL certificate or key; running in http (UNENCRYPTED, DO NOT RUN IN PRODUCTION THIS WAY)')
        var listener = APP.listen(process.env.PORT | 8080, () => {
            console.log(`Listening on port ${listener.address().port}`)
        })
    }
}


module.exports.app = APP

