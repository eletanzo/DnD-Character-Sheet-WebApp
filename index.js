// =================================================================================================
// IMPORTS
// =================================================================================================
const fs = require('fs')
require('dotenv').config()
const https = require('https')
const logger = require('morgan')
const express = require('express')
const mongoose = require('mongoose')
const Account = require('./account-model')
// const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
// const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn

// =================================================================================================
// INITIALIZATIONS
// =================================================================================================

const isAuthenticated = (redirect = null) => {
    return (req, res, next) => {
        if (req.session.user) next() // req.session.user set when logging in. If undefined, not logged in
        else { 
            if (redirect) res.redirect(redirect) // redirect on failure if specified,
            else next('route') // otherwise procede to the next overloaded route
        }
        
    }
}

const TIMEOUT_HOURS = 8 // Number of hours before a login session expires
const App = express()

// =================================================================================================
// CONFIGURATIONS
// =================================================================================================

App.set('view engine', 'ejs')

// =================================================================================================
// MIDDLEWARE
// =================================================================================================

App.use(logger('dev'))
App.use(session({ 
    secret: process.env.SESSION_SECRET,
    // name: 'dnd-webapp', // Avoids conflicts between sessions of apps from same domain
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * TIMEOUT_HOURS } // Add secure as well, later when https is required
    // store: Account. ... ({}) // Define a function call here to store the session info in mongoose
}))
App.use(flash())
App.use(express.json())
App.use(express.urlencoded({ extended: true }))
// App.use(passport.initialize())
// App.use(passport.session())
App.use(express.static(__dirname + '/static'))

// Define any values that need to be used by EVERY res.render() call here as part of res.locals
// E.g., loggedIn is used in every .ejs by the header to see if the user is logged in to display the profile icon
App.use((req, res, next) => {
    // Initializing all flash messages
    res.locals.error = req.flash('error')[0]
    res.locals.warning = req.flash('warning')[0]
    res.locals.info = req.flash('info')[0]
    res.locals.success = req.flash('success')[0]
    // Initializing user info
    res.locals.user = {}
    // res.locals.user.isLoggedIn = req.isAuthenticated()
    // if (req.user) { // req.user is attached by passport, and populated with data from mongoose by passport-local-mongoose (e.g., req.user.DOCUMENT_ATTRIBUTE)
        
    // }
    next()
})

// passport.use(Account.createStrategy())
// passport.serializeUser(Account.serializeUser())
// passport.deserializeUser(Account.deserializeUser())


// =================================================================================================
// ROUTING
// =================================================================================================

// GET

// Authorized-only pages
App.get('/a/:authorized_only_page', isAuthenticated('/login'), (req, res) => {
    res.render(`authorized/${authorized_only_page}`, { userInfo: req.user }, (err, html) => {
        if (err) return next(err)
        else res.status(200).send(html)
    })
})

// Redirect default to homepage
App.get('/', (req, res, next) => {
    res.redirect('/home')
})

// Publicly-reachable pages (i.e., no login required)
App.get('/:static_page', (req, res, next) => {
    res.render(`public/${req.params.static_page}`, (err, html) => {
        if (err) return next(err)
        else res.status(200).send(html)
    })
})

// POST

// Register new user
App.post('/register', (req, res, next) => {
    // Account.register(new Account({ username: req.body.username, email: req.body.email }), req.body.password, (err) => {
    //     if (err) return next(err)
    //     else {
    //         req.flash('success', 'Registration successful! Feel free to log in now')
    //         res.redirect('/login')
    //     } 
    // })
    Account.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password // Password is hashed by default from the .pre('save',...) in model
    }, (err, newAccount) => {
        if (err) return next(err)
        req.flash('success', 'Registration successful! Feel free to log in now')
        res.redirect('/login')
    })
})

// Save profile settings
App.post('/save', isAuthenticated('/login'), (req, res, next) => {
    Account.findById(req.user._id, (err, user) => {
        if (err) return next(err)
        user.save().then(_ => {
            res.redirect('/profile')
            res.end()
        })
    })
})

// Log in to existing user
// APP.post('/login', passport.authenticate('local', { 
//     successRedirect: '/login-success',
//     failureRedirect: '/login',
//     failureFlash: true
// }))
App.post('/login', (req, res, next) => {
    req.session.regenerate((err) => {
        if (err) return next(err)
        Account.findOne({ 'username': req.body.username }, (err, account) => {
            if (err) return next(err)
            else if (!account) { // No error but no account means wrong username
                req.flash('error', 'The username you entered is incorrect. Please try again')
                res.redirect('/login')
            } else {
                account.authenticate(req.body.password, (err, passed) => {
                    if (err) return next(err) // if authenticate() failed, it should pass an error, and account should be passed instead
                        // User session info stored under req.session.user object. Check req.session.user for authentication
                    if (passed) {
                        req.session.user = {
                            userid: account._id,
                            username: account.username
                        }
                        req.session.save((err) => {
                            if (err) return next(err)
                            req.flash('success', `You're all logged in!`)
                            res.redirect('/home')
                        })
                    } else {
                        req.flash('error', 'The password you entered is incorrect. Please try again')
                        res.redirect('/login')
                    }
                })
            }
            
        })
        
    })
})


// Log out from logged in user
App.post('/logout', isAuthenticated('/login'), (req, res, next) => {
    req.logout( (err) => {
        if (err) return next(err)
        else res.redirect('/')
    })
})

// =================================================================================================
// ERROR HANDLING
// =================================================================================================

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
        if (err.code === 11000) { // duplicate key error code. Something unique already exists in the database, so warn the user
            req.flash('error', `A user with the ${Object.keys(err.keyPattern)[0]} ${Object.values(err.keyValue)[0]} is already registered`)
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

// App.use(passportLocalMongooseErrorHandler)
App.use(mongooseErrorHandler)
App.use(clientErrorHandler)
App.use(serverErrorHandler)
App.use(errorHandler)

// =================================================================================================
// STARTUP
// =================================================================================================
try {
    var listener = https.createServer({
        key: fs.readFileSync('SSL/server.key'),
        cert: fs.readFileSync('SSL/server.cert')
    }, App).listen(process.env.PORT | 8080, () => {
        console.log(`Listening on port ${listener.address().port}`)
    })
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Could not find SSL certificate or key; running in http (UNENCRYPTED, DO NOT RUN IN PRODUCTION THIS WAY)')
        var listener = App.listen(process.env.PORT | 8080, () => {
            console.log(`Listening on port ${listener.address().port}`)
        })
    }
}


module.exports.app = App

