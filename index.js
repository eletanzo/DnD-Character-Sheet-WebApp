// =================================================================================================
// IMPORTS
// =================================================================================================

const fs = require('fs')
require('dotenv').config()
const https = require('https')
const logger = require('morgan')
const express = require('express')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
// const Account = require('./models/account-model')

// =================================================================================================
// INITIALIZATIONS
// =================================================================================================

const TIMEOUT_HOURS = 1 // Number of hours before a login session expires
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
    name: 'dnd-webapp', // Avoids conflicts between sessions of apps from same domain
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * TIMEOUT_HOURS } // Add secure as well, later when https is required
    // store: Account. ... ({}) // Define a function call here to store the session info in mongoose
}))
App.use(flash())
App.use(express.json())
App.use(express.urlencoded({ extended: true }))
App.use(express.static(__dirname + '/static'))

App.use((req, res, next) => {
    res.locals.error = req.flash('error')[0]
    res.locals.warning = req.flash('warning')[0]
    res.locals.info = req.flash('info')[0]
    res.locals.success = req.flash('success')[0]

    res.locals.user = {}
    res.locals.user.isLoggedIn = (!!req.session.user)

    next()
})

// =================================================================================================
// ROUTING
// =================================================================================================

App.use('/', require('./routes/router'))

// =================================================================================================
// ERROR HANDLING
// =================================================================================================

App.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send('Sorry! Server encountered an unexpected error. Error code: ' + res.statusCode)
    console.log('ERROR HANDLER CAUGHT:')
    console.log(err)
})

// =================================================================================================
// STARTUP
// =================================================================================================

try {
    var listener = https.createServer({
        key: fs.readFileSync('SSL/server.key'),
        cert: fs.readFileSync('SSL/server.cert')
    }, App).listen(process.env.PORT || 8080, () => {
        console.log(`Listening on port ${listener.address().port}`)
    })
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('Could not find SSL certificate or key; running in http (UNENCRYPTED, DO NOT RUN IN PRODUCTION THIS WAY)')
        var listener = App.listen(process.env.PORT || 8080, () => {
            console.log(`Listening on port ${listener.address().port}`)
        })
    } else { throw(err) }
}

module.exports.app = App