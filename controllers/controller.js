const Account = require('../models/account-model')

const render = (res, root_page_path, title, options={}) => {
    res.render('frame', { page: root_page_path, title: title, options: options}, (err, html) => {
        if (err) throw err
        else res.status(200).send(html)
    })
}

// Publicly-available views
const homeView = (req, res, next) => { render(res, 'content/home', 'Home'); next() }
const loginView = (req, res, next) => { render(res, 'content/login', 'Login'); next() }
const registerView = (req, res, next) => { render(res, 'content/register', 'Register'); next() }

const error404View = (req, res, next) => { 
    res.render('frame', { page: 'content/error', title: '404 Error!', options: { code: 404 }}, (err, html) => {
        if (err) throw err
        else res.status(404).send(html)
    })
    next() 
}

// Authenticated-only views
const characterView = (req, res, next) => { render(res, 'auth/character', 'Character Sheet')}

const loginProcess = (req, res, next) => {
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
                            res.redirect('/')
                        })
                    } else {
                        req.flash('error', 'The password you entered is incorrect. Please try again')
                        res.redirect('/login')
                    }
                })
            }
            
        })
        
    })
}

const registerProcess = (req, res, next) => {
    Account.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password // Password is hashed by default from the .pre('save',...) in model
    }, (err, newAccount) => {
        if (err) return next(err)
        req.flash('success', 'Registration successful! Feel free to log in now')
        res.redirect('/login')
    })
}

module.exports = {
    homeView,
    error404View,
    loginView,
    registerView,
    characterView,
    loginProcess,
    registerProcess
}