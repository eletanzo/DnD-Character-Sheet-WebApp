// IMPORTS

const express = require('express')
const { 
    homeView,
    error404View,
    loginView,
    registerView,
    characterView,
    loginProcess,
    registerProcess
} = require('../controllers/controller')

// INITIALIZATIONS

const isAuthenticated = (redirect = null) => {
    return (req, res, next) => {
        if (req.session.user) next() // req.session.user set when logging in. If undefined, not logged in
        else { 
            if (redirect) res.redirect(redirect) // redirect on failure if specified,
            else next('route') // otherwise procede to the next overloaded route
        }
        
    }
}

const router = express.Router()


// ROUTES

// GET routes
router.get('/', homeView)
router.get('/home', homeView)
// router.get('/error', error404View)
router.get('/login', loginView)
router.get('/register', registerView)
router.get('/character', isAuthenticated('/login'), characterView) // Authenticated-only
// Last resort 404
router.get('*', error404View)
// POST routes
router.post('/login', loginProcess)
router.post('/register', registerProcess)

// EXPORT

module.exports = router